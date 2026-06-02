import Link from "next/link";

const contactEmail = "Ayruom.Dev@gmail.com";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 text-sm text-muted sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-semibold text-white">All Files Convertor</p>
          <p className="mt-3 max-w-md leading-6">
            Professional file conversion built by Ayroum with privacy, practical limits, and temporary processing at the
            center of the product.
          </p>
        </div>

        <div>
          <p className="font-semibold text-white">Company</p>
          <nav className="mt-3 flex flex-col gap-2">
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </nav>
        </div>

        <div>
          <p className="font-semibold text-white">Contact</p>
          <div className="mt-3 flex flex-col gap-2">
            <a href={`mailto:${contactEmail}`} className="hover:text-white">
              {contactEmail}
            </a>
            <a
              href="https://github.com/Ayruom/FileConverter"
              className="hover:text-white"
              rel="noreferrer"
              target="_blank"
            >
              Ayruom/FileConverter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
