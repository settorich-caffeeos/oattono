export default function AuthNotice() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
      <h2 className="mb-2 text-base font-semibold">ยังไม่ได้ตั้งค่า Supabase</h2>
      <p className="mb-3">
        ระบบสมาชิก (สมัคร / เข้าสู่ระบบ / โปรไฟล์) ต้องเชื่อมกับ Supabase ก่อน
        เพิ่ม environment variables ต่อไปนี้ แล้ว deploy/รันใหม่:
      </p>
      <pre className="mb-3 overflow-x-auto rounded-lg bg-amber-100 p-3 text-xs text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
        {`NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key>`}
      </pre>
      <p>
        คีย์อยู่ที่ Supabase Dashboard → Project Settings → API และอย่าลืมรัน SQL
        ใน <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">supabase/schema.sql</code>{" "}
        (ดู DEPLOY.md)
      </p>
    </div>
  );
}
