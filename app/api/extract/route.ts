import type { NextRequest } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { guard } from "@/lib/apiauth";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

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
    } else if (/\.(txt|md|csv|json)$/.test(name)) {
      text = buf.toString("utf-8");
    } else {
      return Response.json(
        { error: "รองรับเฉพาะ PDF, DOCX, TXT, MD, CSV" },
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
