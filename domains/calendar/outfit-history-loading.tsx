export function OutfitHistoryFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm lg:max-w-6xl flex-1 flex-col gap-6 lg:gap-8 px-6 lg:px-12 py-8 lg:py-12 animate-pulse">
      <div className="size-10 rounded-xl bg-secondary lg:hidden" />
      <div className="h-8 w-64 rounded bg-secondary" />
      <div className="flex gap-3">
        <div className="h-9 w-28 rounded-full bg-secondary" />
        <div className="h-9 w-28 rounded-full bg-secondary" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-3/4 rounded-3xl bg-secondary" />
        ))}
      </div>
    </main>
  );
}
