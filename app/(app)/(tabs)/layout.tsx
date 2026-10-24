import { BottomNav } from "@/components/layout/bottom-nav";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col pb-24 lg:pb-0">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
