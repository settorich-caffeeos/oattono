"use client";

import { useEffect, useRef, useState } from "react";
import { streamPost } from "@/lib/client";
import { useProjects } from "@/lib/store";
import {
  PALETTES,
  getPalette,
  extractDeck,
  deckToMarkdown,
  type Deck,
} from "@/lib/slides-types";
import { slidesToPptx, slidesToPdf } from "@/lib/slides-export";
import SlideView from "./SlideView";

export default function PresentationBuilder() {
  const { projects, addProject, addDocument } = useProjects();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("ผู้บริหารระดับสูง");
  const [count, setCount] = useState("10");
  const [tone, setTone] = useState("");
  const [paletteId, setPaletteId] = useState("indigo");

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(0);
  const [presenting, setPresenting] = useState(false);

  // save UI
  const [saveOpen, setSaveOpen] = useState(false);
  const [target, setTarget] = useState("");
  const [newName, setNewName] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const palette = getPalette(paletteId);
  const rawRef = useRef("");

  async function generate() {
    if (!topic.trim()) return;
    setError("");
    setDeck(null);
    setLoading(true);
    setCurrent(0);
    rawRef.current = "";
    try {
      await streamPost(
        "/api/slides",
        { topic, audience, count, tone },
        (chunk) => {
          rawRef.current += chunk;
        },
      );
      const parsed = extractDeck(rawRef.current);
      if (!parsed || !parsed.slides.length) {
        setError("แปลงผลลัพธ์เป็นสไลด์ไม่สำเร็จ ลองกดสร้างอีกครั้ง");
      } else {
        setDeck(parsed);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // keyboard nav in present mode
  useEffect(() => {
    if (!presenting || !deck) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ")
        setCurrent((c) => Math.min(c + 1, deck.slides.length - 1));
      else if (e.key === "ArrowLeft") setCurrent((c) => Math.max(c - 1, 0));
      else if (e.key === "Escape") setPresenting(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenting, deck]);

  async function save() {
    if (!deck) return;
    let projectId = target;
    if (!projectId && newName.trim()) {
      const p = await addProject(newName);
      projectId = p?.id ?? "";
    }
    if (!projectId) {
      setSavedMsg("เลือกโครงการหรือตั้งชื่อใหม่ก่อน");
      return;
    }
    await addDocument(projectId, {
      moduleSlug: "presentation-builder",
      title: deck.title,
      content: deckToMarkdown(deck),
    });
    setSavedMsg("บันทึกแล้ว ✓");
    setSaveOpen(false);
    setNewName("");
    setTimeout(() => setSavedMsg(""), 2500);
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          ตั้งค่าการนำเสนอ
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">หัวข้อ *</label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="เช่น แผน Digital Transformation ปี 2026 สำหรับธนาคาร"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">กลุ่มผู้ฟัง</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">จำนวนสไลด์</label>
              <select
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                {["6", "8", "10", "12", "15"].map((n) => (
                  <option key={n} value={n}>
                    {n} สไลด์
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">ธีมสี</label>
              <select
                value={paletteId}
                onChange={(e) => setPaletteId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                {PALETTES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">โทน / จุดเน้น</label>
            <input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="เช่น เน้น ROI และ Quick Win"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !topic.trim()}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "กำลังออกแบบสไลด์…" : "✨ สร้างสไลด์ด้วย AI"}
          </button>
          {/* live palette swatches */}
          <div className="flex gap-1.5 pt-1">
            {[palette.primary, palette.accent, palette.primaryDark, palette.lightBg].map(
              (c) => (
                <span
                  key={c}
                  className="h-5 flex-1 rounded"
                  style={{ background: `#${c}` }}
                />
              ),
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="min-w-0">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {!deck ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 dark:border-slate-700">
            <span className="mb-3 text-5xl">🎤</span>
            <p className="max-w-sm text-sm">
              {loading
                ? "AI กำลังออกแบบ storyline และดีไซน์สไลด์…"
                : "กรอกหัวข้อแล้วกด “สร้างสไลด์” — จะได้สไลด์สวยพร้อมพรีวิว, speaker notes และ export PPTX/PDF"}
            </p>
          </div>
        ) : (
          <div>
            {/* actions */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPresenting(true)}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                ▶ นำเสนอ
              </button>
              <button className={btn} onClick={() => slidesToPptx(deck, palette)}>
                PowerPoint
              </button>
              <button className={btn} onClick={() => slidesToPdf(deck, palette)}>
                PDF
              </button>
              <button className={btn} onClick={() => setSaveOpen((v) => !v)}>
                บันทึกเข้าโครงการ
              </button>
              {savedMsg && (
                <span className="text-sm text-emerald-600 dark:text-emerald-400">
                  {savedMsg}
                </span>
              )}
            </div>

            {saveOpen && (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="">— เลือกโครงการ —</option>
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

            {/* main slide */}
            <div className="rounded-2xl border border-slate-200 p-3 shadow-sm dark:border-slate-800">
              <SlideView
                slide={deck.slides[current]}
                palette={palette}
                index={current}
                total={deck.slides.length}
              />
            </div>

            {/* nav */}
            <div className="mt-3 flex items-center justify-between">
              <button
                className={btn}
                onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
                disabled={current === 0}
              >
                ← ก่อนหน้า
              </button>
              <span className="text-sm text-slate-400">
                สไลด์ {current + 1} / {deck.slides.length}
              </span>
              <button
                className={btn}
                onClick={() =>
                  setCurrent((c) => Math.min(c + 1, deck.slides.length - 1))
                }
                disabled={current === deck.slides.length - 1}
              >
                ถัดไป →
              </button>
            </div>

            {/* speaker notes */}
            {deck.slides[current].notes && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
                <span className="font-medium">🎙️ Speaker notes: </span>
                {deck.slides[current].notes}
              </div>
            )}

            {/* thumbnails */}
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {deck.slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`overflow-hidden rounded-lg border-2 ${
                    i === current
                      ? "border-brand-500"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <SlideView slide={s} palette={palette} index={i} total={deck.slides.length} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Present mode overlay */}
      {presenting && deck && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-300">
            <span>
              {current + 1} / {deck.slides.length} — {deck.title}
            </span>
            <button
              onClick={() => setPresenting(false)}
              className="rounded-lg bg-white/10 px-3 py-1 hover:bg-white/20"
            >
              ✕ ออก (Esc)
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-6 pb-6">
            <div className="w-full max-w-6xl">
              <SlideView
                slide={deck.slides[current]}
                palette={palette}
                index={current}
                total={deck.slides.length}
              />
            </div>
          </div>
          <button
            onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-4 text-white hover:bg-white/20"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrent((c) => Math.min(c + 1, deck.slides.length - 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-4 text-white hover:bg-white/20"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
