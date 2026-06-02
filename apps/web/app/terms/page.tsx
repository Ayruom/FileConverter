export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted">Last updated: June 1, 2026</p>
      <div className="mt-8 space-y-7 leading-7 text-zinc-300">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Using All Files Convertor</h2>
          <p>
            All Files Convertor is a file conversion utility for supported documents, images, PDFs, spreadsheets, and
            web file formats. By using the service, you agree to use it responsibly and only with files you are allowed to
            process.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Your files and responsibility</h2>
          <p>
            You are responsible for the files you upload, the rights needed to convert them, and how you use the
            converted output. Do not upload confidential, regulated, illegal, harmful, or copyrighted material unless you
            have the right and authority to process it through this service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Prohibited use</h2>
          <p>
            Do not upload malware, attempt to disrupt the service, bypass limits, overload the conversion system, probe
            for vulnerabilities, or use the service for unlawful, abusive, deceptive, or harmful activity.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Limits and availability</h2>
          <p>
            Uploads and conversions are subject to file size, batch size, output size, timeout, cleanup, and rate limits.
            These limits may change as the project evolves. The service may pause, reject, or remove jobs to protect
            reliability and security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Conversion quality</h2>
          <p>
            Conversions are provided on a best-effort basis. Results can vary because of source file quality, damaged
            files, embedded fonts, unsupported features, password protection, complex layouts, and format limitations.
            Always review downloaded files before relying on them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">No warranty</h2>
          <p>
            The service is provided as is and as available. All Files Convertor does not guarantee uninterrupted access,
            perfect conversion output, or recovery of uploaded or converted files after cleanup.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Changes</h2>
          <p>
            These terms may be updated as the project changes. Continued use of the service after updates means you
            accept the revised terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p>
            For questions about these terms or the service, contact Ayroum at{" "}
            <a href="mailto:Ayruom.Dev@gmail.com" className="text-accent2 hover:text-white">
              Ayruom.Dev@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
