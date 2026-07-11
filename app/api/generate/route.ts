import type { NextRequest } from "next/server";
import { getModule } from "@/lib/modules";
import { getAgent } from "@/lib/agents";
import { streamCompletion, buildModulePrompt, demoModuleDoc } from "@/lib/ai";
import { textStreamResponse } from "@/lib/stream";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    slug?: string;
    values?: Record<string, string>;
  };
  const mod = body.slug ? getModule(body.slug) : undefined;
  if (!mod) {
    return new Response("Unknown module", { status: 400 });
  }
  const values = body.values ?? {};
  const agent = getAgent(mod.agentId);
  const { userPrompt } = buildModulePrompt(mod, values);

  const gen = streamCompletion({
    system: agent.system,
    messages: [{ role: "user", content: userPrompt }],
    demo: () => demoModuleDoc(mod, values),
    maxTokens: 8000,
  });

  return textStreamResponse(gen);
}
