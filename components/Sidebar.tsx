"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AuthNav from "./AuthNav";

const NAV = [
  { href: "/", label: "แดชบอร์ด", sub: "Dashboard", emoji: "🏠" },
  { href: "/chat", label: "AI Chat", sub: "คุยกับผู้เชี่ยวชาญ", emoji: "💬" },
  { href: "/modules", label: "โมดูล", sub: "14 Core Modules", emoji: "🧰" },
  { href: "/roi", label: "ROI Calculator", sub: "คำนวณความคุ้มค่า", emoji: "🧮" },
  { href: "/knowledge", label: "คลังความรู้", sub: "Knowledge / RAG", emoji: "📚" },
  { href: "/projects", label: "โครงการ", sub: "Projects", emoji: "📁" },
  { href: "/settings", label: "ตั้งค่า", sub: "API Key / Model", emoji: "⚙️" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
            }`}
          >
            <span className="text-lg leading-none">{item.emoji}</span>
            <span className="min-w-0">
              <span className="block font-medium leading-tight">
                {item.label}
              </span>
              <span
                className={`block text-xs leading-tight ${
                  active
                    ? "text-brand-100"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {item.sub}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-sm">
        DT
      </span>
      <span>
        <span className="block text-base font-semibold leading-tight">
          DT Copilot
        </span>
        <span className="block text-xs text-slate-400">
          AI Transformation Workspace
        </span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/90">
        {brand}
        <button
          aria-label="เปิดเมนู"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
      {/* Spacer so content clears the mobile bar */}
      <div className="h-[61px] lg:hidden" />

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6">{brand}</div>
            {nav}
            <div className="mt-6">
              <AuthNav onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r border-slate-200 bg-white p-4 lg:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 px-1">{brand}</div>
        {nav}
        <div className="mt-auto space-y-3">
          <AuthNav />
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
            <p className="font-medium text-slate-600 dark:text-slate-300">
              ลดเวลาทำเอกสาร
            </p>
            <p>จาก 2–5 วัน เหลือ 15–30 นาที</p>
          </div>
        </div>
      </aside>
    </>
  );
}
