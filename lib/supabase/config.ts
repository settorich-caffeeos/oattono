// NEXT_PUBLIC_* vars are inlined at build time, so these work on client & server.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** True when both Supabase env vars are present. Auth features light up only then. */
export function isSupabaseConfigured(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  department: string | null;
  role_level: string | null;
  updated_at: string | null;
};

export const LEVEL_OPTIONS = [
  "Officer",
  "Senior Officer",
  "AVP",
  "VP",
  "SVP",
  "Project Manager",
  "Enterprise Architect",
  "Innovation Team",
];
