"use client";

import Link from "next/link";
import { useProjects } from "@/lib/store";
import { getModule } from "@/lib/modules";

export default function DashboardRecent() {
  const { projects } = useProjects();
  const docs = projects
    .flatMap((p) =>
      p.documents.map((d) => ({ ...d, projectName: p.name })),
    )
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="card-lux p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="eyebrow text-slate-400">
          เอกสารล่าสุด
        </h3>
        <Link
          href="/projects"
          className="text-xs text-brand-600 hover:underline dark:text-brand-400"
        >
          ดูทั้งหมด
        </Link>
      </div>
      {docs.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">
          ยังไม่มีเอกสาร — เริ่มจากโมดูลใดโมดูลหนึ่งได้เลย
        </p>
      ) : (
        <ul className="space-y-2">
          {docs.map((d) => {
            const mod = getModule(d.moduleSlug);
            return (
              <li key={d.id} className="flex items-center gap-3">
                <span className="text-lg">{mod?.emoji || "📄"}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="truncate text-xs text-slate-400">
                    {d.projectName} · {mod?.titleTh || d.moduleSlug}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
