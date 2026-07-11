import Link from "next/link";
import { MODULES, PHASE_LABEL, type ModuleDef } from "@/lib/modules";

function ModuleCard({ mod }: { mod: ModuleDef }) {
  const href = mod.route || `/modules/${mod.slug}`;
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl dark:bg-brand-900/30">
          {mod.emoji}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {PHASE_LABEL[mod.phase]}
        </span>
      </div>
      <h3 className="mt-3 font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-400">
        {mod.titleTh}
      </h3>
      <p className="text-xs text-slate-400">{mod.title}</p>
      <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
        {mod.summary}
      </p>
    </Link>
  );
}

export default function ModulesPage() {
  const phases = [1, 2, 3, 4] as const;
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">โมดูลทั้งหมด</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          14 Core Modules ครอบคลุมงานเอกสารและการวิเคราะห์สำหรับสาย Digital
          Transformation
        </p>
      </header>

      {phases.map((phase) => {
        const items = MODULES.filter((m) => m.phase === phase);
        if (!items.length) return null;
        return (
          <section key={phase} className="mb-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {PHASE_LABEL[phase]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((m) => (
                <ModuleCard key={m.slug} mod={m} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
