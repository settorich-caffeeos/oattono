"use client";

import { useState } from "react";
import { useProjects } from "@/lib/store";

export default function DocActions({
  title,
  content,
  moduleSlug,
}: {
  title: string;
  content: string;
  moduleSlug: string;
}) {
  const { projects, addProject, addDocument } = useProjects();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState("");
  const [newName, setNewName] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  async function copy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^\w฀-๿.-]+/g, "_").slice(0, 60) || "document"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function save() {
    let projectId = target;
    if (!projectId && newName.trim()) {
      projectId = addProject(newName).id;
    }
    if (!projectId) {
      setSavedMsg("เลือกโครงการหรือตั้งชื่อโครงการใหม่ก่อน");
      return;
    }
    addDocument(projectId, { moduleSlug, title, content });
    setSavedMsg("บันทึกเข้าโครงการแล้ว ✓");
    setSaving(false);
    setNewName("");
    setTimeout(() => setSavedMsg(""), 2500);
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className={btn} onClick={copy}>
        {copied ? "คัดลอกแล้ว ✓" : "คัดลอก"}
      </button>
      <button className={btn} onClick={download}>
        ดาวน์โหลด .md
      </button>
      <button className={btn} onClick={() => setSaving((v) => !v)}>
        บันทึกเข้าโครงการ
      </button>
      {savedMsg && (
        <span className="text-sm text-emerald-600 dark:text-emerald-400">
          {savedMsg}
        </span>
      )}

      {saving && (
        <div className="mt-2 flex w-full flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">— เลือกโครงการที่มีอยู่ —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-slate-400">หรือ</span>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ตั้งชื่อโครงการใหม่"
            className="min-w-40 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            onClick={save}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            บันทึก
          </button>
        </div>
      )}
    </div>
  );
}
