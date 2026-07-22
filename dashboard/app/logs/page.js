"use client";
import { useState } from "react";
import Frame from "@/components/Frame";
import MarkdownEditor from "@/components/MarkdownEditor";
import PageHeader from "@/components/PageHeader";

const EMPTY_FORM = {
  title: "",
  type: "bench test",
  conditions: "",
  config: "",
  readings: "",
  observations: "",
  deviation: "",
  followup: "",
};

export default function LogsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function appendEntry() {
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(`/api/github/file?path=logs/test_flights.md`);
    const current = await res.json();
    const entry = `\n## ${today} — ${
      form.title || "Untitled entry"
    }\n\n**Type:** ${form.type}\n**Conditions:** ${
      form.conditions
    }\n**Config:** ${form.config}\n\n**Readings:**\n${
      form.readings
    }\n\n**Observations:** ${form.observations}\n\n**Deviation from prediction:** ${
      form.deviation
    }\n\n**Follow-up:** ${form.followup}\n`;
    const newContent = `${current.content.trimEnd()}\n${entry}`;
    await fetch("/api/github/file", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "logs/test_flights.md",
        content: newContent,
        sha: current.sha,
        message: `Log entry: ${form.title || today}`,
      }),
    });
    setSaving(false);
    setAdding(false);
    setForm(EMPTY_FORM);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Test Log"
        title="Logs"
        desc="Dated bench test and flight test entries. New entries append to the log without touching earlier history."
      />
      <Frame eyebrow="New entry">
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="border border-amber-signal px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-amber-signal hover:bg-amber-signal/10"
          >
            + Log a test
          </button>
        ) : (
          <div className="space-y-3">
            <Row label="Title">
              <TextInput
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                placeholder="7-cell bench measurement"
              />
            </Row>
            <Row label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="border border-blueprint-600 bg-blueprint-900 px-2 py-1.5 font-mono text-xs text-ink outline-none focus:border-cyanline"
              >
                <option>bench test</option>
                <option>ground roll</option>
                <option>flight</option>
              </select>
            </Row>
            <Row label="Conditions">
              <TextInput
                value={form.conditions}
                onChange={(v) => setForm({ ...form, conditions: v })}
                placeholder="Clear sky, solar noon, 24°C"
              />
            </Row>
            <Row label="Config">
              <TextInput
                value={form.config}
                onChange={(v) => setForm({ ...form, config: v })}
                placeholder="7-cell string, battery at 85% SOC"
              />
            </Row>
            <Row label="Readings">
              <TextArea
                value={form.readings}
                onChange={(v) => setForm({ ...form, readings: v })}
                placeholder={
                  "- Array voltage: \n- Array current: \n- Battery current: "
                }
              />
            </Row>
            <Row label="Observations">
              <TextArea
                value={form.observations}
                onChange={(v) => setForm({ ...form, observations: v })}
              />
            </Row>
            <Row label="Deviation from prediction">
              <TextArea
                value={form.deviation}
                onChange={(v) => setForm({ ...form, deviation: v })}
              />
            </Row>
            <Row label="Follow-up">
              <TextArea
                value={form.followup}
                onChange={(v) => setForm({ ...form, followup: v })}
              />
            </Row>
            <div className="flex gap-2">
              <button
                onClick={appendEntry}
                disabled={saving}
                className="border border-cyanline px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-cyanline hover:bg-cyanline/10 disabled:opacity-50"
              >
                {saving ? "Committing…" : "Save entry to repo"}
              </button>
              <button
                onClick={() => setAdding(false)}
                className="font-mono text-xs text-slate-signal"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Frame>

      <Frame eyebrow="logs/test_flights.md" key={refreshKey}>
        <MarkdownEditor path="logs/test_flights.md" />
      </Frame>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-start">
      <span className="pt-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-signal">
        {label}
      </span>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-blueprint-600 bg-blueprint-900 px-2 py-1.5 font-mono text-xs text-ink outline-none focus:border-cyanline"
    />
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full border border-blueprint-600 bg-blueprint-900 px-2 py-1.5 font-mono text-xs text-ink outline-none focus:border-cyanline"
    />
  );
}
