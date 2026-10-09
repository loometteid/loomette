import { redirect } from "next/navigation";
import { AuthPage } from "@/domains/auth/auth-page";

export default async function WelcomePage(props: {
  searchParams?: Promise<{ auth?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  if (searchParams?.auth === "true") {
    return <AuthPage />;
  }
  redirect("/waitlist");
}
