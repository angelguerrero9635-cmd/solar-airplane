"use client";
import { useEffect, useState } from "react";

export default function StatusPill() {
  const [status, setStatus] = useState("checking");
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch("/api/github/commit-info")
      .then((r) => r.json())
      .then((data) => {
        if (data?.sha) {
          setInfo(data);
          setStatus("ok");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  const color =
    status === "ok"
      ? "bg-cyanline"
      : status === "error"
      ? "bg-amber-signal"
      : "bg-slate-signal";

  return (
    <div
      className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-signal sm:flex"
      title={info?.message || ""}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${color} animate-pulse`} />
      {status === "ok"
        ? `SYNCED · ${info.sha}`
        : status === "error"
        ? "SYNC ERROR"
        : "SYNCING…"}
    </div>
  );
}
