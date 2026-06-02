import Link from "next/link";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-bg/76 backdrop-blur-xl">
      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          All Files Convertor
        </Link>
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 text-sm text-zinc-300 sm:flex">
          <Link href="/#tools" className="hover:text-white">
            All tools
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
        </div>
        <div className="h-9 w-9" aria-hidden="true" />
      </nav>
    </header>
  );
}
