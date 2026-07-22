export default function PageHeader({ eyebrow, title, desc }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-signal">
        {eyebrow}
      </p>
      <h1 className="font-display text-4xl uppercase tracking-wide text-ink">
        {title}
      </h1>
      {desc && (
        <p className="mt-1 max-w-2xl text-sm text-slate-signal">{desc}</p>
      )}
    </div>
  );
}
