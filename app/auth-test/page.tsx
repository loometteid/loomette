import { GoogleSignInButton } from "@/components/features/auth/google-sign-in-button";
import { SignInForm } from "@/components/features/auth/sign-in-form";
import { SignOutButton } from "@/components/features/auth/sign-out-button";
import { SignUpForm } from "@/components/features/auth/sign-up-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AuthTestPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto flex max-w-sm flex-col gap-8 p-6">
        <h1 className="text-lg font-medium">Auth test</h1>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Sign up</h2>
          <SignUpForm />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Sign in</h2>
          <SignInForm />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Or</h2>
          <GoogleSignInButton />
        </section>
      </main>
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("user")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 p-6">
      <h1 className="text-lg font-medium">Auth test</h1>

      <section className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">auth.users</h2>
        <pre className="bg-muted overflow-x-auto rounded-lg p-3 text-xs">
          {JSON.stringify(
            { id: user.id, email: user.email, created_at: user.created_at },
            null,
            2,
          )}
        </pre>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">public.user (via trigger)</h2>
        <pre className="bg-muted overflow-x-auto rounded-lg p-3 text-xs">
          {profileError
            ? `Error: ${profileError.message}`
            : JSON.stringify(profile, null, 2)}
        </pre>
      </section>

      <SignOutButton />
    </main>
  );
}
