"use client";

import { useMemo, useState } from "react";
import { streamPost } from "@/lib/client";
import MarkdownView from "@/components/MarkdownView";
import DocActions from "@/components/DocActions";
import { BarChart, CashflowChart } from "@/components/Charts";

type Inputs = {
  employees: number;
  tasksPerMonth: number;
  hoursPerTask: number;
  hourlyCost: number;
  timeSavingPct: number;
  annualCost: number;
  oneTimeCost: number;
};

const DEFAULTS: Inputs = {
  employees: 10,
  tasksPerMonth: 4,
  hoursPerTask: 16,
  hourlyCost: 500,
  timeSavingPct: 80,
  annualCost: 1_200_000,
  oneTimeCost: 500_000,
};

const FIELDS: {
  key: keyof Inputs;
  label: string;
  hint?: string;
  step?: number;
}[] = [
  { key: "employees", label: "จำนวนพนักงานที่เกี่ยวข้อง (คน)" },
  { key: "tasksPerMonth", label: "จำนวนงาน/เอกสารต่อคนต่อเดือน" },
  { key: "hoursPerTask", label: "เวลาที่ใช้ต่อชิ้น (ชั่วโมง)", hint: "2 วัน ≈ 16 ชม." },
  { key: "hourlyCost", label: "ต้นทุนแรงงานต่อชั่วโมง (บาท)", step: 50 },
  { key: "timeSavingPct", label: "สัดส่วนเวลาที่ประหยัดได้ (%)", hint: "0–100" },
  { key: "annualCost", label: "ค่าใช้จ่ายโซลูชันต่อปี (บาท)", step: 10000 },
  { key: "oneTimeCost", label: "ค่าใช้จ่ายเริ่มต้นครั้งเดียว (บาท)", step: 10000 },
];

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(
    Math.round(n),
  );
}

