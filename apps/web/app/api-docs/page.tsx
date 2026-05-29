export default function ApiDocsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold">API</h1>
      <div className="mt-8 space-y-5 leading-7 text-zinc-300">
        <p>
          Public API access is planned. The internal conversion API currently supports multipart uploads, batch uploads,
          status polling, streaming downloads, and manual purge calls.
        </p>
        <p>
          Local defaults allow 100MB per file, 20 files per batch, 250MB total batch upload size, 500MB converted output,
          and 3 active conversions per batch.
        </p>
        <p>Rate-limited requests return HTTP 429 with a Retry-After header.</p>
      </div>
    </main>
  );
}
