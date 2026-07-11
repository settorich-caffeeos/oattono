"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export default function AuthNav({ onNavigate }: { onNavigate?: () => void }) {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return <div className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/50" />;
  }

  if (email) {
    return (
      <Link
        href="/profile"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm hover:border-brand-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-brand-700"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {email.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium">{email}</span>
          <span className="block text-xs text-slate-400">ดูโปรไฟล์</span>
        </span>
      </Link>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/login"
        onClick={onNavigate}
        className="flex-1 rounded-xl bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700"
      >
        เข้าสู่ระบบ
      </Link>
      <Link
        href="/signup"
        onClick={onNavigate}
        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        สมัคร
      </Link>
    </div>
  );
}
