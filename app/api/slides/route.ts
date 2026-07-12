import type { NextRequest } from "next/server";
import { getAgent } from "@/lib/agents";
import { streamCompletion, overridesFromHeaders } from "@/lib/ai";
import { guard } from "@/lib/apiauth";
import { textStreamResponse } from "@/lib/stream";
import { SLIDE_SCHEMA_HINT, demoDeck } from "@/lib/slides-types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const blocked = await guard(req, { limit: 15 });
  if (blocked) return blocked;

  const body = (await req.json()) as {
    topic?: string;
    audience?: string;
    count?: string;
    tone?: string;
    source?: string;
    style?: string;
  };
  const topic = (body.topic || "").trim();
  const source = (body.source || "").trim().slice(0, 16000);
  const style = (body.style || "").trim().slice(0, 300);
  const agent = getAgent("presentation-expert");

  const common = `กลุ่มผู้ฟัง: ${body.audience || "ผู้บริหาร"}
จำนวนสไลด์โดยประมาณ: ${body.count || "10"}
โทน/จุดเน้น: ${body.tone || "กระชับ โน้มน้าว เชื่อมโยงกลยุทธ์องค์กร"}${
    style ? `\nสไตล์การเล่าเรื่อง/ดีไซน์ (ปรับโครงเรื่องและถ้อยคำให้เข้ากับสไตล์นี้): ${style}` : ""
  }

ออกแบบ storyline ที่ลื่นไหล เลือกใช้ประเภทสไลด์ให้หลากหลาย (stat สำหรับตัวเลขเด่น, twocol สำหรับเปรียบเทียบ, chart เมื่อมีข้อมูลเชิงปริมาณ) และเขียน speaker notes ที่นำไปพูดได้จริง`;

  const prompt = source
    ? `เรียบเรียง "เนื้อหาต้นทาง" ด้านล่าง (มาจากเอกสารในโครงการของผู้ใช้) ให้กลายเป็นชุดสไลด์นำเสนอที่สวยและเป็นมืออาชีพ — สรุปประเด็นสำคัญ ดึงตัวเลข/ข้อมูลที่มีมาทำ stat/chart และคงสาระเดิมไว้ อย่าแต่งข้อมูลเกินจากต้นทาง
${topic ? `หัวข้อ/มุมเน้น: ${topic}` : ""}
${common}

=== เนื้อหาต้นทาง ===
${source}
=== จบเนื้อหาต้นทาง ===

${SLIDE_SCHEMA_HINT}`
    : `ออกแบบชุดสไลด์นำเสนอที่ "สวยและเป็นมืออาชีพ" เรื่อง: "${topic}"
${common}

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
