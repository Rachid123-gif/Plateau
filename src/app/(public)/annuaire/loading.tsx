export default function AnnuaireLoading() {
  return (
    <div className="bg-zinc-950 min-h-[80vh]">
      {/* Hero skeleton */}
      <section className="border-b border-zinc-800 py-12 lg:py-16">
        <div className="container mx-auto max-w-[1480px] px-6 lg:px-10 space-y-6">
          <div className="h-3 w-32 rounded-full bg-zinc-900 animate-shimmer" />
          <div className="h-14 w-3/4 rounded-2xl bg-zinc-900 animate-shimmer" />
          <div className="h-6 w-1/2 rounded-full bg-zinc-900 animate-shimmer" />
          <div className="h-16 w-full max-w-2xl rounded-full bg-zinc-900 animate-shimmer mt-8" />
        </div>
      </section>

      {/* Filters bar skeleton */}
      <div className="border-b border-zinc-800 py-4">
        <div className="container mx-auto max-w-[1480px] px-6 lg:px-10 flex gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-28 rounded-full bg-zinc-900 shrink-0 animate-shimmer" />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <section className="py-12">
        <div className="container mx-auto max-w-[1480px] px-6 lg:px-10">
          <div className="h-4 w-40 rounded-full bg-zinc-900 animate-shimmer mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative animate-shimmer"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
                  <div className="h-3 w-20 rounded-full bg-zinc-800" />
                  <div className="h-5 w-3/4 rounded-full bg-zinc-800" />
                  <div className="h-3 w-1/2 rounded-full bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
