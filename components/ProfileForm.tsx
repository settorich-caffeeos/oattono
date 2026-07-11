"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LEVEL_OPTIONS, type Profile } from "@/lib/supabase/config";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [department, setDepartment] = useState(profile.department ?? "");
  const [level, setLevel] = useState(profile.role_level ?? "");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMsg("");
    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({
      id: profile.id,
      email: profile.email,
      display_name: displayName,
      department,
      role_level: level,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setMsg(error ? `เกิดข้อผิดพลาด: ${error.message}` : "บันทึกแล้ว ✓");
    if (!error) router.refresh();
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <label className="mb-1 block text-sm font-medium">อีเมล</label>
        <input
          value={profile.email ?? ""}
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">ชื่อ-นามสกุล</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">หน่วยงาน</label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="เช่น DT, PMO, Strategy"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">ระดับ</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">—</option>
            {LEVEL_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก…" : "บันทึกโปรไฟล์"}
        </button>
        <button
          onClick={signOut}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ออกจากระบบ
        </button>
        {msg && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}
