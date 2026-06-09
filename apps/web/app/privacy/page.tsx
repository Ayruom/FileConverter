export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted">Last updated: June 10, 2026</p>
      <div className="mt-8 space-y-7 leading-7 text-zinc-300">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">What this service does</h2>
          <p>
            All Files Convertor lets you upload files, convert them to another supported format, and download the
            converted result. The service is designed for temporary processing, not file hosting or long-term storage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Files you upload</h2>
          <p>
            Uploaded files are used only to complete the conversion you request. They are processed in temporary working
            folders and are not meant to be kept permanently. Converted files are removed after download or after the
            configured cleanup window expires.
          </p>
          <p>
            The current project defaults keep completed jobs for about 10 minutes and remove abandoned temporary folders
            after about 60 minutes. These windows may be adjusted to keep the service reliable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Operational data</h2>
          <p>
            File contents are not logged. The service may use technical data such as IP address, request time, file size,
            selected conversion type, job status, and error details to run conversions, prevent abuse, measure popular
            tools, and keep the service available.
          </p>
          <p>
            IP addresses may be used for rate limiting and operational protection. In production, the Redis rate limiter
            hashes IP addresses before storing rate-limit keys, and those keys expire within the configured retention
            window.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Controller and contact</h2>
          <p>
            The service operator and data controller contact is Ayruom. For privacy requests, deletion questions, or
            security reports, email{" "}
            <a href="mailto:Ayruom.Dev@gmail.com" className="text-accent2 hover:text-white">
              Ayruom.Dev@gmail.com
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Cookies, ads, and analytics</h2>
          <p>
            All Files Convertor does not require accounts. A cookie may be stored to remember cookie consent. If ads are
            enabled, Google AdSense may set cookies or use similar technologies for advertising. If privacy-friendly
            analytics are enabled, they are used to understand traffic and service health.
          </p>
          <p>
            To change cookie preferences, clear the cookie named{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">all-files-convertor-cookie-consent</code> in your
            browser for this site and reload the page.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Sharing and selling data</h2>
          <p>
            All Files Convertor does not sell your files or personal data. Files may pass through infrastructure providers
            that host, store, secure, or deliver the service, but only as needed to operate the conversion workflow.
          </p>
          <p>
            Current subprocessors may include hosting/container infrastructure, Redis-compatible data services, object
            storage if enabled, Sentry for error monitoring if configured, Plausible for analytics if configured, and
            Google AdSense if ads are enabled.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Your choices</h2>
          <p>
            Do not upload files that you do not want processed by the service. If you need help with privacy questions,
            deletion concerns, or a report about the service, contact Ayroum at{" "}
            <a href="mailto:Ayruom.Dev@gmail.com" className="text-accent2 hover:text-white">
              Ayruom.Dev@gmail.com
            </a>
            .
          </p>
          <p>
            You can request deletion support for active or recently completed jobs. Because conversion files are
            temporary, expired or already-cleaned files may no longer be recoverable or separately deletable.
          </p>
        </section>
      </div>
    </main>
  );
}
