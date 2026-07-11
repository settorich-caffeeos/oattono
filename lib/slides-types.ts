export type SlideType =
  | "cover"
  | "section"
  | "bullets"
  | "stat"
  | "twocol"
  | "chart"
  | "quote"
  | "closing";

export type Chart = {
  kind: "bar" | "line" | "pie";
  categories: string[];
  series: { name: string; values: number[] }[];
};

export type Slide = {
  type: SlideType;
  title?: string;
  subtitle?: string;
  bullets?: string[];
  stats?: { value: string; label: string }[];
  leftTitle?: string;
  left?: string[];
  rightTitle?: string;
  right?: string[];
  chart?: Chart;
  quote?: string;
  by?: string;
  notes?: string;
};

export type Deck = {
  title: string;
  subtitle?: string;
  slides: Slide[];
};

export type Palette = {
  id: string;
  name: string;
  primary: string; // hex, no '#'
  primaryDark: string;
  accent: string;
  text: string;
  bg: string;
  lightBg: string;
};

export const PALETTES: Palette[] = [
  {
    id: "indigo",
    name: "Indigo (แอป)",
    primary: "4F46E5",
    primaryDark: "312E81",
    accent: "818CF8",
    text: "1F2937",
    bg: "FFFFFF",
    lightBg: "EEF2FF",
  },
  {
    id: "teal",
    name: "Teal",
    primary: "0D9488",
    primaryDark: "134E4A",
    accent: "5EEAD4",
    text: "1F2937",
    bg: "FFFFFF",
    lightBg: "F0FDFA",
  },
  {
    id: "slate",
    name: "Corporate Slate",
    primary: "334155",
    primaryDark: "0F172A",
    accent: "94A3B8",
    text: "1F2937",
    bg: "FFFFFF",
    lightBg: "F1F5F9",
  },
  {
    id: "amber",
    name: "Amber",
    primary: "D97706",
    primaryDark: "78350F",
    accent: "FCD34D",
    text: "1F2937",
    bg: "FFFFFF",
    lightBg: "FFFBEB",
  },
];

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

/** Robustly pull a Deck JSON object out of model output (handles ```json fences / prose). */
export function extractDeck(text: string): Deck | null {
  let s = text.trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(s);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const obj = JSON.parse(s.slice(start, end + 1));
    if (obj && Array.isArray(obj.slides)) return obj as Deck;
    return null;
  } catch {
    return null;
  }
}

/** JSON schema description injected into the generation prompt. */
export const SLIDE_SCHEMA_HINT = `ส่งออกเป็น JSON วัตถุเดียวเท่านั้น (ห้ามมีข้อความอื่นนอก JSON) ตามโครงสร้าง:
{
  "title": "ชื่อการนำเสนอ",
  "subtitle": "คำโปรยสั้น",
  "slides": [
    { "type": "cover", "title": "...", "subtitle": "..." },
    { "type": "section", "title": "ชื่อหัวข้อใหญ่" },
    { "type": "bullets", "title": "...", "bullets": ["...","..."], "notes": "speaker notes" },
    { "type": "stat", "title": "...", "stats": [ {"value":"70%","label":"..."}, {"value":"15 นาที","label":"..."} ], "notes":"..." },
    { "type": "twocol", "title":"...", "leftTitle":"ก่อน", "left":["..."], "rightTitle":"หลัง", "right":["..."] },
    { "type": "chart", "title":"...", "chart": { "kind":"bar", "categories":["Q1","Q2"], "series":[{"name":"ผลประหยัด","values":[10,20]}] }, "notes":"..." },
    { "type": "quote", "quote":"ข้อความสำคัญ", "by":"แหล่งอ้างอิง" },
    { "type": "closing", "title":"ขอบคุณ", "subtitle":"คำถาม/ติดต่อ" }
  ]
}
กติกา: ใช้ภาษาไทย, มี cover เป็นสไลด์แรกและ closing เป็นสไลด์สุดท้ายเสมอ, ใส่ "notes" (speaker notes) ให้ทุกสไลด์เนื้อหา, ใช้ stat/twocol/chart เมื่อเหมาะสมเพื่อความน่าสนใจ, bullets ไม่เกิน 6 ข้อต่อสไลด์`;

