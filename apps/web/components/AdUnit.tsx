export function AdUnit({ slot = "0000000000" }: { slot?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <aside className="mx-auto w-full max-w-5xl rounded-lg border border-border bg-surface/70 px-5 py-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted">Sponsored</div>
      {client ? (
        <ins
          className="adsbygoogle block min-h-20"
          data-ad-client={client}
          data-ad-format="auto"
          data-ad-slot={slot}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex min-h-20 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted">
          Sponsor slot available
        </div>
      )}
    </aside>
  );
}
