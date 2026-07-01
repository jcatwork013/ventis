export default function Loading() {
  return (
    <div className="pt-32">
      <div className="shell animate-pulse">
        <div className="h-3 w-24 bg-line" />
        <div className="mt-6 h-12 w-2/3 bg-bg-elev" />
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/5] bg-bg-elev" />
              <div className="mt-4 h-3 w-1/2 bg-line" />
              <div className="mt-3 h-5 w-3/4 bg-bg-elev" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
