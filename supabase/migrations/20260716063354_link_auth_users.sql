-- Link public.user to auth.users, and auto-provision/maintain the profile
-- row via triggers. See .claude/database.md for the full rationale.

alter table public."user"
  alter column user_id drop default;

alter table public."user"
  add constraint user_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

-- Creates a public.user row whenever a new auth.users row is inserted.
-- SECURITY DEFINER + explicit empty search_path: required so this function
-- can write to public.user regardless of the caller's RLS grants, and to
-- prevent search_path hijacking (a documented Postgres/Supabase pitfall for
-- SECURITY DEFINER functions).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
  final_username text;
  attempt int := 0;
begin
  base_username := regexp_replace(lower(split_part(coalesce(new.email, new.id::text), '@', 1)), '[^a-z0-9_]', '', 'g');
  if base_username = '' then
    base_username := 'user';
  end if;

  final_username := base_username;

  loop
    begin
      insert into public."user" (user_id, username, email, profile_photo)
      values (
        new.id,
        final_username,
        new.email,
        new.raw_user_meta_data ->> 'avatar_url'
      );
      exit;
    exception when unique_violation then
      attempt := attempt + 1;
      final_username := base_username || '_' || substr(replace(new.id::text, '-', ''), 1, 6);
      if attempt > 5 then
        raise exception 'Could not generate a unique username for %', new.email;
      end if;
    end;
  end loop;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- GoTrue inserts into auth.users as the supabase_auth_admin role, not
-- postgres/service_role — the baseline migration's default-privilege grants
-- don't cover it, so without this the trigger would silently fail signups.
grant execute on function public.handle_new_user() to supabase_auth_admin;

-- Keeps public.user.email in sync after Supabase Auth's email-change flow.
-- Deliberately does NOT resync profile_photo/other metadata on every auth
-- update — that would silently clobber an in-app profile edit once users
-- can update their own photo.
create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public."user"
  set email = new.email
  where user_id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update on auth.users
  for each row
  when (new.email is distinct from old.email)
  execute procedure public.handle_user_email_update();

grant execute on function public.handle_user_email_update() to supabase_auth_admin;
