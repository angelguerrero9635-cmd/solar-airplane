"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import StatusPill from "./StatusPill";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/specs", label: "Specs" },
  { href: "/calculations", label: "Calc" },
  { href: "/decisions", label: "ADRs" },
  { href: "/logs", label: "Logs" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-blueprint-600/60 bg-blueprint-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl uppercase tracking-wide text-ink">
            Solar Glider
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-slate-signal sm:inline">
            Project Log
          </span>
        </div>
        <nav className="hidden gap-1 font-mono text-xs uppercase tracking-wider md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-sm px-3 py-1.5 transition-colors ${
                pathname === l.href
                  ? "bg-cyanline/10 text-cyanline"
                  : "text-slate-signal hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <StatusPill />
          <button
            onClick={logout}
            className="font-mono text-[10px] uppercase tracking-widest text-slate-signal hover:text-amber-signal"
          >
            Sign out
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-blueprint-600/40 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider md:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-sm px-2.5 py-1 ${
              pathname === l.href
                ? "bg-cyanline/10 text-cyanline"
                : "text-slate-signal"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
