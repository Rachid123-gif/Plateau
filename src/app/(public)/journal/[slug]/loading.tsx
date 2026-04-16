export default function ArticleLoading() {
  return (
    <div className="bg-zinc-950 min-h-[100dvh]">
      <section className="py-16 border-b border-zinc-800">
        <div className="container mx-auto max-w-3xl px-6 space-y-6">
          <div className="h-3 w-32 rounded-full bg-zinc-900 animate-shimmer" />
          <div className="h-14 w-full rounded-2xl bg-zinc-900 animate-shimmer" />
          <div className="h-14 w-3/4 rounded-2xl bg-zinc-900 animate-shimmer" />
          <div className="h-6 w-full rounded-full bg-zinc-900 animate-shimmer mt-8" />
          <div className="h-6 w-5/6 rounded-full bg-zinc-900 animate-shimmer" />
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-6 py-12">
        <div className="aspect-[16/9] rounded-3xl bg-zinc-900 border border-zinc-800 animate-shimmer" />
      </div>

      <div className="container mx-auto max-w-[68ch] px-6 py-12 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-5 rounded-full bg-zinc-900 animate-shimmer"
            style={{
              width: `${70 + Math.random() * 30}%`,
              animationDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
