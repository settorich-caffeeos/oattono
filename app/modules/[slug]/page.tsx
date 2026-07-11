import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getModule, MODULES, PHASE_LABEL } from "@/lib/modules";
import { getAgent } from "@/lib/agents";
import GeneratorClient from "@/components/GeneratorClient";

export function generateStaticParams() {
  return MODULES.filter((m) => !m.route).map((m) => ({ slug: m.slug }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();
  if (mod.route) redirect(mod.route);
  const agent = getAgent(mod.agentId);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/modules"
          className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          ← โมดูลทั้งหมด
        </Link>
        <div className="mt-3 flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl dark:bg-brand-900/30">
            {mod.emoji}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{mod.titleTh}</h1>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {PHASE_LABEL[mod.phase]}
              </span>
            </div>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {mod.summary}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              ขับเคลื่อนโดย {agent.emoji} {agent.nameTh} · {agent.name}
            </p>
          </div>
        </div>
      </div>

      <GeneratorClient mod={mod} />
    </div>
  );
}
