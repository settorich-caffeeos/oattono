"use client";

import Link from "next/link";

export default function KnowledgeToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 accent-brand-600"
      />
      <span>
        📚 อ้างอิงคลังความรู้องค์กร
        <Link
          href="/knowledge"
          className="ml-1 text-xs text-brand-600 hover:underline dark:text-brand-400"
        >
          (จัดการ)
        </Link>
      </span>
    </label>
  );
}
