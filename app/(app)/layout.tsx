import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("user")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle();
    username = data?.username ?? null;
  }

  return (
    <>
      <DesktopNav username={username} />
      <div className="flex min-h-full flex-1 flex-col pb-24 lg:pb-8">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
