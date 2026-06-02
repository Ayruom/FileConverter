export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold">About All Files Convertor</h1>
      <div className="mt-8 space-y-7 leading-7 text-zinc-300">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">What we build</h2>
          <p>
            All Files Convertor is a professional file conversion service for PDFs, images, Office documents,
            spreadsheets, text, and web formats. The product is built around a direct workflow: upload a file, choose the
            output format, download the converted result, and let temporary files be cleaned up automatically.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Who is behind it</h2>
          <p>
            All Files Convertor is developed by Ayroum under the All Files Convertor company name. The project focuses on
            practical conversion tools that are easy to access, reliable under real usage, and clear about how files are
            handled.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">How the service is designed</h2>
          <p>
            The current platform uses guarded batch processing, conversion limits, rate limiting, temporary job storage,
            and scheduled cleanup to keep the service stable. Files are processed only for the requested conversion and
            are not intended to become permanent storage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p>
            For support, feedback, partnership questions, privacy concerns, or anything related to All Files Convertor,
            contact Ayroum at{" "}
            <a href="mailto:Ayruom.Dev@gmail.com" className="text-accent2 hover:text-white">
              Ayruom.Dev@gmail.com
            </a>
            .
          </p>
          <p>
            Project repository:{" "}
            <a
              href="https://github.com/Ayruom/FileConverter"
              className="text-accent2 hover:text-white"
              rel="noreferrer"
              target="_blank"
            >
              Ayruom/FileConverter
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
