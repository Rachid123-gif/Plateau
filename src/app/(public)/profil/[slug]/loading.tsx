export default function ProfileLoading() {
  return (
    <div className="bg-zinc-950 min-h-[100dvh]">
      <section className="py-16 border-b border-zinc-800">
        <div className="container mx-auto max-w-[1380px] px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <div className="aspect-[3/4] rounded-3xl bg-zinc-900 border border-zinc-800 animate-shimmer" />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <div className="h-3 w-32 rounded-full bg-zinc-900 animate-shimmer" />
              <div className="h-14 w-full rounded-2xl bg-zinc-900 animate-shimmer" />
              <div className="h-14 w-4/5 rounded-2xl bg-zinc-900 animate-shimmer" />
              <div className="h-5 w-2/3 rounded-full bg-zinc-900 animate-shimmer" />
              <div className="h-24 w-full rounded-2xl bg-zinc-900 animate-shimmer mt-8" />
              <div className="flex gap-3">
                <div className="h-12 w-40 rounded-full bg-zinc-900 animate-shimmer" />
                <div className="h-12 w-32 rounded-full bg-zinc-900 animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
