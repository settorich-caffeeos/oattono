import type { NextRequest } from "next/server";
import { getAgent } from "@/lib/agents";
import {
  streamCompletion,
  demoChatReply,
  overridesFromHeaders,
  type ChatMessage,
} from "@/lib/ai";
import { getKnowledgeContext } from "@/lib/knowledge";
import { guard } from "@/lib/apiauth";
import { textStreamResponse } from "@/lib/stream";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const blocked = await guard(req, { limit: 30 });
  if (blocked) return blocked;

  const body = (await req.json()) as {
    messages?: ChatMessage[];
    agentId?: string;
    useKnowledge?: boolean;
  };
  const messages = (body.messages ?? []).filter(
    (m) => m && (m.role === "user" || m.role === "assistant") && m.content,
  );
  const agent = getAgent(body.agentId);
  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  let system = agent.system;
  if (body.useKnowledge && lastUser) {
    const ctx = await getKnowledgeContext(lastUser);
    if (ctx) system += ctx;
  }

  const gen = streamCompletion({
    system,
    messages,
    demo: () => demoChatReply(agent.nameTh, lastUser),
    maxTokens: 4000,
    ...overridesFromHeaders(req.headers),
  });

  return textStreamResponse(gen);
}
