import Link from "next/link";
import { GoogleSignInButton } from "@/components/features/auth/google-sign-in-button";
import { SignUpForm } from "@/components/features/auth/sign-up-form";
import { Typography } from "@/components/ui/typography";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <Typography variant="title" as="h1">
        Create your account
      </Typography>

      <SignUpForm />

      <div className="flex items-center gap-3 text-xs tracking-wide text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton />

      <Typography variant="subtitle" className="text-center">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-bold underline">
          Sign in
        </Link>
      </Typography>
    </main>
  );
}
