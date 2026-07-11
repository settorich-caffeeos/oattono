"use client";

import { useRef, useState } from "react";
import { useBrandKit, brandKitToPalette, type BrandKit } from "@/lib/brandkit";
import SlideView from "./SlideView";

/** ย่อรูปโลโก้ให้ไม่เกิน 400px แล้วคืนเป็น data URL (PNG) — คุมขนาดที่เก็บ */
function downscaleImage(file: File, max = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("อ่านไฟล์ไม่สำเร็จ"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("ไฟล์รูปไม่ถูกต้อง"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas ไม่พร้อม"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const DEFAULT: BrandKit = { name: "", primary: "4F46E5", accent: "818CF8" };

export default function BrandKitEditor() {
  const { brandKit, save, clear } = useBrandKit();
  const [draft, setDraft] = useState<BrandKit>(brandKit ?? DEFAULT);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // sync draft when an external change loads a kit the first time
  const [hydrated, setHydrated] = useState(false);
  if (!hydrated && brandKit) {
    setDraft(brandKit);
    setHydrated(true);
  }

  const palette = brandKitToPalette(draft);

  async function onLogo(file: File) {
    setErr("");
    if (file.size > 4 * 1024 * 1024) {
      setErr("ไฟล์ใหญ่เกินไป (จำกัด 4MB)");
      return;
    }
    setLoading(true);
    try {
      const dataUrl = await downscaleImage(file);
      setDraft((d) => ({ ...d, logo: dataUrl }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  function doSave() {
    save({
      name: draft.name.trim(),
      primary: draft.primary,
      accent: draft.accent,
      logo: draft.logo,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function color(
    label: string,
    key: "primary" | "accent",
  ) {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={`#${draft[key]}`}
            onChange={(e) =>
              setDraft((d) => ({ ...d, [key]: e.target.value.replace("#", "").toUpperCase() }))
            }
            className="h-9 w-12 cursor-pointer rounded border border-slate-200 bg-white dark:border-slate-700"
          />
          <input
            value={draft[key]}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                [key]: e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6).toUpperCase(),
              }))
            }
            className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-bold">🎨 Brand Kit — ธีมองค์กรของคุณ</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ตั้งสีองค์กร + โลโก้ครั้งเดียว แล้วเลือกธีม “แบรนด์ของฉัน” ตอนสร้างสไลด์ได้เลย
          (บันทึกในเบราว์เซอร์นี้)
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              ชื่อแบรนด์ / องค์กร
            </label>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="เช่น ธนาคารกรุงตัวอย่าง"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="flex gap-4">
            {color("สีหลัก", "primary")}
            {color("สีเน้น", "accent")}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              โลโก้ (PNG แบบพื้นหลังโปร่งใสจะสวยที่สุด)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {loading ? "กำลังประมวลผล…" : "📎 อัปโหลดโลโก้"}
              </button>
              {draft.logo && (
                <>
                  <span className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.logo} alt="logo" className="max-h-8 max-w-24 object-contain" />
                  </span>
                  <button
                    onClick={() => setDraft((d) => ({ ...d, logo: undefined }))}
                    className="text-sm text-slate-400 hover:text-rose-500"
                  >
                    ลบโลโก้
                  </button>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onLogo(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          {err && <p className="text-sm text-rose-500">{err}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={doSave}
              className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              บันทึก Brand Kit
            </button>
            {brandKit && (
              <button
                onClick={() => {
                  clear();
                  setDraft(DEFAULT);
                  setHydrated(true);
                }}
                className="text-sm text-slate-400 hover:text-rose-500"
              >
                ล้าง Brand Kit
              </button>
            )}
            {saved && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                บันทึกแล้ว ✓
              </span>
            )}
          </div>
        </div>

        {/* live preview */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            ตัวอย่างสไลด์
          </p>
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
            <SlideView
              slide={{
                type: "cover",
                title: draft.name.trim() || "หัวข้อการนำเสนอ",
                subtitle: "ตัวอย่างธีมแบรนด์ของคุณ",
              }}
              palette={palette}
              logo={draft.logo}
              index={0}
              total={1}
            />
          </div>
          <div className="mt-2 flex gap-1.5">
            {[palette.primary, palette.accent, palette.primaryDark, palette.lightBg].map((c) => (
              <span key={c} className="h-5 flex-1 rounded" style={{ background: `#${c}` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
