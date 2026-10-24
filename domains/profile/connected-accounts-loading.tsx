export function ConnectedAccountsFallback() {
  return (
    <div className="mx-auto flex w-full max-w-sm lg:max-w-6xl xl:max-w-7xl flex-1 flex-col gap-8 px-6 lg:px-12 py-8 lg:py-12 animate-pulse">
      <div className="h-4 w-48 bg-muted rounded hidden lg:block" />
      <div className="h-10 w-64 bg-muted rounded-xl" />
      <div className="h-4 w-96 bg-muted/60 rounded" />
      <div className="flex flex-col gap-4 max-w-xl pt-4">
        <div className="h-20 bg-muted/40 rounded-2xl" />
        <div className="h-20 bg-muted/40 rounded-2xl" />
        <div className="h-20 bg-muted/40 rounded-2xl" />
      </div>
    </div>
  );
}

export default function ConnectedAccountsLoading() {
  return <ConnectedAccountsFallback />;
}
