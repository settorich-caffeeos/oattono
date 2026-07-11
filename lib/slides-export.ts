"use client";

import pptxgen from "pptxgenjs";
import type { Deck, Palette, Slide } from "./slides-types";

const FONT = "Tahoma"; // widely available, renders Thai
const W = 13.333;
const H = 7.5;
const MX = 0.9;

function safeName(title: string): string {
  return title.replace(/[^\w฀-๿.-]+/g, "_").slice(0, 60) || "presentation";
}

/* ==================== PPTX ==================== */

export async function slidesToPptx(deck: Deck, p: Palette) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "DT Copilot";
  pptx.title = deck.title;

  deck.slides.forEach((s, i) => {
    const slide = pptx.addSlide();
    if (s.notes) slide.addNotes(s.notes);
    renderSlide(pptx, slide, s, i, deck.slides.length, p);
  });

  const blob = (await pptx.write({ outputType: "blob" })) as Blob;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName(deck.title)}.pptx`;
  a.click();
  URL.revokeObjectURL(url);
}

function titleBlock(
  pptx: pptxgen,
  slide: pptxgen.Slide,
  s: Slide,
  p: Palette,
) {
  slide.addText(s.title || "", {
    x: MX,
    y: 0.55,
    w: W - MX * 2,
    h: 0.9,
    fontSize: 30,
    bold: true,
    color: p.text,
    fontFace: FONT,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: MX,
    y: 1.45,
    w: 1.4,
    h: 0.12,
    fill: { color: p.accent },
    line: { type: "none" },
  });
}

function pageNo(slide: pptxgen.Slide, i: number, total: number, p: Palette) {
  slide.addText(`${i + 1} / ${total}`, {
    x: W - 2,
    y: H - 0.5,
    w: 1.5,
    h: 0.3,
    fontSize: 10,
    color: "94A3B8",
    align: "right",
    fontFace: FONT,
  });
  slide.addText("DT Copilot", {
    x: MX,
    y: H - 0.5,
    w: 3,
    h: 0.3,
    fontSize: 10,
    color: "94A3B8",
    fontFace: FONT,
  });
}

function renderSlide(
  pptx: pptxgen,
  slide: pptxgen.Slide,
  s: Slide,
  i: number,
  total: number,
  p: Palette,
) {
  if (s.type === "cover" || s.type === "closing") {
    slide.background = { color: p.primaryDark };
    slide.addShape(pptx.ShapeType.rect, {
      x: MX,
      y: 2.6,
      w: 1.2,
      h: 0.16,
      fill: { color: p.accent },
      line: { type: "none" },
    });
    slide.addText(s.title || "", {
      x: MX,
      y: 2.9,
      w: W - MX * 2,
      h: 1.6,
      fontSize: 44,
      bold: true,
      color: "FFFFFF",
      fontFace: FONT,
    });
    if (s.subtitle)
      slide.addText(s.subtitle, {
        x: MX,
        y: 4.6,
        w: W - MX * 2,
        h: 0.8,
        fontSize: 20,
        color: "E2E8F0",
        fontFace: FONT,
      });
    return;
  }

  if (s.type === "section") {
    slide.background = { color: p.primaryDark };
    slide.addText(String(i + 1).padStart(2, "0"), {
      x: MX,
      y: 2,
      w: 4,
      h: 1.6,
      fontSize: 72,
      bold: true,
      color: p.accent,
      fontFace: FONT,
    });
    slide.addText(s.title || "", {
      x: MX,
      y: 3.6,
      w: W - MX * 2,
      h: 1.2,
      fontSize: 36,
      bold: true,
      color: "FFFFFF",
      fontFace: FONT,
    });
    return;
  }

  if (s.type === "quote") {
    slide.background = { color: p.lightBg };
    slide.addText(`“${s.quote || ""}”`, {
      x: 1.5,
      y: 2.2,
      w: W - 3,
      h: 2.4,
      fontSize: 30,
      bold: true,
      italic: true,
      color: p.primaryDark,
      align: "center",
      fontFace: FONT,
    });
    if (s.by)
      slide.addText(`— ${s.by}`, {
        x: 1.5,
        y: 4.8,
        w: W - 3,
        h: 0.5,
        fontSize: 16,
        color: "64748B",
        align: "center",
        fontFace: FONT,
      });
    return;
  }

  if (s.type === "stat") {
    titleBlock(pptx, slide, s, p);
    const stats = (s.stats ?? []).slice(0, 3);
    const gap = 0.4;
    const cw = (W - MX * 2 - gap * (stats.length - 1)) / Math.max(stats.length, 1);
    stats.forEach((st, idx) => {
      const x = MX + idx * (cw + gap);
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y: 2.4,
        w: cw,
        h: 3,
        fill: { color: p.lightBg },
        line: { type: "none" },
        rectRadius: 0.15,
      });
      slide.addText(st.value, {
        x,
        y: 3,
        w: cw,
        h: 1.2,
        fontSize: 40,
        bold: true,
        color: p.primary,
        align: "center",
        fontFace: FONT,
      });
      slide.addText(st.label, {
        x: x + 0.2,
        y: 4.2,
        w: cw - 0.4,
        h: 1,
        fontSize: 15,
        color: "475569",
        align: "center",
        fontFace: FONT,
      });
    });
    pageNo(slide, i, total, p);
    return;
  }

  if (s.type === "twocol") {
    titleBlock(pptx, slide, s, p);
    const colW = (W - MX * 2 - 0.6) / 2;
    const cols: [string | undefined, string[] | undefined, string][] = [
      [s.leftTitle, s.left, "94A3B8"],
      [s.rightTitle, s.right, p.primary],
    ];
    cols.forEach(([t, items, tint], idx) => {
      const x = MX + idx * (colW + 0.6);
      if (t)
        slide.addText(t, {
          x,
          y: 2.1,
          w: colW,
          h: 0.5,
          fontSize: 16,
          bold: true,
          color: "FFFFFF",
          fill: { color: tint },
          align: "center",
          fontFace: FONT,
        });
      slide.addText(
        (items ?? []).map((b) => ({ text: b, options: { bullet: true } })),
        {
          x,
          y: 2.8,
          w: colW,
          h: 3.8,
          fontSize: 15,
          color: p.text,
          valign: "top",
          fontFace: FONT,
          lineSpacingMultiple: 1.3,
        },
      );
    });
    pageNo(slide, i, total, p);
    return;
  }

  if (s.type === "chart" && s.chart) {
    titleBlock(pptx, slide, s, p);
    const c = s.chart;
    const type =
      c.kind === "line"
        ? pptx.ChartType.line
        : c.kind === "pie"
          ? pptx.ChartType.pie
          : pptx.ChartType.bar;
    const data = c.series.map((se) => ({
      name: se.name,
      labels: c.categories,
      values: se.values,
    }));
    slide.addChart(type, data, {
      x: MX,
      y: 2,
      w: W - MX * 2,
      h: 4.6,
      chartColors: [p.primary, p.accent, p.primaryDark, "94A3B8"],
      showLegend: c.series.length > 1 || c.kind === "pie",
      legendPos: "b",
      showValue: c.kind !== "line",
      fontFace: FONT,
    });
    pageNo(slide, i, total, p);
    return;
  }

  // bullets (default)
  titleBlock(pptx, slide, s, p);
  slide.addText(
    (s.bullets ?? []).slice(0, 6).map((b) => ({ text: b, options: { bullet: true } })),
    {
      x: MX,
      y: 2.1,
      w: W - MX * 2,
      h: 4.6,
      fontSize: 18,
      color: p.text,
      valign: "top",
      fontFace: FONT,
      lineSpacingMultiple: 1.4,
    },
  );
  pageNo(slide, i, total, p);
}

/* ==================== PDF (print) ==================== */

function esc(s: string): string {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function slideHtml(s: Slide, i: number, total: number, p: Palette): string {
  const primary = `#${p.primary}`;
  const dark = `#${p.primaryDark}`;
  const accent = `#${p.accent}`;
  const light = `#${p.lightBg}`;
  const wrap = (inner: string, style = "") =>
    `<section class="slide" style="${style}">${inner}<div class="foot"><span>DT Copilot</span><span>${i + 1} / ${total}</span></div></section>`;
  const title = s.title
    ? `<h2>${esc(s.title)}</h2><div class="ul" style="background:${accent}"></div>`
    : "";

  if (s.type === "cover" || s.type === "closing")
    return `<section class="slide" style="background:${dark};color:#fff;justify-content:center">
      <div class="ul" style="background:${accent};margin-bottom:24px"></div>
      <h1>${esc(s.title || "")}</h1>${s.subtitle ? `<p class="sub">${esc(s.subtitle)}</p>` : ""}</section>`;
  if (s.type === "section")
    return `<section class="slide" style="background:${dark};color:#fff;justify-content:center">
      <div style="font-size:90px;font-weight:800;color:${accent}">${String(i + 1).padStart(2, "0")}</div>
      <h2 style="color:#fff">${esc(s.title || "")}</h2></section>`;
  if (s.type === "quote")
    return `<section class="slide" style="background:${light};justify-content:center;text-align:center">
      <p style="font-size:30px;font-weight:700;color:${dark};line-height:1.4">“${esc(s.quote || "")}”</p>
      ${s.by ? `<p style="color:#64748b">— ${esc(s.by)}</p>` : ""}</section>`;
  if (s.type === "stat") {
    const cards = (s.stats ?? [])
      .slice(0, 3)
      .map(
        (st) =>
          `<div class="card" style="background:${light}"><div style="font-size:38px;font-weight:800;color:${primary}">${esc(st.value)}</div><div style="color:#475569;margin-top:8px">${esc(st.label)}</div></div>`,
      )
      .join("");
    return wrap(`${title}<div class="row">${cards}</div>`);
  }
  if (s.type === "twocol") {
    const col = (t: string | undefined, items: string[] | undefined, tint: string) =>
      `<div style="flex:1">${t ? `<span class="tag" style="background:${tint}">${esc(t)}</span>` : ""}<ul>${(items ?? []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>`;
    return wrap(
      `${title}<div class="row" style="align-items:flex-start">${col(s.leftTitle, s.left, "#94a3b8")}${col(s.rightTitle, s.right, primary)}</div>`,
    );
  }
  if (s.type === "chart" && s.chart) {
    const vals = s.chart.series[0]?.values ?? [];
    const max = Math.max(1, ...vals);
    const bars = vals
      .map(
        (v, idx) =>
          `<div style="flex:1;text-align:center"><div style="font-size:12px;color:#475569">${v}</div><div style="height:${(v / max) * 200}px;background:linear-gradient(180deg,${accent},${primary});border-radius:4px 4px 0 0"></div><div style="font-size:12px;color:#64748b;margin-top:6px">${esc(s.chart!.categories[idx] ?? "")}</div></div>`,
      )
      .join("");
    return wrap(
      `${title}<div style="display:flex;gap:12px;align-items:flex-end;height:240px;margin-top:12px">${bars}</div>`,
    );
  }
  return wrap(`${title}<ul>${(s.bullets ?? []).slice(0, 6).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`);
}

