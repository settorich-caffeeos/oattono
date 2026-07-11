import Link from "next/link";
import { MODULES } from "@/lib/modules";
import { AGENTS } from "@/lib/agents";
import { hasApiKey } from "@/lib/ai";
import DashboardRecent from "@/components/DashboardRecent";
import AiStatusBanner from "@/components/AiStatusBanner";

const WORKFLOW = [
  "สร้างโครงการ",
  "อธิบายปัญหา",
  "AI วิเคราะห์",
  "เลือก Solution",
  "คำนวณ ROI",
  "สร้าง Proposal",
  "ทำ Presentation",
  "Review & Export",
];

const QUICK = [
  "executive-proposal",
  "problem-analyzer",
  "solution-designer",
  "business-case",
  "roi-calculator",
  "presentation-builder",
  "meeting-assistant",
  "roadmap-generator",
];

export default function Dashboard() {
  const online = hasApiKey();
  const quickModules = QUICK.map((s) => MODULES.find((m) => m.slug === s)!).filter(
    Boolean,
  );

  return (
    <div>
      {/* Hero */}
      <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-8 text-white sm:p-10">
        <p className="text-sm font-medium text-brand-100">
          AI Digital Transformation Copilot
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          ให้ AI ช่วยคิด วิเคราะห์ และสร้างเอกสาร
        </h1>
        <p className="mt-3 max-w-2xl text-brand-100">
          Workspace สำหรับสาย Digital Transformation, Strategy, PMO และ
          Enterprise Architecture — ลดเวลาทำเอกสารจากหลายวันเหลือเพียงไม่กี่นาที
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/chat"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            💬 เริ่มคุยกับ AI
          </Link>
          <Link
            href="/modules"
            className="rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25"
          >
            🧰 ดูโมดูลทั้งหมด
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-3xl font-bold">2–5 วัน</p>
            <p className="text-brand-100">เวลาทำงานแบบเดิม</p>
          </div>
          <div className="flex items-center text-2xl text-brand-200">→</div>
          <div>
            <p className="text-3xl font-bold">15–30 นาที</p>
            <p className="text-brand-100">ด้วย DT Copilot</p>
          </div>
        </div>
      </section>

      {/* Status banner (hidden when a key is configured server- or client-side) */}
      <AiStatusBanner serverHasKey={online} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">เริ่มงานด่วน</h2>
            <Link
              href="/modules"
              className="text-sm text-brand-600 hover:underline dark:text-brand-400"
            >
              ดูทั้งหมด ({MODULES.length})
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickModules.map((m) => (
              <Link
                key={m.slug}
                href={m.route || `/modules/${m.slug}`}
                className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl dark:bg-brand-900/30">
                  {m.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {m.titleTh}
                  </span>
                  <span className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {m.summary}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent + workflow */}
        <div className="space-y-6">
          <DashboardRecent />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              ขั้นตอนการทำงานทั่วไป
            </h3>
            <ol className="space-y-2">
              {WORKFLOW.map((step, i) => (
                <li key={step} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Agents */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">ทีมผู้เชี่ยวชาญ AI</h2>
          <Link
            href="/chat"
            className="text-sm text-brand-600 hover:underline dark:text-brand-400"
          >
            เริ่มสนทนา
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {AGENTS.map((a) => (
            <Link
              key={a.id}
              href="/chat"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {a.nameTh}
                </span>
                <span className="block truncate text-xs text-slate-400">
                  {a.tagline}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
