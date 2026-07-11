"use client";

import { useEffect, useState } from "react";
import type { Palette } from "./slides-types";

/** ชุดแบรนด์ที่ผู้ใช้กำหนดเอง (เก็บในเบราว์เซอร์นี้) */
export type BrandKit = {
  name: string;
  primary: string; // hex, no '#'
  accent: string; // hex, no '#'
  logo?: string; // data URL (image)
};

const KEY = "dt.brandkit";
const EVENT = "dt-brandkit-change";

/* ---------- hex helpers ---------- */

function clampHex(h: string): string {
  const s = h.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
  return s.length === 3
    ? s
        .split("")
        .map((c) => c + c)
        .join("")
        .toUpperCase()
    : s.padEnd(6, "0").toUpperCase();
}

function mix(hex: string, target: number, amt: number): string {
  const h = clampHex(hex);
  const parts = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16);
    const m = Math.round(v + (target - v) * amt);
    return Math.max(0, Math.min(255, m)).toString(16).padStart(2, "0");
  });
  return parts.join("").toUpperCase();
}

/** เข้มขึ้น (ผสมไปทางดำ) */
export function darken(hex: string, amt = 0.45): string {
  return mix(hex, 0, amt);
}
/** อ่อนลง (ผสมไปทางขาว) */
export function lighten(hex: string, amt = 0.9): string {
  return mix(hex, 255, amt);
}

/* ---------- storage ---------- */

export function loadBrandKit(): BrandKit | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const bk = JSON.parse(raw) as BrandKit;
    if (!bk.primary) return null;
    return bk;
  } catch {
    return null;
  }
}

export function saveBrandKit(bk: BrandKit) {
  localStorage.setItem(KEY, JSON.stringify(bk));
  window.dispatchEvent(new Event(EVENT));
}

export function clearBrandKit() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

/** แปลง Brand Kit เป็น Palette ที่ใช้ในตัวสร้างสไลด์ (id คงที่ = "brandkit") */
export function brandKitToPalette(bk: BrandKit): Palette {
  const primary = clampHex(bk.primary);
  const accent = clampHex(bk.accent || bk.primary);
  return {
    id: "brandkit",
    name: `🎨 ${bk.name?.trim() || "แบรนด์ของฉัน"}`,
    primary,
    primaryDark: darken(primary, 0.5),
    accent,
    text: "1F2937",
    bg: "FFFFFF",
    lightBg: lighten(primary, 0.92),
  };
}

/** React hook — อ่าน/ติดตาม Brand Kit และซิงก์ข้ามคอมโพเนนต์/แท็บ */
export function useBrandKit(): {
  brandKit: BrandKit | null;
  save: (bk: BrandKit) => void;
  clear: () => void;
} {
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  useEffect(() => {
    const refresh = () => setBrandKit(loadBrandKit());
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return {
    brandKit,
    save: (bk) => saveBrandKit(bk),
    clear: () => clearBrandKit(),
  };
}