/** Serialize a deck to a readable Markdown outline (for saving / copying). */
export function deckToMarkdown(deck: Deck): string {
  const out: string[] = [`# ${deck.title}`];
  if (deck.subtitle) out.push(`> ${deck.subtitle}`);
  deck.slides.forEach((s, i) => {
    out.push(`\n## ${i + 1}. ${s.title || s.type}`);
    if (s.subtitle) out.push(s.subtitle);
    if (s.quote) out.push(`> ${s.quote}${s.by ? ` — ${s.by}` : ""}`);
    (s.bullets ?? []).forEach((b) => out.push(`- ${b}`));
    (s.stats ?? []).forEach((st) => out.push(`- **${st.value}** — ${st.label}`));
    if (s.left || s.right) {
      out.push(`\n**${s.leftTitle || "คอลัมน์ซ้าย"}**`);
      (s.left ?? []).forEach((b) => out.push(`- ${b}`));
      out.push(`\n**${s.rightTitle || "คอลัมน์ขวา"}**`);
      (s.right ?? []).forEach((b) => out.push(`- ${b}`));
    }
    if (s.chart) {
      out.push(`\n| ${s.chart.categories.join(" | ")} |`);
      out.push(`| ${s.chart.categories.map(() => "---").join(" | ")} |`);
      s.chart.series.forEach((se) =>
        out.push(`| ${se.values.join(" | ")} |  _(${se.name})_`),
      );
    }
    if (s.notes) out.push(`\n_Speaker notes: ${s.notes}_`);
  });
  return out.join("\n");
}

/** Deterministic demo deck used when no API key is configured. */
export function demoDeck(topic: string): Deck {
  const t = topic.trim() || "หัวข้อการนำเสนอ";
  return {
    title: t,
    subtitle: "จัดทำโดย DT Copilot (โหมดสาธิต)",
    slides: [
      { type: "cover", title: t, subtitle: "AI Digital Transformation Copilot" },
      { type: "section", title: "ที่มาและความสำคัญ" },
      {
        type: "bullets",
        title: "ภาพรวม",
        bullets: [
          "บริบทและความท้าทายขององค์กร",
          "โอกาสจากเทคโนโลยีดิจิทัล",
          "เป้าหมายของการนำเสนอนี้",
        ],
        notes: "เกริ่นบริบท 1 นาที เชื่อมโยงกับกลยุทธ์องค์กร",
      },
      {
        type: "stat",
        title: "ผลลัพธ์ที่คาดหวัง",
        stats: [
          { value: "70%", label: "ลดเวลาทำงาน" },
          { value: "15–30 นาที", label: "ต่อเอกสาร" },
          { value: "3x", label: "ผลิตภาพเพิ่มขึ้น" },
        ],
        notes: "เน้นตัวเลขที่จับต้องได้ ให้ผู้บริหารเห็นคุณค่า",
      },
      {
        type: "twocol",
        title: "เปรียบเทียบก่อน–หลัง",
        leftTitle: "แบบเดิม",
        left: ["ใช้เวลา 2–5 วัน", "ทำมือหลายขั้นตอน", "คุณภาพไม่คงที่"],
        rightTitle: "ด้วย DT Copilot",
        right: ["เหลือ 15–30 นาที", "AI ช่วยร่างให้", "อ้างอิงมาตรฐานองค์กร"],
      },
      {
        type: "chart",
        title: "แนวโน้มผลประหยัด (ตัวอย่าง)",
        chart: {
          kind: "bar",
          categories: ["ไตรมาส 1", "ไตรมาส 2", "ไตรมาส 3", "ไตรมาส 4"],
          series: [{ name: "ผลประหยัด (ล้านบาท)", values: [1.2, 2.5, 3.8, 5.1] }],
        },
        notes: "อธิบายสมมติฐานสั้น ๆ",
      },
      { type: "quote", quote: "เทคโนโลยีที่ดีที่สุดคือสิ่งที่คนใช้งานได้จริง", by: "DT Copilot" },
      { type: "closing", title: "ขอบคุณครับ/ค่ะ", subtitle: "พร้อมตอบคำถาม" },
    ],
  };
}
