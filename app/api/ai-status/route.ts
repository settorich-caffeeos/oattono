import { hasApiKey } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Reports whether the server has a shared Anthropic key configured (no key exposed). */
export async function GET() {
  return Response.json({ serverHasKey: hasApiKey() });
}
