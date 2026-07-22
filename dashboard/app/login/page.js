"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Incorrect passphrase.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blueprint-900 bg-blueprint-grid bg-grid px-4">
      <form
        onSubmit={submit}
        className="relative w-full max-w-sm border border-blueprint-600 bg-blueprint-800/80 p-6"
      >
        <span className="absolute -top-px -left-px h-3 w-3 border-l-2 border-t-2 border-cyanline" />
        <span className="absolute -top-px -right-px h-3 w-3 border-r-2 border-t-2 border-cyanline" />
        <span className="absolute -bottom-px -left-px h-3 w-3 border-l-2 border-b-2 border-cyanline" />
        <span className="absolute -bottom-px -right-px h-3 w-3 border-r-2 border-b-2 border-cyanline" />
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-signal">
          Access Control
        </p>
        <h1 className="mt-1 font-display text-3xl uppercase tracking-wide text-ink">
          Solar Glider Log
        </h1>
        <p className="mt-3 text-sm text-slate-signal">
          Enter the project passphrase to view and edit the repo.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passphrase"
          className="mt-4 w-full border border-blueprint-600 bg-blueprint-900 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-cyanline"
          autoFocus
        />
        {error && (
          <p className="mt-2 font-mono text-xs text-amber-signal">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full border border-cyanline py-2 font-mono text-xs uppercase tracking-widest text-cyanline hover:bg-cyanline/10 disabled:opacity-50"
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
