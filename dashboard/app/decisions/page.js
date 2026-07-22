"use client";
import { useEffect, useState } from "react";
import Frame from "@/components/Frame";
import MarkdownEditor from "@/components/MarkdownEditor";
import PageHeader from "@/components/PageHeader";

export default function DecisionsPage() {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadList() {
    setStatus("loading");
    const res = await fetch("/api/github/dir?dir=decisions");
    const data = await res.json();
    const mdFiles = (Array.isArray(data) ? data : [])
      .filter((f) => f.name.endsWith(".md") && f.name !== "0000-template.md")
      .sort((a, b) => a.name.localeCompare(b.name));
    setFiles(mdFiles);
    setStatus("ready");
    if (mdFiles.length) setSelected((s) => s || mdFiles[mdFiles.length - 1].path);
  }

  function nextNumber() {
    const nums = files
      .map((f) => parseInt(f.name.slice(0, 4), 10))
      .filter((n) => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return String(max + 1).padStart(4, "0");
  }

  async function createAdr() {
    if (!newTitle.trim()) return;
    const num = nextNumber();
    const slug = newTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const path = `decisions/${num}-${slug}.md`;
    const today = new Date().toISOString().slice(0, 10);
    const content = `# ADR ${num}: ${newTitle}\n\n- **Status:** proposed\n- **Date:** ${today}\n\n## Context\n\n\n\n## Options considered\n\n1. \n2. \n\n## Decision\n\n\n\n## Consequences\n\n`;
    await fetch("/api/github/file", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        content,
        message: `Add ADR ${num}: ${newTitle}`,
      }),
    });
    setNewTitle("");
    setCreating(false);
    await loadList();
    setSelected(path);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Decision Records"
        title="ADRs"
        desc="Numbered records of significant design choices — what was considered, what was picked, and why."
      />
      <Frame eyebrow="decisions/">
        <div className="flex flex-wrap items-center gap-2">
          {status === "loading" && (
            <span className="font-mono text-xs text-slate-signal">
              Loading…
            </span>
          )}
          {files.map((f) => (
            <button
              key={f.path}
              onClick={() => setSelected(f.path)}
              className={`border px-3 py-1.5 font-mono text-xs ${
                selected === f.path
                  ? "border-cyanline text-cyanline"
                  : "border-blueprint-600 text-slate-signal hover:text-ink"
              }`}
            >
              {f.name.replace(".md", "")}
            </button>
          ))}
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="border border-amber-signal px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-amber-signal hover:bg-amber-signal/10"
            >
              + New ADR
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Decision title"
                className="border border-blueprint-600 bg-blueprint-900 px-2 py-1.5 font-mono text-xs text-ink outline-none focus:border-cyanline"
              />
              <button
                onClick={createAdr}
                className="border border-cyanline px-2 py-1.5 font-mono text-xs text-cyanline"
              >
                Create
              </button>
              <button
                onClick={() => setCreating(false)}
                className="font-mono text-xs text-slate-signal"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </Frame>

      {selected && (
        <Frame eyebrow={selected}>
          <MarkdownEditor path={selected} />
        </Frame>
      )}
    </div>
  );
}
