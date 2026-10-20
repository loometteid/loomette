export function SocialProfileFallback() {
  return (
    <div className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12 animate-pulse">
      <div className="h-4 w-36 bg-muted rounded" />
      <div className="flex items-center gap-6">
        <div className="size-28 lg:size-36 rounded-3xl bg-muted" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6">
        <div className="h-64 bg-muted/60 rounded-2xl" />
        <div className="h-64 bg-muted/60 rounded-2xl" />
        <div className="h-64 bg-muted/60 rounded-2xl" />
        <div className="h-64 bg-muted/60 rounded-2xl" />
      </div>
    </div>
  );
}

export default function SocialProfileLoading() {
  return <SocialProfileFallback />;
}
