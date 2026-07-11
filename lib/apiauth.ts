import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import { rateLimit } from "./ratelimit";

/** Current user id (or null when anonymous / Supabase not configured). */
export async function getUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Guard an AI/utility route: require login when Supabase is configured, and
 * apply a per-user (or per-IP) rate limit. Returns a Response to short-circuit
 * with, or null to proceed.
 */
export async function guard(
  req: Request,
  opts: { limit?: number; windowMs?: number } = {},
): Promise<Response | null> {
  const userId = await getUserId();
  if (isSupabaseConfigured() && !userId) {
    return new Response("กรุณาเข้าสู่ระบบก่อนใช้งาน", { status: 401 });
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";
  const key = userId || ip;
  if (!rateLimit(key, opts.limit ?? 20, opts.windowMs ?? 60_000)) {
    return new Response("เรียกใช้บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่", {
      status: 429,
    });
  }
  return null;
}
