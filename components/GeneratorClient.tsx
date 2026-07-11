"use client";

import { useRef, useState } from "react";
import type { ModuleDef } from "@/lib/modules";
import { streamPost } from "@/lib/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import MarkdownView from "./MarkdownView";
import DocActions from "./DocActions";
import KnowledgeToggle from "./KnowledgeToggle";

export default function GeneratorClient({ mod }: { mod: ModuleDef }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useKnowledge, setUseKnowledge] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const missingRequired = mod.fields.some(
    (f) => f.required && !(values[f.name] || "").trim(),
  );

  async function generate() {
    setError("");
    setOutput("");
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await streamPost(
        "/api/generate",
        { slug: mod.slug, values, useKnowledge },
        (chunk) => setOutput((prev) => prev + chunk),
        ctrl.signal,
      );
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  const firstKey = mod.fields[0]?.name;
  const docTitle =
    (firstKey ? values[firstKey] : "")?.trim() || mod.titleTh;

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          ข้อมูลนำเข้า
        </h2>
        <div className="space-y-4">
          {mod.fields.map((f) => (
            <div key={f.name}>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                {f.labelTh}
                {f.required && <span className="text-rose-500"> *</span>}
                <span className="ml-1 text-xs font-normal text-slate-400">
                  {f.label}
                </span>
              </label>
              {f.type === "textarea" ? (
                <textarea
                  rows={4}
                  value={values[f.name] || ""}
                  placeholder={f.placeholder}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-brand-900/40"
                />
              ) : f.type === "select" ? (
                <select
                  value={values[f.name] || ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="">— เลือก —</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={values[f.name] || ""}
                  placeholder={f.placeholder}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-brand-900/40"
                />
              )}
            </div>
          ))}
        </div>

        {isSupabaseConfigured() && (
          <div className="mt-4">
            <KnowledgeToggle checked={useKnowledge} onChange={setUseKnowledge} />
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          {!loading ? (
            <button
              onClick={generate}
              disabled={missingRequired}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✨ สร้างด้วย AI
            </button>
          ) : (
            <button
              onClick={stop}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300"
            >
              ■ หยุด
            </button>
          )}
        </div>
        {missingRequired && (
          <p className="mt-2 text-xs text-slate-400">
            กรุณากรอกช่องที่มีเครื่องหมาย * ก่อน
          </p>
        )}
      </div>

      {/* Output */}
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {!output && !loading && (
          <div className="flex min-h-72 flex-col items-center justify-center text-center text-slate-400">
            <span className="mb-3 text-4xl">{mod.emoji}</span>
            <p className="max-w-sm text-sm">
              กรอกข้อมูลด้านซ้ายแล้วกด &quot;สร้างด้วย AI&quot; เอกสารจะปรากฏที่นี่แบบเรียลไทม์
            </p>
          </div>
        )}

        {(output || loading) && (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {loading ? "กำลังสร้าง…" : "ผลลัพธ์"}
              </span>
              {output && !loading && (
                <DocActions
                  title={docTitle}
                  content={output}
                  moduleSlug={mod.slug}
                />
              )}
            </div>
            <MarkdownView content={output || "…"} />
            {loading && (
              <span className="mt-1 inline-block h-4 w-2 animate-pulse bg-brand-500 align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
