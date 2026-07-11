import type { NextRequest } from "next/server";
import { getAgent } from "@/lib/agents";
import {
  streamCompletion,
  demoChatReply,
  overridesFromHeaders,
  type ChatMessage,
} from "@/lib/ai";
import { textStreamResponse } from "@/lib/stream";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    messages?: ChatMessage[];
    agentId?: string;
  };
  const messages = (body.messages ?? []).filter(
    (m) => m && (m.role === "user" || m.role === "assistant") && m.content,
  );
  const agent = getAgent(body.agentId);
  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const gen = streamCompletion({
    system: agent.system,
    messages,
    demo: () => demoChatReply(agent.nameTh, lastUser),
    maxTokens: 4000,
    ...overridesFromHeaders(req.headers),
  });

  return textStreamResponse(gen);
}