export function slidesToPdf(deck: Deck, p: Palette) {
  const win = window.open("", "_blank");
  if (!win) {
    alert("เบราว์เซอร์บล็อกหน้าต่างพิมพ์ กรุณาอนุญาต popup แล้วลองใหม่");
    return;
  }
  const body = deck.slides
    .map((s, i) => slideHtml(s, i, deck.slides.length, p))
    .join("\n");
  win.document.write(`<!doctype html><html lang="th"><head><meta charset="utf-8"><title>${esc(deck.title)}</title>
  <style>
    @page{size:landscape;margin:0}
    *{box-sizing:border-box}
    body{margin:0;font-family:"Sarabun","IBM Plex Sans Thai","Noto Sans Thai",system-ui,Arial,sans-serif;color:#1f2937}
    .slide{position:relative;width:100%;aspect-ratio:16/9;padding:56px 64px;display:flex;flex-direction:column;page-break-after:always;overflow:hidden}
    h1{font-size:52px;font-weight:800;margin:0}
    h2{font-size:34px;font-weight:800;margin:0}
    .sub{font-size:22px;opacity:.9;margin-top:18px}
    .ul{width:110px;height:8px;border-radius:6px;margin-top:12px}
    ul{margin:16px 0 0 22px;line-height:1.6} li{font-size:20px;margin:8px 0}
    .row{display:flex;gap:28px;margin-top:28px}
    .card{flex:1;border-radius:16px;padding:36px 20px;text-align:center}
    .tag{display:inline-block;color:#fff;padding:5px 14px;border-radius:8px;font-weight:700;margin-bottom:14px}
    .foot{position:absolute;bottom:20px;left:64px;right:64px;display:flex;justify-content:space-between;color:#94a3b8;font-size:13px}
  </style></head><body>${body}
  <script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
  </body></html>`);
  win.document.close();
}
