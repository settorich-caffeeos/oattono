import Anthropic from "@anthropic-ai/sdk";
import type { ModuleDef } from "./modules";

/** Default model. Opus 4.8 is the most capable Claude model for reasoning + long documents. */
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function hasApiKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Stream a completion as plain-text chunks. Uses Claude when ANTHROPIC_API_KEY
 * is set; otherwise falls back to a structured demo response so the whole app
 * remains usable offline / without credentials.
 */
export async function* streamCompletion(opts: {
  system: string;
  messages: ChatMessage[];
  demo: () => string;
  maxTokens?: number;
}): AsyncGenerator<string> {
  if (!hasApiKey()) {
    yield* streamDemo(opts.demo());
    return;
  }

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 8000,
    system: opts.system,
    messages: opts.messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

/** Emit a canned string in small chunks so the client sees a natural stream. */
async function* streamDemo(text: string): AsyncGenerator<string> {
  const tokens = text.match(/\S+\s*|\s+/g) ?? [text];
  let buf = "";
  for (const t of tokens) {
    buf += t;
    if (buf.length >= 6) {
      yield buf;
      buf = "";
      await new Promise((r) => setTimeout(r, 8));
    }
  }
  if (buf) yield buf;
}

/** Build the generation prompt for a generic (form-driven) module. */
export function buildModulePrompt(
  mod: ModuleDef,
  values: Record<string, string>,
): { system: string; userPrompt: string } {
  const inputs = mod.fields
    .map((f) => {
      const v = (values[f.name] || "").trim();
      return v ? `- ${f.labelTh} (${f.label}): ${v}` : null;
    })
    .filter(Boolean)
    .join("\n");

  if (mod.outputFormat === "mermaid") {
    const diagramType = values.diagramType || "Process Flow (flowchart)";
    const userPrompt = `สร้างไดอะแกรมประเภท "${diagramType}" ตามคำอธิบายด้านล่าง โดยส่งออกเป็นโค้ด Mermaid ที่ถูกต้องภายในบล็อก \`\`\`mermaid ... \`\`\` เพียงหนึ่งบล็อก และเพิ่มคำอธิบายสั้น ๆ ใต้โค้ด

ข้อมูลนำเข้า:
${inputs}

ข้อกำหนด: ใช้ไวยากรณ์ Mermaid ที่ถูกต้อง (flowchart TD / sequenceDiagram / journey ตามความเหมาะสม), ป้ายกำกับเป็นภาษาไทยได้, โครงสร้างครบถ้วนและอ่านง่าย`;
    return { system: "", userPrompt };
  }

  const outline = mod.outline.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const userPrompt = `จัดทำเอกสาร "${mod.titleTh} (${mod.title})" ในรูปแบบ Markdown ที่พร้อมนำเสนอ

ข้อมูลนำเข้า:
${inputs || "- (ไม่ได้ระบุรายละเอียดเพิ่มเติม ให้ใช้สมมติฐานที่สมเหตุสมผลและระบุว่าเป็นสมมติฐาน)"}

โครงสร้างเอกสารที่ต้องการ (ใช้เป็นหัวข้อ ##):
${outline}

ข้อกำหนด: เขียนเนื้อหาจริงในแต่ละหัวข้อ กระชับแต่ครบถ้วน ใช้ bullet และตาราง Markdown เมื่อเหมาะสม อ้างอิงบริบทองค์กร/ธนาคาร และเน้นสิ่งที่นำไปใช้ได้จริง`;

  return { system: "", userPrompt };
}

/** Deterministic demo document used when no API key is configured. */
export function demoModuleDoc(
  mod: ModuleDef,
  values: Record<string, string>,
): string {
  const filled = mod.fields
    .map((f) => {
      const v = (values[f.name] || "").trim();
      return v ? `**${f.labelTh}:** ${v}` : null;
    })
    .filter(Boolean)
    .join("  \n");

  if (mod.outputFormat === "mermaid") {
    const dtype = values.diagramType || "Process Flow";
    return `# ${mod.titleTh} — ${dtype}

> โหมดสาธิต (Demo) — ยังไม่ได้ตั้งค่า \`ANTHROPIC_API_KEY\` ระบบจึงแสดงตัวอย่างโครงร่าง เมื่อเชื่อมต่อ Claude แล้ว AI จะสร้างไดอะแกรมจริงจากคำอธิบายของคุณ

\`\`\`mermaid
flowchart TD
    A[เริ่มต้น] --> B{ตรวจสอบเงื่อนไข}
    B -- ผ่าน --> C[ดำเนินการ]
    B -- ไม่ผ่าน --> D[แจ้งกลับผู้ใช้]
    C --> E[บันทึกผล]
    E --> F[สิ้นสุด]
\`\`\`

นำโค้ด Mermaid ด้านบนไปวางที่ [mermaid.live](https://mermaid.live) เพื่อดูภาพ หรือฝังในเอกสารที่รองรับ Mermaid ได้`;
  }

  const header = `# ${mod.titleTh} (${mod.title})

> โหมดสาธิต (Demo) — ยังไม่ได้ตั้งค่า \`ANTHROPIC_API_KEY\` เนื้อหาด้านล่างเป็นโครงร่างตัวอย่าง เมื่อเชื่อมต่อ Claude แล้ว AI จะเขียนเนื้อหาจริงที่ปรับให้เข้ากับข้อมูลของคุณ

${filled ? `${filled}\n` : ""}`;

  const body = mod.outline
    .map(
      (s) =>
        `## ${s}\n\n- ประเด็นสำคัญที่ ${1} เกี่ยวกับ "${s}"\n- ตัวอย่างเนื้อหาที่ AI จะสร้างจากข้อมูลนำเข้าของคุณ\n- ข้อเสนอแนะเชิงปฏิบัติที่นำไปใช้ได้จริง`,
    )
    .join("\n\n");

  return `${header}\n${body}\n`;
}

/** Demo chat reply in the selected agent's voice. */
export function demoChatReply(agentName: string, lastUser: string): string {
  const q = lastUser.trim().slice(0, 140);
  return `**${agentName}** (โหมดสาธิต)

ขอบคุณสำหรับคำถาม: "${q}${lastUser.length > 140 ? "…" : ""}"

ขณะนี้ระบบทำงานในโหมดสาธิตเพราะยังไม่ได้ตั้งค่า \`ANTHROPIC_API_KEY\` เมื่อเชื่อมต่อกับ Claude แล้ว ผมจะช่วย:

- วิเคราะห์และให้คำแนะนำเชิงลึกในมุมของผู้เชี่ยวชาญคนนี้
- ร่างเอกสาร โครงสร้าง และข้อเสนอแนะที่นำไปใช้ได้จริง
- อ้างอิงมาตรฐานและแนวปฏิบัติที่ดีขององค์กร

วิธีเปิดใช้งานเต็มรูปแบบ: เพิ่ม \`ANTHROPIC_API_KEY\` ในไฟล์ \`.env.local\` แล้วรีสตาร์ทเซิร์ฟเวอร์`;
}
