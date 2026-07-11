"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjects, type SavedDoc } from "@/lib/store";
import { getModule, MODULES } from "@/lib/modules";
import MarkdownView from "@/components/MarkdownView";

function createHref(slug: string, route: string | undefined, projectId: string) {
  if (route === "/present") return `/present?project=${projectId}`;
  if (route) return route;
  return `/modules/${slug}?project=${projectId}`;
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ProjectsPage() {
  const { projects, addProject, removeProject, removeDocument } = useProjects();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [viewing, setViewing] = useState<SavedDoc | null>(null);
  const [createFor, setCreateFor] = useState<string | null>(null);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">โครงการ</h1>
        <p className="text-slate-500 dark:text-slate-400">
          รวบรวมเอกสารที่สร้างจากโมดูลต่าง ๆ เข้าเป็นโครงการเดียว
          (บันทึกในเบราว์เซอร์ของคุณ)
        </p>
      </header>

      {/* Create */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          สร้างโครงการใหม่
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ชื่อโครงการ เช่น Open Banking Initiative"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="คำอธิบายสั้น ๆ (ไม่บังคับ)"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            onClick={() => {
              if (!name.trim()) return;
              addProject(name, desc);
              setName("");
              setDesc("");
            }}
            className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            สร้าง
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400 dark:border-slate-700">
          ยังไม่มีโครงการ — สร้างโครงการใหม่ หรือบันทึกเอกสารจากโมดูลเข้ามาที่นี่
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  {p.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {p.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    สร้างเมื่อ {fmtDate(p.createdAt)} · {p.documents.length} เอกสาร
                  </p>
                </div>
                <button
                  onClick={() => removeProject(p.id)}
                  className="text-xs text-slate-400 hover:text-rose-500"
                >
                  ลบโครงการ
                </button>
              </div>

              {/* Create actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/present?project=${p.id}`}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  🎤 สร้างสไลด์นำเสนอ
                </Link>
                <button
                  onClick={() =>
                    setCreateFor(createFor === p.id ? null : p.id)
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  ➕ สร้างเอกสาร
                </button>
              </div>

              {createFor === p.id && (
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3 dark:border-slate-700 dark:bg-slate-800/50">
                  {MODULES.map((m) => (
                    <Link
                      key={m.slug}
                      href={createHref(m.slug, m.route, p.id)}
                      className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-sm hover:bg-brand-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                      <span>{m.emoji}</span>
                      <span className="min-w-0 truncate">{m.titleTh}</span>
                    </Link>
                  ))}
                </div>
              )}

              {p.documents.length > 0 && (
                <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {p.documents.map((d) => {
                    const mod = getModule(d.moduleSlug);
                    return (
                      <li
                        key={d.id}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <button
                          onClick={() => setViewing(d)}
                          className="flex min-w-0 items-center gap-2 text-left"
                        >
                          <span>{mod?.emoji || "📄"}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {d.title}
                            </span>
                            <span className="block text-xs text-slate-400">
                              {mod?.titleTh || d.moduleSlug} · {fmtDate(d.createdAt)}
                            </span>
                          </span>
                        </button>
                        <button
                          onClick={() => removeDocument(p.id, d.id)}
                          className="shrink-0 text-xs text-slate-400 hover:text-rose-500"
                        >
                          ลบ
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Document viewer */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setViewing(null)}
          />
          <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
              <h3 className="truncate font-semibold">{viewing.title}</h3>
              <button
                onClick={() => setViewing(null)}
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4">
              <MarkdownView content={viewing.content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
