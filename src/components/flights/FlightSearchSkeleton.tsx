export default function FlightSearchSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="overflow-hidden rounded-3xl border border-purple-100 bg-white p-4 shadow-sm md:p-5"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex w-full items-center gap-3 md:w-44">
              <div className="flight-skel h-11 w-11 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flight-skel h-3.5 w-28 rounded-full" />
                <div className="flight-skel h-2.5 w-16 rounded-full" />
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-[4.5rem] space-y-2">
                  <div className="flight-skel mx-auto h-6 w-12 rounded-lg" />
                  <div className="flight-skel mx-auto h-2.5 w-8 rounded-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flight-skel mx-auto mb-2 h-2 w-16 rounded-full" />
                  <div className="relative h-px bg-purple-100">
                    <div className="flight-skel-plane absolute start-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400" />
                  </div>
                  <div className="flight-skel mx-auto mt-2 h-2 w-20 rounded-full" />
                </div>
                <div className="w-[4.5rem] space-y-2">
                  <div className="flight-skel mx-auto h-6 w-12 rounded-lg" />
                  <div className="flight-skel mx-auto h-2.5 w-8 rounded-full" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flight-skel h-5 w-14 rounded-full" />
                <div className="flight-skel h-5 w-16 rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 md:w-52 md:flex-col md:items-end md:border-t-0 md:pt-0">
              <div className="space-y-2 md:text-end">
                <div className="flight-skel h-7 w-24 rounded-lg" />
                <div className="flight-skel h-2.5 w-16 rounded-full" />
              </div>
              <div className="flex gap-2">
                <div className="flight-skel h-9 w-20 rounded-xl" />
                <div className="flight-skel h-9 w-24 rounded-xl bg-amber-400/30" />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
