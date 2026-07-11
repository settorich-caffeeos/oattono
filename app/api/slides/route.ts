import type { NextRequest } from "next/server";
import { getAgent } from "@/lib/agents";
import { streamCompletion, overridesFromHeaders } from "@/lib/ai";
import { textStreamResponse } from "@/lib/stream";
import { SLIDE_SCHEMA_HINT, demoDeck } from "@/lib/slides-types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    topic?: string;
    audience?: string;
    count?: string;
    tone?: string;
  };
  const topic = (body.topic || "").trim();
  const agent = getAgent("presentation-expert");

  const prompt = `ออกแบบชุดสไลด์นำเสนอที่ "สวยและเป็นมืออาชีพ" เรื่อง: "${topic}"
กลุ่มผู้ฟัง: ${body.audience || "ผู้บริหาร"}
จำนวนสไลด์โดยประมาณ: ${body.count || "10"}
โทน/จุดเน้น: ${body.tone || "กระชับ โน้มน้าว เชื่อมโยงกลยุทธ์องค์กร"}

ออกแบบ storyline ที่ลื่นไหล เลือกใช้ประเภทสไลด์ให้หลากหลาย (stat สำหรับตัวเลขเด่น, twocol สำหรับเปรียบเทียบ, chart เมื่อมีข้อมูลเชิงปริมาณ) และเขียน speaker notes ที่นำไปพูดได้จริง

${SLIDE_SCHEMA_HINT}`;

  const gen = streamCompletion({
    system: `${agent.system}\n\nสำคัญ: ตอบกลับเป็น JSON วัตถุเดียวเท่านั้น ห้ามมีข้อความอธิบายนอก JSON และห้ามใส่ \`\`\` ประกอบ`,
    messages: [{ role: "user", content: prompt }],
    demo: () => JSON.stringify(demoDeck(topic), null, 2),
    maxTokens: 8000,
    ...overridesFromHeaders(req.headers),
  });

  return textStreamResponse(gen);
}
