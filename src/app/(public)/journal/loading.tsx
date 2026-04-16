export default function JournalLoading() {
  return (
    <div className="bg-zinc-950 min-h-[80vh]">
      <section className="border-b border-zinc-800 py-16">
        <div className="container mx-auto max-w-[1380px] px-6 lg:px-10 space-y-6">
          <div className="h-3 w-40 rounded-full bg-zinc-900 animate-shimmer" />
          <div className="h-16 w-4/5 rounded-2xl bg-zinc-900 animate-shimmer" />
          <div className="h-5 w-2/3 rounded-full bg-zinc-900 animate-shimmer" />
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-[1380px] px-6 lg:px-10">
          {/* Featured skeleton */}
          <div className="aspect-[16/7] rounded-3xl bg-zinc-900 border border-zinc-800 animate-shimmer mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden animate-shimmer"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-[16/9] bg-zinc-800" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-24 rounded-full bg-zinc-800" />
                  <div className="h-6 w-3/4 rounded-full bg-zinc-800" />
                  <div className="h-4 w-full rounded-full bg-zinc-800" />
                  <div className="h-4 w-1/2 rounded-full bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
