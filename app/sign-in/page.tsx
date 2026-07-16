import Link from "next/link";
import { GoogleSignInButton } from "@/components/features/auth/google-sign-in-button";
import { SignInForm } from "@/components/features/auth/sign-in-form";
import { Typography } from "@/components/ui/typography";

export default function SignInPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <Typography variant="title" as="h1">
        Welcome back
      </Typography>

      <SignInForm />

      <div className="flex items-center gap-3 text-xs tracking-wide text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton />

      <Typography variant="subtitle" className="text-center">
        New here?{" "}
        <Link href="/sign-up" className="font-bold underline">
          Register
        </Link>
      </Typography>
    </main>
  );
}
