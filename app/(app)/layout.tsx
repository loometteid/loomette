import { BottomNav } from "@/components/features/navigation/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col pb-24">{children}</div>
      <BottomNav />
    </>
  );
}
