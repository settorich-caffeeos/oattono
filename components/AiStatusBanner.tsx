"use client";

import Link from "next/link";
import { useConfig } from "@/lib/config";

/** Shows a demo-mode notice unless the server has a key or the browser has one saved. */
export default function AiStatusBanner({
  serverHasKey,
}: {
  serverHasKey: boolean;
}) {
  const { config } = useConfig();
  if (serverHasKey || config.apiKey.trim()) return null;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
      <span>
        <span className="font-semibold">โหมดสาธิต:</span> ทุกฟีเจอร์ใช้งานได้และแสดงเนื้อหาตัวอย่าง
      </span>
      <Link
        href="/settings"
        className="font-semibold text-amber-900 underline dark:text-amber-100"
      >
        ใส่ API key ที่หน้าตั้งค่า →
      </Link>
      <span>เพื่อเปิดใช้งาน Claude เต็มรูปแบบ</span>
    </div>
  );
}
