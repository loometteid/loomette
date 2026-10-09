export function OutfitDetailsFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12 animate-pulse">
      <div className="size-10 rounded-xl bg-secondary lg:hidden" />
      <div className="h-8 w-48 rounded bg-secondary" />
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 pt-4">
        <div className="w-[280px] aspect-5/6 rounded-2xl bg-secondary" />
        <div className="hidden lg:block w-[280px] aspect-5/6 rounded-2xl bg-secondary" />
      </div>
    </main>
  );
}
