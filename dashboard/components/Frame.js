export default function Frame({ title, eyebrow, children, className = "" }) {
  return (
    <div
      className={`relative border border-blueprint-600/60 bg-blueprint-800/60 ${className}`}
    >
      <span className="absolute -top-px -left-px h-3 w-3 border-l-2 border-t-2 border-cyanline" />
      <span className="absolute -top-px -right-px h-3 w-3 border-r-2 border-t-2 border-cyanline" />
      <span className="absolute -bottom-px -left-px h-3 w-3 border-l-2 border-b-2 border-cyanline" />
      <span className="absolute -bottom-px -right-px h-3 w-3 border-r-2 border-b-2 border-cyanline" />
      {(title || eyebrow) && (
        <div className="flex items-baseline justify-between border-b border-blueprint-600/60 px-4 py-2">
          {eyebrow && (
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-signal">
              {eyebrow}
            </span>
          )}
          {title && (
            <h2 className="font-display text-xl uppercase tracking-wide text-ink">
              {title}
            </h2>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
