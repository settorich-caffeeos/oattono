"use client";

import type { CSSProperties } from "react";
import type { Slide, Palette } from "@/lib/slides-types";

export default function SlideView({
  slide,
  palette,
  index,
  total,
  logo,
}: {
  slide: Slide;
  palette: Palette;
  index: number;
  total: number;
  logo?: string;
}) {
  const primary = `#${palette.primary}`;
  const primaryDark = `#${palette.primaryDark}`;
  const accent = `#${palette.accent}`;
  const text = `#${palette.text}`;
  const light = `#${palette.lightBg}`;

  const base: CSSProperties = {
    containerType: "size",
    aspectRatio: "16 / 9",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    borderRadius: "1.2cqw",
    background: palette.bg === "FFFFFF" ? "#fff" : `#${palette.bg}`,
    color: text,
    fontFamily:
      '"Sarabun","IBM Plex Sans Thai","Noto Sans Thai",system-ui,Arial,sans-serif',
  };

  const pad: CSSProperties = { position: "absolute", inset: 0, padding: "7cqw 8cqw" };

  // โลโก้มุมขวาบน (สไลด์เนื้อหาพื้นสว่าง)
  const cornerLogo = logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt=""
      style={{
        position: "absolute",
        top: "5cqh",
        right: "8cqw",
        height: "7cqh",
        maxWidth: "22cqw",
        objectFit: "contain",
      }}
    />
  ) : null;

  // โลโก้บนพื้นเข้ม (cover/section/closing) — วางในชิปขาวให้เห็นชัดทุกโลโก้
  const chipLogo = logo ? (
    <div
      style={{
        position: "absolute",
        top: "6cqh",
        left: "8cqw",
        background: "#fff",
        borderRadius: "1.4cqw",
        padding: "1.4cqh 2cqw",
        boxShadow: "0 0.4cqh 1.6cqw rgba(0,0,0,0.18)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo}
        alt=""
        style={{ height: "6cqh", maxWidth: "20cqw", objectFit: "contain", display: "block" }}
      />
    </div>
  ) : null;

  const footer = (
    <div
      style={{
        position: "absolute",
        bottom: "3cqh",
        left: "8cqw",
        right: "8cqw",
        display: "flex",
        justifyContent: "space-between",
        fontSize: "2cqw",
        color: "#94a3b8",
      }}
    >
      <span>DT Copilot</span>
      <span>
        {index + 1} / {total}
      </span>
    </div>
  );

  const titleBar = slide.title ? (
    <div style={{ marginBottom: "4cqh" }}>
      <h2 style={{ fontSize: "5cqw", fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
        {slide.title}
      </h2>
      <div
        style={{
          marginTop: "1.5cqh",
          width: "12cqw",
          height: "0.9cqh",
          background: accent,
          borderRadius: "1cqw",
        }}
      />
    </div>
  ) : null;

  // ---- Cover / Section / Closing (colored full-bleed) ----
  if (slide.type === "cover" || slide.type === "closing") {
    return (
      <div
        style={{
          ...base,
          background: `linear-gradient(135deg, ${primary}, ${primaryDark})`,
          color: "#fff",
        }}
      >
        {chipLogo}
        <div
          style={{
            ...pad,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "10cqw",
              height: "1.2cqh",
              background: accent,
              borderRadius: "1cqw",
              marginBottom: "4cqh",
            }}
          />
          <h1 style={{ fontSize: "7.5cqw", fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p style={{ fontSize: "3.4cqw", marginTop: "3cqh", opacity: 0.9 }}>
              {slide.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (slide.type === "section") {
    return (
      <div style={{ ...base, background: primaryDark, color: "#fff" }}>
        {chipLogo}
        <div style={{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "9cqw", fontWeight: 800, color: accent, lineHeight: 1 }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <h2 style={{ fontSize: "6.5cqw", fontWeight: 800, marginTop: "2cqh" }}>
            {slide.title}
          </h2>
        </div>
      </div>
    );
  }

  if (slide.type === "quote") {
    return (
      <div style={{ ...base, background: light }}>
        <div style={{ ...pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "14cqw", color: accent, lineHeight: 0.7, fontWeight: 800 }}>
            &ldquo;
          </span>
          <p style={{ fontSize: "5cqw", fontWeight: 700, lineHeight: 1.35, margin: "1cqh 0", color: primaryDark }}>
            {slide.quote}
          </p>
          {slide.by && (
            <p style={{ fontSize: "3cqw", color: "#64748b" }}>— {slide.by}</p>
          )}
        </div>
        {cornerLogo}
        {footer}
      </div>
    );
  }

  // ---- Stat ----
  if (slide.type === "stat") {
    const stats = (slide.stats ?? []).slice(0, 3);
    return (
      <div style={base}>
        <div style={pad}>
          {titleBar}
          <div style={{ display: "flex", gap: "4cqw", marginTop: "6cqh" }}>
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: light,
                  borderRadius: "2cqw",
                  padding: "5cqw 3cqw",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "7cqw", fontWeight: 800, color: primary, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "2.6cqw", color: "#475569", marginTop: "2cqh" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        {cornerLogo}
        {footer}
      </div>
    );
  }

  // ---- Two column ----
  if (slide.type === "twocol") {
    const col = (t: string | undefined, items: string[] | undefined, tint: string) => (
      <div style={{ flex: 1 }}>
        {t && (
          <div
            style={{
              fontSize: "3cqw",
              fontWeight: 700,
              color: "#fff",
              background: tint,
              display: "inline-block",
              padding: "1cqh 2.5cqw",
              borderRadius: "1cqw",
              marginBottom: "3cqh",
            }}
          >
            {t}
          </div>
        )}
        <ul style={{ margin: 0, paddingLeft: "4cqw" }}>
          {(items ?? []).map((b, i) => (
            <li key={i} style={{ fontSize: "3cqw", lineHeight: 1.5, marginBottom: "1.6cqh" }}>
              {b}
            </li>
          ))}
        </ul>
      </div>
    );
    return (
      <div style={base}>
        <div style={pad}>
          {titleBar}
          <div style={{ display: "flex", gap: "6cqw", marginTop: "3cqh" }}>
            {col(slide.leftTitle, slide.left, "#94a3b8")}
            {col(slide.rightTitle, slide.right, primary)}
          </div>
        </div>
        {cornerLogo}
        {footer}
      </div>
    );
  }

  // ---- Chart (simple bar preview) ----
  if (slide.type === "chart" && slide.chart) {
    const c = slide.chart;
    const vals = c.series[0]?.values ?? [];
    const max = Math.max(1, ...vals);
    return (
      <div style={base}>
        <div style={pad}>
          {titleBar}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "3cqw",
              height: "44cqh",
              marginTop: "3cqh",
            }}
          >
            {vals.map((v, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: "2.4cqw", color: "#475569", marginBottom: "1cqh" }}>
                  {v}
                </div>
                <div
                  style={{
                    height: `${(v / max) * 100}%`,
                    background: `linear-gradient(180deg, ${accent}, ${primary})`,
                    borderRadius: "1cqw 1cqw 0 0",
                    minHeight: "1cqh",
                  }}
                />
                <div style={{ fontSize: "2.2cqw", color: "#64748b", marginTop: "1.5cqh" }}>
                  {c.categories[i] ?? ""}
                </div>
              </div>
            ))}
          </div>
          {c.series[0]?.name && (
            <div style={{ fontSize: "2.4cqw", color: "#94a3b8", marginTop: "2cqh" }}>
              {c.series[0].name}
            </div>
          )}
        </div>
        {cornerLogo}
        {footer}
      </div>
    );
  }

  // ---- Default: bullets ----
  return (
    <div style={base}>
      <div style={pad}>
        {titleBar}
        <ul style={{ margin: 0, paddingLeft: "5cqw", marginTop: "2cqh" }}>
          {(slide.bullets ?? []).slice(0, 6).map((b, i) => (
            <li
              key={i}
              style={{
                fontSize: "3.2cqw",
                lineHeight: 1.5,
                marginBottom: "2.2cqh",
                color: text,
              }}
            >
              {b}
            </li>
          ))}
        </ul>
      </div>
      {footer}
    </div>
  );
}
