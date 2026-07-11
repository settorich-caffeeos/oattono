import type { NextRequest } from "next/server";
import { getModule } from "@/lib/modules";
import { getAgent } from "@/lib/agents";
import {
  streamCompletion,
  buildModulePrompt,
  demoModuleDoc,
  overridesFromHeaders,
} from "@/lib/ai";
import { getKnowledgeContext } from "@/lib/knowledge";
import { guard } from "@/lib/apiauth";
import { textStreamResponse } from "@/lib/stream";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const blocked = await guard(req, { limit: 20 });
  if (blocked) return blocked;

  const body = (await req.json()) as {
    slug?: string;
    values?: Record<string, string>;
    useKnowledge?: boolean;
  };
  const mod = body.slug ? getModule(body.slug) : undefined;
  if (!mod) {
    return new Response("Unknown module", { status: 400 });
  }
  const values = body.values ?? {};
  const agent = getAgent(mod.agentId);
  const { userPrompt } = buildModulePrompt(mod, values);

  let system = agent.system;
  if (body.useKnowledge) {
    const ctx = await getKnowledgeContext(Object.values(values).join(" "));
    if (ctx) system += ctx;
  }

  const gen = streamCompletion({
    system,
    messages: [{ role: "user", content: userPrompt }],
    demo: () => demoModuleDoc(mod, values),
    maxTokens: 8000,
    ...overridesFromHeaders(req.headers),
  });

  return textStreamResponse(gen);
}
