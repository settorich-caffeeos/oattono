import type { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { MODEL, overridesFromHeaders } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { apiKey, model } = overridesFromHeaders(req.headers);
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json({
      ok: false,
      message: "ยังไม่ได้ระบุ API key",
    });
  }
  try {
    const client = new Anthropic({ apiKey: key });
    const res = await client.messages.create({
      model: model || MODEL,
      max_tokens: 8,
      messages: [{ role: "user", content: "ping" }],
    });
    return Response.json({ ok: true, model: res.model });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, message });
  }
}
