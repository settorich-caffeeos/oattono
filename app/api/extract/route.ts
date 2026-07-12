import type { NextRequest } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { guard } from "@/lib/apiauth";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/** ดึงข้อความจากเซลล์ Excel (รองรับ rich text / สูตร / วันที่ / ไฮเปอร์ลิงก์) */
function cellText(c: unknown): string {
  if (c == null) return "";
  if (c instanceof Date) return c.toISOString().slice(0, 10);
  if (typeof c === "object") {
    const o = c as Record<string, unknown>;
    if (typeof o.text === "string") return o.text;
    if (Array.isArray(o.richText))
      return o.richText.map((r) => (r as { text?: string }).text ?? "").join("");
    if ("result" in o) return String(o.result ?? "");
    return "";
  }
  return String(c);
}

async function extractXlsx(buf: Buffer): Promise<string> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ArrayBuffer);
  const parts: string[] = [];
  wb.eachSheet((sheet) => {
    const rows: string[] = [];
    sheet.eachRow((row) => {
      const vals = (row.values as unknown[]).slice(1).map((v) => cellText(v));
      if (vals.some((v) => v !== "")) rows.push(vals.join(", "));
    });
    if (rows.length) parts.push(`# ${sheet.name}\n${rows.join("\n")}`);
  });
  return parts.join("\n\n");
}

export async function POST(req: NextRequest) {
  const blocked = await guard(req, { limit: 30 });
  if (blocked) return blocked;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "ไฟล์ใหญ่เกิน 10MB" }, { status: 413 });
  }

  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());

  try {
    let text = "";
    if (name.endsWith(".pdf")) {
      const parser = new PDFParse({ data: new Uint8Array(buf) });
      text = (await parser.getText()).text;
    } else if (name.endsWith(".docx")) {
      text = (await mammoth.extractRawText({ buffer: buf })).value;
    } else if (/\.(xlsx|xlsm)$/.test(name)) {
      text = await extractXlsx(buf);
    } else if (/\.(txt|md|csv|json)$/.test(name)) {
      text = buf.toString("utf-8");
    } else {
      return Response.json(
        { error: "รองรับเฉพาะ PDF, DOCX, XLSX, TXT, MD, CSV" },
        { status: 415 },
      );
    }
    text = text.replace(/\n{3,}/g, "\n\n").trim().slice(0, 50000);
    return Response.json({ text, name: file.name });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: `อ่านไฟล์ไม่สำเร็จ: ${message}` },
      { status: 500 },
    );
  }
}
