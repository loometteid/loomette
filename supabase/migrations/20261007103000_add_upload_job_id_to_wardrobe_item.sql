-- Migration: Add upload_job_id foreign key to wardrobe_item
-- Allows querying all extracted wardrobe items produced by a specific upload_job

alter table public.wardrobe_item
  add column if not exists upload_job_id uuid references public.upload_job(id) on delete set null;

create index if not exists wardrobe_item_upload_job_id_idx
  on public.wardrobe_item(upload_job_id);
