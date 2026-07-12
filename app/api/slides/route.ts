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
    preset?: string;
  };
  const topic = (body.topic || "").trim();
  const source = (body.source || "").trim().slice(0, 16000);
  const style = (body.style || "").trim().slice(0, 300);
  const isPitch = body.preset === "pitch";

  const PITCH_STORYLINE = `นี่คือ "Pitch Deck นำเสนอนักลงทุน" — ใช้โครงเรื่องมาตรฐานของ startup pitch ตามลำดับนี้ (ปรับให้เข้ากับข้อมูลที่มี ข้ามหัวข้อที่ไม่มีข้อมูลได้ แต่คงลำดับการเล่าเรื่อง):
1) cover — ชื่อผลิตภัณฑ์ + tagline สั้นทรงพลัง
2) ปัญหา (Problem) — ปัญหาที่ลูกค้าเจอ ทำให้รู้สึกร่วม
3) ทางออก (Solution) — ผลิตภัณฑ์แก้ปัญหานี้อย่างไร
4) ผลิตภัณฑ์ (Product) — ฟีเจอร์เด่น/วิธีทำงาน
5) ขนาดตลาด (Market) — ใช้ stat แสดง TAM/SAM/SOM หรือมูลค่าตลาด
6) โมเดลธุรกิจ (Business Model) — หารายได้อย่างไร โครงสร้างราคา
7) Traction / ผลลัพธ์ที่ผ่านมา — ใช้ stat หรือ chart แสดงการเติบโต
8) คู่แข่งและความได้เปรียบ (Competition) — ใช้ twocol เปรียบเทียบ
9) ทีม (Team) — ถ้ามีข้อมูล
10) การเงินและ ROI (Financials) — ใช้ chart แสดงประมาณการ
11) closing — "The Ask" สิ่งที่ขอจากนักลงทุน + ช่องทางติดต่อ
เน้นถ้อยคำมั่นใจ ดึงตัวเลขจริงจากข้อมูลมาทำ stat/chart ให้มากที่สุด และ speaker notes แบบที่ผู้ก่อตั้งจะใช้พูดจริงบนเวที`;

  const agent = getAgent(isPitch ? "business-strategist" : "presentation-expert");

  const common = `กลุ่มผู้ฟัง: ${body.audience || (isPitch ? "นักลงทุน / VC" : "ผู้บริหาร")}
จำนวนสไลด์โดยประมาณ: ${body.count || (isPitch ? "11" : "10")}
โทน/จุดเน้น: ${body.tone || "กระชับ โน้มน้าว เชื่อมโยงกลยุทธ์องค์กร"}${
    style ? `\nสไตล์การเล่าเรื่อง/ดีไซน์ (ปรับโครงเรื่องและถ้อยคำให้เข้ากับสไตล์นี้): ${style}` : ""
  }
${isPitch ? `\n${PITCH_STORYLINE}\n` : ""}
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
