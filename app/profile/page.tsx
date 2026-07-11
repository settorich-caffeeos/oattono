import { redirect } from "next/navigation";
import { isSupabaseConfigured, type Profile } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import AuthNotice from "@/components/AuthNotice";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="py-8">
        <AuthNotice />
      </div>
    );
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile: Profile = {
    id: user.id,
    email: user.email ?? null,
    display_name: data?.display_name ?? null,
    department: data?.department ?? null,
    role_level: data?.role_level ?? null,
    updated_at: data?.updated_at ?? null,
  };

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white">
          {(profile.display_name || profile.email || "?").slice(0, 1).toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-bold">
            {profile.display_name || "โปรไฟล์ของฉัน"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {profile.email}
          </p>
        </div>
      </header>
      <ProfileForm profile={profile} />
    </div>
  );
}
