"use client";

import { useRef, useState } from "react";
import { configHeaders } from "@/lib/config";

/** Upload a PDF/DOCX/TXT and extract its text, then hand it back via onText. */
export default function FileExtractButton({
  onText,
  label = "📎 อัปโหลดไฟล์",
}: {
  onText: (text: string, filename: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handle(file: File) {
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: configHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "อ่านไฟล์ไม่สำเร็จ");
        return;
      }
      onText(data.text || "", data.name || file.name);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.xlsx,.xlsm,.txt,.md,.csv,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        {busy ? "กำลังอ่าน…" : label}
      </button>
      {err && <span className="text-xs text-rose-500">{err}</span>}
    </span>
  );
}
