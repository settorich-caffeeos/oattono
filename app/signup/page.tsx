"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, LEVEL_OPTIONS } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import AuthNotice from "@/components/AuthNotice";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | "confirm" | "ok">(null);
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="py-8">
        <AuthNotice />
      </div>
    );
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, department, role_level: level },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // If email confirmation is enabled, there's no active session yet.
    if (data.session) {
      setDone("ok");
      router.push("/profile");
      router.refresh();
    } else {
      setDone("confirm");
    }
  }

  if (done === "confirm") {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <span className="text-4xl">📧</span>
        <h1 className="mt-3 text-xl font-bold">ตรวจสอบอีเมลของคุณ</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          เราส่งลิงก์ยืนยันไปที่ <span className="font-medium">{email}</span> แล้ว
          กดยืนยันในอีเมลเพื่อเปิดใช้งานบัญชี จากนั้นกลับมา{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">สมัครสมาชิก</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          สร้างบัญชีเพื่อใช้งาน DT Copilot
        </p>
      </div>
      <form
        onSubmit={signUp}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">ชื่อ-นามสกุล</label>
          <input
            required
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
              placeholder="เช่น DT, PMO"
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
        <div>
          <label className="mb-1 block text-sm font-medium">อีเมล</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            รหัสผ่าน (อย่างน้อย 6 ตัว)
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "กำลังสมัคร…" : "สมัครสมาชิก"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
