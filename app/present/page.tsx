import Link from "next/link";
import PresentationBuilder from "@/components/PresentationBuilder";

export default function PresentPage() {
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
            🎤
          </span>
          <div>
            <h1 className="text-2xl font-bold">Presentation Builder</h1>
            <p className="text-slate-500 dark:text-slate-400">
              AI ออกแบบสไลด์สวย ๆ พร้อมพรีวิว, speaker notes และ export
              PowerPoint / PDF
            </p>
          </div>
        </div>
      </div>
      <PresentationBuilder />
    </div>
  );
}
