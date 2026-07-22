import { redirect } from "next/navigation";
import { BottomNav } from "@/components/features/navigation/bottom-nav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col pb-24">{children}</div>
      <BottomNav />
    </>
  );
}
