export function RecommendationFallback() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8 animate-pulse">
      <div className="size-10 rounded-xl bg-secondary" />
      <div className="h-8 w-48 rounded bg-secondary" />
      <div className="mx-auto h-96 w-64 rounded-2xl bg-secondary my-2" />
      <div className="flex gap-3">
        <div className="h-11 flex-1 rounded-full bg-secondary" />
        <div className="h-11 flex-1 rounded-full bg-secondary" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-4">
        <div className="aspect-square rounded-2xl bg-secondary" />
        <div className="aspect-square rounded-2xl bg-secondary" />
      </div>
    </main>
  );
}
