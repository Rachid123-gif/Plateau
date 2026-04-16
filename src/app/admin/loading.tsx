export default function AdminLoading() {
  return (
    <div className="bg-zinc-950 min-h-[100dvh] p-10 space-y-8">
      <div className="h-3 w-40 rounded-full bg-zinc-900 animate-shimmer" />
      <div className="h-12 w-1/2 rounded-2xl bg-zinc-900 animate-shimmer" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-zinc-900 border border-zinc-800 animate-shimmer"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-zinc-900 border border-zinc-800 animate-shimmer" />
    </div>
  );
}
