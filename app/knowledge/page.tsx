"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import AuthNotice from "@/components/AuthNotice";
import FileExtractButton from "@/components/FileExtractButton";

type Entry = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  created_at: string;
};

export default function KnowledgePage() {
  const configured = isSupabaseConfigured();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<Entry | null>(null);

  const load = useCallback(async () => {
    if (!configured) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("knowledge_base")
      .select("*")
      .order("created_at", { ascending: false });
    setEntries((data as Entry[]) ?? []);
  }, [configured]);

  useEffect(() => {
    load();
  }, [load]);

  if (!configured) {
    return (
      <div className="py-8">
        <AuthNotice />
      </div>
    );
  }

  async function add() {
    if (!title.trim() || !content.trim()) return;
    setBusy(true);
    await createClient()
      .from("knowledge_base")
      .insert({ title: title.trim(), category: category.trim(), content: content.trim() });
    setTitle("");
    setCategory("");
    setContent("");
    setBusy(false);
    load();
  }

  async function remove(id: string) {
    await createClient().from("knowledge_base").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <header className="mb-6 flex items-start gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-gold-50 text-3xl dark:from-brand-900/30 dark:to-gold-500/10">
          📚
        </span>
        <div>
          <div className="hairline-gold mb-2" />
          <h1 className="font-display text-2xl font-bold tracking-tight">คลังความรู้องค์กร</h1>
          <p className="text-slate-500 dark:text-slate-400">
            เพิ่มเอกสาร/แนวปฏิบัติภายใน แล้ว AI จะดึงมาอ้างอิงตอนสร้างเอกสารและตอบแชท
            (เปิดสวิตช์ &quot;อ้างอิงคลังความรู้&quot; ในโมดูลหรือหน้าแชท)
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Add form */}
        <div className="card-lux p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="eyebrow text-slate-400">
              เพิ่มความรู้
            </h2>
            <FileExtractButton
              onText={(text, filename) => {
                setContent(text);
                if (!title.trim())
                  setTitle(filename.replace(/\.[^.]+$/, ""));
              }}
            />
          </div>
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ชื่อเอกสาร เช่น นโยบายความปลอดภัยข้อมูล"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="หมวด (ไม่บังคับ) เช่น Policy, Template"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
            />
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="วางเนื้อหาเอกสาร/แนวปฏิบัติที่ต้องการให้ AI อ้างอิง..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              onClick={add}
              disabled={busy || !title.trim() || !content.trim()}
              className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? "กำลังบันทึก…" : "เพิ่มเข้าคลัง"}
            </button>
          </div>
        </div>

        {/* List */}
        <div>
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400 dark:border-slate-700">
              ยังไม่มีเอกสารในคลัง — เพิ่มด้านซ้ายเพื่อให้ AI อ้างอิงได้
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="card-lux p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => setOpen(e)}
                      className="min-w-0 text-left"
                    >
                      <p className="truncate font-medium">{e.title}</p>
                      <p className="text-xs text-slate-400">
                        {e.category || "ไม่ระบุหมวด"} ·{" "}
                        {e.content.length.toLocaleString()} ตัวอักษร
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {e.content}
                      </p>
                    </button>
                    <button
                      onClick={() => remove(e.id)}
                      className="shrink-0 text-xs text-slate-400 hover:text-rose-500"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setOpen(null)}
          />
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col card-lux">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
              <h3 className="truncate font-semibold">{open.title}</h3>
              <button
                onClick={() => setOpen(null)}
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto whitespace-pre-wrap px-6 py-4 text-sm leading-relaxed">
              {open.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
