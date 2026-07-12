"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AuthNav from "./AuthNav";

const NAV = [
  { href: "/", label: "แดชบอร์ด", sub: "Dashboard", emoji: "🏠" },
  { href: "/chat", label: "AI Chat", sub: "คุยกับผู้เชี่ยวชาญ", emoji: "💬" },
  { href: "/modules", label: "โมดูล", sub: "15 Core Modules", emoji: "🧰" },
  { href: "/roi", label: "ROI Calculator", sub: "คำนวณความคุ้มค่า", emoji: "🧮" },
  { href: "/knowledge", label: "คลังความรู้", sub: "Knowledge / RAG", emoji: "📚" },
  { href: "/projects", label: "โครงการ", sub: "Projects", emoji: "📁" },
  { href: "/settings", label: "ตั้งค่า", sub: "API Key / Brand Kit", emoji: "⚙️" },
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
      <p className="mb-2 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/35">
        Workspace
      </p>
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
              active
                ? "bg-white/[0.07] text-white ring-1 ring-inset ring-gold-400/25"
                : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-gold-300 to-gold-500" />
            )}
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition ${
                active
                  ? "bg-gradient-to-br from-gold-300/20 to-gold-500/10 ring-1 ring-gold-400/30"
                  : "bg-white/[0.04] group-hover:bg-white/[0.07]"
              }`}
            >
              {item.emoji}
            </span>
            <span className="min-w-0">
              <span className="block font-medium leading-tight">
                {item.label}
              </span>
              <span
                className={`block text-xs leading-tight ${
                  active ? "text-gold-200/80" : "text-slate-500"
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
    <Link
      href="/"
      className="flex items-center gap-3"
      onClick={() => setOpen(false)}
    >
      <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 font-display text-lg font-bold text-ink-900 shadow-lg ring-1 ring-white/20">
        DT
      </span>
      <span>
        <span className="block font-display text-lg font-semibold leading-tight tracking-tight text-white">
          DT Copilot
        </span>
        <span className="block text-[0.7rem] font-medium uppercase tracking-[0.14em] text-gold-300/80">
          Business Exclusive
        </span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-white/10 bg-ink-900/90 px-4 py-3 backdrop-blur lg:hidden">
        {brand}
        <button
          aria-label="เปิดเมนู"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-white/15 p-2 text-slate-200"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
      {/* Spacer so content clears the mobile bar */}
      <div className="h-[63px] lg:hidden" />

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto bg-gradient-to-b from-ink-800 to-ink-950 p-4">
            <div className="mb-8">{brand}</div>
            {nav}
            <div className="mt-6">
              <AuthNav onNavigate={() => setOpen(false)} onDark />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 flex-col overflow-hidden border-r border-white/[0.06] bg-gradient-to-b from-ink-800 to-ink-950 p-4 lg:flex">
        {/* subtle gold glow at top */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="relative mb-9 px-1 pt-1">{brand}</div>
        <div className="relative">{nav}</div>
        <div className="relative mt-auto space-y-3">
          <AuthNav onDark />
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="hairline-gold mb-2.5" />
            <p className="text-sm font-semibold text-white">
              ลดเวลาทำเอกสาร
            </p>
            <p className="text-xs text-slate-400">
              จาก 2–5 วัน เหลือ <span className="text-gold-300">15–30 นาที</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
