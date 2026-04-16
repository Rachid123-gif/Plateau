export default function DashboardLoading() {
  return (
    <div className="bg-zinc-950 min-h-[100dvh] p-10 space-y-8">
      <div className="h-3 w-40 rounded-full bg-zinc-900 animate-shimmer" />
      <div className="h-12 w-2/3 rounded-2xl bg-zinc-900 animate-shimmer" />
      <div className="h-40 w-full rounded-3xl bg-zinc-900 border border-zinc-800 animate-shimmer" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-3xl bg-zinc-900 border border-zinc-800 animate-shimmer"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