export default function RoiPage() {
  const [inp, setInp] = useState<Inputs>(DEFAULTS);
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);

  const m = useMemo(() => {
    const currentHoursMonth =
      inp.employees * inp.tasksPerMonth * inp.hoursPerTask;
    const savedHoursMonth = currentHoursMonth * (inp.timeSavingPct / 100);
    const monthlyGross = savedHoursMonth * inp.hourlyCost;
    const annualGross = monthlyGross * 12;
    const netAnnual = annualGross - inp.annualCost;
    const monthlyNet = monthlyGross - inp.annualCost / 12;
    const totalInvestYear = inp.annualCost + inp.oneTimeCost;
    const roiPct = totalInvestYear > 0 ? (netAnnual / totalInvestYear) * 100 : 0;
    const paybackMonths =
      monthlyNet > 0 ? inp.oneTimeCost / monthlyNet : Infinity;
    return {
      currentHoursMonth,
      savedHoursMonth,
      monthlyGross,
      monthlyNet,
      annualGross,
      annualCost: inp.annualCost,
      netAnnual,
      roiPct,
      paybackMonths,
    };
  }, [inp]);

  const cashflow = useMemo(
    () =>
      Array.from({ length: 25 }, (_, month) => -inp.oneTimeCost + m.monthlyNet * month),
    [inp.oneTimeCost, m.monthlyNet],
  );

  async function generateNarrative() {
    setLoading(true);
    setNarrative("");
    const prompt = `จัดทำ "บทวิเคราะห์ความคุ้มค่า (ROI Analysis)" ในรูปแบบ Markdown จากตัวเลขต่อไปนี้ ให้มีหัวข้อ: บทสรุปผู้บริหาร, สมมติฐาน, การคำนวณผลประหยัด, ผลตอบแทนและระยะคืนทุน, ความเสี่ยง/ข้อควรระวัง, ข้อเสนอแนะ พร้อมตารางสรุปตัวเลข

สมมติฐาน:
- จำนวนพนักงานที่เกี่ยวข้อง: ${inp.employees} คน
- งาน/เอกสารต่อคนต่อเดือน: ${inp.tasksPerMonth}
- เวลาที่ใช้ต่อชิ้นเดิม: ${inp.hoursPerTask} ชั่วโมง
- ต้นทุนแรงงานต่อชั่วโมง: ${fmt(inp.hourlyCost)} บาท
- สัดส่วนเวลาที่ประหยัดได้: ${inp.timeSavingPct}%
- ค่าใช้จ่ายโซลูชันต่อปี: ${fmt(inp.annualCost)} บาท
- ค่าใช้จ่ายเริ่มต้นครั้งเดียว: ${fmt(inp.oneTimeCost)} บาท

ผลการคำนวณ:
- ชั่วโมงงานที่ประหยัดต่อเดือน: ${fmt(m.savedHoursMonth)} ชม.
- ผลประหยัดต่อเดือน (gross): ${fmt(m.monthlyGross)} บาท
- ผลประหยัดต่อปี (gross): ${fmt(m.annualGross)} บาท
- ผลตอบแทนสุทธิต่อปี: ${fmt(m.netAnnual)} บาท
- ROI: ${m.roiPct.toFixed(0)}%
- ระยะคืนทุน: ${isFinite(m.paybackMonths) ? m.paybackMonths.toFixed(1) + " เดือน" : "ไม่คืนทุนภายใต้สมมติฐานนี้"}

วิเคราะห์เชิงลึก ชี้จุดคุ้มค่าและความเสี่ยง โดยอ้างอิงบริบทองค์กร/ธนาคาร`;
    try {
      await streamPost(
        "/api/chat",
        {
          agentId: "financial-analyst",
          messages: [{ role: "user", content: prompt }],
        },
        (chunk) => setNarrative((p) => p + chunk),
      );
    } catch (e) {
      setNarrative(`⚠️ ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  const metricCards = [
    {
      label: "ผลประหยัดต่อปี",
      value: fmt(m.annualGross) + " ฿",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "ผลตอบแทนสุทธิ/ปี",
      value: fmt(m.netAnnual) + " ฿",
      accent:
        m.netAnnual >= 0
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400",
    },
    {
      label: "ROI",
      value: m.roiPct.toFixed(0) + "%",
      accent: "text-brand-600 dark:text-brand-400",
    },
    {
      label: "ระยะคืนทุน",
      value: isFinite(m.paybackMonths)
        ? m.paybackMonths.toFixed(1) + " เดือน"
        : "—",
      accent: "text-slate-700 dark:text-slate-200",
    },
  ];

  return (
    <div>
      <header className="mb-6 flex items-start gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl dark:bg-brand-900/30">
          🧮
        </span>
        <div>
          <h1 className="text-2xl font-bold">ROI Calculator</h1>
          <p className="text-slate-500 dark:text-slate-400">
            คำนวณความคุ้มค่าของโครงการจากเวลาและต้นทุนที่ประหยัดได้
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Inputs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            สมมติฐาน
          </h2>
          <div className="space-y-3">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span>{f.label}</span>
                  {f.hint && (
                    <span className="text-xs font-normal text-slate-400">
                      {f.hint}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step={f.step || 1}
                  value={Number.isFinite(inp[f.key]) ? inp[f.key] : ""}
                  onChange={(e) =>
                    setInp((v) => ({
                      ...v,
                      [f.key]: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {metricCards.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <p className="text-xs text-slate-400">{c.label}</p>
                <p className={`mt-1 text-2xl font-bold ${c.accent}`}>
                  {c.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              รายละเอียดการคำนวณ
            </h3>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-slate-500">ชั่วโมงงานปัจจุบัน/เดือน</dt>
              <dd className="text-right font-medium">
                {fmt(m.currentHoursMonth)} ชม.
              </dd>
              <dt className="text-slate-500">ชั่วโมงที่ประหยัด/เดือน</dt>
              <dd className="text-right font-medium">
                {fmt(m.savedHoursMonth)} ชม.
              </dd>
              <dt className="text-slate-500">ผลประหยัด/เดือน</dt>
              <dd className="text-right font-medium">{fmt(m.monthlyGross)} ฿</dd>
              <dt className="text-slate-500">ผลประหยัด/ปี</dt>
              <dd className="text-right font-medium">{fmt(m.annualGross)} ฿</dd>
            </dl>
          </div>

          {/* Charts */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                เปรียบเทียบต่อปี
              </h3>
              <BarChart
                format={(n) => fmt(n) + "฿"}
                data={[
                  { label: "ประหยัด", value: m.annualGross, color: "#10b981" },
                  { label: "ค่าโซลูชัน", value: m.annualCost, color: "#94a3b8" },
                  {
                    label: "สุทธิ",
                    value: m.netAnnual,
                    color: m.netAnnual >= 0 ? "#4f46e5" : "#f43f5e",
                  },
                ]}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                กระแสเงินสะสม (จุดคืนทุน)
              </h3>
              <CashflowChart points={cashflow} format={(n) => fmt(n) + "฿"} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                บทวิเคราะห์ด้วย AI
              </h3>
              {!loading ? (
                <button
                  onClick={generateNarrative}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  ✨ สร้างบทวิเคราะห์
                </button>
              ) : (
                <span className="text-sm text-slate-400">กำลังสร้าง…</span>
              )}
            </div>
            {narrative ? (
              <>
                <MarkdownView content={narrative} />
                {!loading && (
                  <div className="mt-4">
                    <DocActions
                      title="ROI Analysis"
                      content={narrative}
                      moduleSlug="roi-calculator"
                    />
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">
                กดปุ่มเพื่อให้ Financial Analyst เขียนบทวิเคราะห์ความคุ้มค่าจากตัวเลขข้างต้น
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
