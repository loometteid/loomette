export function PricingFallback() {
  return (
    <div className="mx-auto flex w-full max-w-sm lg:max-w-5xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12 animate-pulse">
      <div className="h-4 w-32 bg-muted rounded" />
      <div className="h-10 w-48 bg-muted rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="h-80 bg-muted/50 rounded-3xl" />
        <div className="h-80 bg-muted/50 rounded-3xl" />
      </div>
    </div>
  );
}

export default function PricingLoading() {
  return <PricingFallback />;
}
