"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownEditor({ path, label }) {
  const [content, setContent] = useState("");
  const [sha, setSha] = useState(null);
  const [mode, setMode] = useState("preview"); // preview | edit
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  async function load() {
    setStatus("loading");
    try {
      const res = await fetch(
        `/api/github/file?path=${encodeURIComponent(path)}`
      );
      if (res.status === 404) {
        setContent("");
        setSha(null);
        setStatus("missing");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContent(data.content);
      setSha(data.sha);
      setStatus("ready");
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  }

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/github/file", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          content,
          sha,
          message: `Update ${path} via dashboard`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSha(data.content.sha);
      setStatus("saved");
      setMode("preview");
      setTimeout(() => setStatus("ready"), 1500);
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-signal">
          {label || path}
        </span>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
          <StatusLabel status={status} />
          {status !== "loading" && (
            <div className="flex gap-1">
              <button
                onClick={() => setMode("preview")}
                className={`px-2 py-1 ${
                  mode === "preview" ? "text-cyanline" : "text-slate-signal"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setMode("edit")}
                className={`px-2 py-1 ${
                  mode === "edit" ? "text-cyanline" : "text-slate-signal"
                }`}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {status === "loading" && (
        <p className="font-mono text-xs text-slate-signal">
          Loading {path}…
        </p>
      )}

      {status === "missing" && mode !== "edit" && (
        <p className="font-mono text-xs text-amber-signal">
          {path} doesn&apos;t exist yet in the repo. Switch to Edit to create
          it.
        </p>
      )}

      {status === "error" && (
        <p className="font-mono text-xs text-amber-signal">Error: {error}</p>
      )}

      {mode === "preview" && status !== "loading" && content && (
        <article className="prose-blueprint max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      )}

      {mode === "edit" && (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="w-full resize-y border border-blueprint-600 bg-blueprint-900 p-3 font-mono text-sm text-ink outline-none focus:border-cyanline"
            spellCheck={false}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={save}
              disabled={status === "saving"}
              className="border border-cyanline px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cyanline hover:bg-cyanline/10 disabled:opacity-50"
            >
              {status === "saving" ? "Committing…" : "Save to repo"}
            </button>
            <span className="font-mono text-[10px] text-slate-signal">
              Commits directly to the repo&apos;s configured branch.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusLabel({ status }) {
  const map = {
    ready: ["READY", "text-slate-signal"],
    saving: ["COMMITTING", "text-amber-signal"],
    saved: ["SAVED", "text-cyanline"],
    error: ["ERROR", "text-amber-signal"],
    missing: ["NEW FILE", "text-amber-signal"],
    loading: ["LOADING", "text-slate-signal"],
  };
  const [text, cls] = map[status] || ["", ""];
  return <span className={cls}>{text}</span>;
}
