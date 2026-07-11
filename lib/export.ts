"use client";

import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import pptxgen from "pptxgenjs";

/* -------------------- shared helpers -------------------- */

function safeName(title: string): string {
  return title.replace(/[^\w฀-๿.-]+/g, "_").slice(0, 60) || "document";
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Strip inline markdown (**bold**, *italic*, `code`, links) to plain text. */
function plain(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

type Block =
  | { type: "h"; level: number; text: string }
  | { type: "p"; text: string }
  | { type: "li"; text: string; ordered: boolean }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "code"; text: string };

/** Parse markdown into a flat block list (shared by all exporters). */
function parse(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  const splitRow = (l: string) =>
    l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => plain(c.trim()));

  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      blocks.push({ type: "code", text: buf.join("\n") });
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      blocks.push({ type: "h", level: h[1].length, text: plain(h[2]) });
      i++;
      continue;
    }
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])
    ) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(splitRow(lines[i++]));
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      blocks.push({ type: "li", text: plain(line.replace(/^\s*[-*+]\s+/, "")), ordered: false });
      i++;
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      blocks.push({ type: "li", text: plain(line.replace(/^\s*\d+[.)]\s+/, "")), ordered: true });
      i++;
      continue;
    }
    blocks.push({ type: "p", text: plain(line) });
    i++;
  }
  return blocks;
}

/* -------------------- DOCX -------------------- */

export async function exportDocx(title: string, md: string) {
  const blocks = parse(md);
  const children: (Paragraph | Table)[] = [];

  for (const b of blocks) {
    if (b.type === "h") {
      const level =
        b.level === 1
          ? HeadingLevel.HEADING_1
          : b.level === 2
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_3;
      children.push(new Paragraph({ text: b.text, heading: level }));
    } else if (b.type === "li") {
      children.push(
        new Paragraph({
          text: b.text,
          bullet: b.ordered ? undefined : { level: 0 },
          numbering: undefined,
        }),
      );
    } else if (b.type === "code") {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: b.text, font: "Courier New", size: 18 })],
        }),
      );
    } else if (b.type === "table") {
      const rows = [b.header, ...b.rows].map(
        (r, ri) =>
          new TableRow({
            children: r.map(
              (c) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: c, bold: ri === 0 })],
                    }),
                  ],
                }),
            ),
          }),
      );
      children.push(
        new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
      );
    } else {
      children.push(new Paragraph({ text: b.text }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  download(blob, `${safeName(title)}.docx`);
}

/* -------------------- PPTX -------------------- */

export async function exportPptx(title: string, md: string) {
  const blocks = parse(md);
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "W", width: 10, height: 5.63 });
  pptx.layout = "W";

  // Title slide
  const first = pptx.addSlide();
  first.background = { color: "4F46E5" };
  first.addText(title, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.5,
    fontSize: 32,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });

  // Group blocks into slides by heading
  let current: { title: string; bullets: string[] } | null = null;
  const slides: { title: string; bullets: string[] }[] = [];
  for (const b of blocks) {
    if (b.type === "h") {
      if (current) slides.push(current);
      current = { title: b.text, bullets: [] };
    } else if (b.type === "li" || b.type === "p") {
      if (!current) current = { title: title, bullets: [] };
      if (b.text.trim()) current.bullets.push(b.text.trim());
    }
  }
  if (current) slides.push(current);

  for (const s of slides) {
    const slide = pptx.addSlide();
    slide.addText(s.title, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: "312E81",
    });
    if (s.bullets.length) {
      slide.addText(
        s.bullets.slice(0, 10).map((t) => ({ text: t, options: { bullet: true } })),
        { x: 0.7, y: 1.3, w: 8.6, h: 4, fontSize: 16, color: "1F2937", valign: "top" },
      );
    }
  }

  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  download(blob, `${safeName(title)}.pptx`);
}

/* -------------------- PDF (print to PDF — Thai-safe via system fonts) -------------------- */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mdToHtml(md: string): string {
  const blocks = parse(md);
  const out: string[] = [];
  let listBuf: string[] = [];
  const flush = () => {
    if (listBuf.length) {
      out.push(`<ul>${listBuf.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`);
      listBuf = [];
    }
  };
  for (const b of blocks) {
    if (b.type === "li") {
      listBuf.push(b.text);
      continue;
    }
    flush();
    if (b.type === "h") out.push(`<h${Math.min(b.level, 3)}>${esc(b.text)}</h${Math.min(b.level, 3)}>`);
    else if (b.type === "code") out.push(`<pre>${esc(b.text)}</pre>`);
    else if (b.type === "table") {
      const head = b.header.map((c) => `<th>${esc(c)}</th>`).join("");
      const rows = b.rows
        .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
        .join("");
      out.push(`<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`);
    } else out.push(`<p>${esc(b.text)}</p>`);
  }
  flush();
  return out.join("\n");
}

export function exportPdf(title: string, md: string) {
  const html = mdToHtml(md);
  const win = window.open("", "_blank");
  if (!win) {
    alert("เบราว์เซอร์บล็อกหน้าต่างพิมพ์ กรุณาอนุญาต popup แล้วลองใหม่");
    return;
  }
  win.document.write(`<!doctype html><html lang="th"><head><meta charset="utf-8"><title>${esc(title)}</title>
  <style>
    body{font-family:"Sarabun","IBM Plex Sans Thai","Noto Sans Thai",system-ui,Arial,sans-serif;color:#0f172a;max-width:760px;margin:32px auto;padding:0 24px;line-height:1.7}
    h1{font-size:22px} h2{font-size:18px;margin-top:20px} h3{font-size:15px}
    table{border-collapse:collapse;width:100%;margin:10px 0;font-size:13px}
    th,td{border:1px solid #94a3b8;padding:6px 8px;text-align:left} th{background:#eef2ff}
    pre{background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;overflow:auto;font-size:12px}
    ul{margin:8px 0 8px 20px}
    @media print{ body{margin:0} }
  </style></head><body>${html}
  <script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>
  </body></html>`);
  win.document.close();
}
