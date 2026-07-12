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
      <section className="relative mb-9 overflow-hidden rounded-[1.6rem] border border-white/[0.06] bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-8 text-white shadow-[0_30px_80px_-40px_rgba(11,16,32,0.9)] sm:p-11">
        {/* gold glow accents */}
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
        {/* hairline frame */}
        <div className="pointer-events-none absolute inset-3 rounded-[1.3rem] ring-1 ring-inset ring-white/[0.05]" />

        <div className="relative">
          <p className="eyebrow text-gold-300">Business Exclusive · AI Copilot</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-[1.15] sm:text-[2.6rem]">
            ให้ AI ช่วยคิด วิเคราะห์
            <br className="hidden sm:block" /> และสร้างเอกสารระดับ
            <span className="text-gold"> ผู้บริหาร</span>
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-slate-300/90">
            Workspace สำหรับสาย Digital Transformation, Strategy, PMO และ
            Enterprise Architecture — ลดเวลาทำเอกสารจากหลายวันเหลือเพียงไม่กี่นาที
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-900 shadow-lg shadow-gold-500/20 transition hover:from-gold-200 hover:to-gold-400"
            >
              💬 เริ่มคุยกับ AI
            </Link>
            <Link
              href="/modules"
              className="rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/15 backdrop-blur transition hover:bg-white/[0.12]"
            >
              🧰 ดูโมดูลทั้งหมด
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-7">
            <div>
              <p className="font-display text-3xl font-semibold text-slate-400">
                2–5 วัน
              </p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-slate-500">
                เวลาทำงานแบบเดิม
              </p>
            </div>
            <div className="text-2xl text-gold-400/70">→</div>
            <div>
              <p className="font-display text-3xl font-semibold text-gold">
                15–30 นาที
              </p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-slate-500">
                ด้วย DT Copilot
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Status banner (hidden when a key is configured server- or client-side) */}
      <AiStatusBanner serverHasKey={online} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="hairline-gold mb-2" />
              <h2 className="text-lg font-semibold">เริ่มงานด่วน</h2>
            </div>
            <Link
              href="/modules"
              className="text-sm font-medium text-gold-600 hover:text-gold-500 dark:text-gold-400"
            >
              ดูทั้งหมด ({MODULES.length}) →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickModules.map((m) => (
              <Link
                key={m.slug}
                href={m.route || `/modules/${m.slug}`}
                className="card-lux card-lux-hover group flex items-start gap-3.5 p-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-gold-50 text-xl ring-1 ring-black/[0.04] dark:from-brand-900/30 dark:to-gold-500/10 dark:ring-white/5">
                  {m.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold transition group-hover:text-gold-600 dark:group-hover:text-gold-400">
                    {m.titleTh}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
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
          <div className="card-lux p-5">
            <h3 className="eyebrow mb-4 text-slate-400">ขั้นตอนการทำงานทั่วไป</h3>
            <ol className="space-y-1">
              {WORKFLOW.map((step, i) => (
                <li key={step} className="flex items-center gap-3 py-1 text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gold-300/25 to-gold-500/10 text-xs font-semibold text-gold-600 ring-1 ring-gold-400/30 dark:text-gold-300">
                    {i + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Agents */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="hairline-gold mb-2" />
            <h2 className="text-lg font-semibold">ทีมผู้เชี่ยวชาญ AI</h2>
          </div>
          <Link
            href="/chat"
            className="text-sm font-medium text-gold-600 hover:text-gold-500 dark:text-gold-400"
          >
            เริ่มสนทนา →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {AGENTS.map((a) => (
            <Link
              key={a.id}
              href="/chat"
              className="card-lux card-lux-hover flex items-center gap-3 p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-gold-50 text-xl ring-1 ring-black/[0.04] dark:from-brand-900/30 dark:to-gold-500/10 dark:ring-white/5">
                {a.emoji}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
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
