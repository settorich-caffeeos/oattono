"use client";

type Bar = { label: string; value: number; color: string };

/** Simple responsive vertical bar chart with a zero baseline (handles negatives). */
export function BarChart({
  data,
  format,
  height = 200,
}: {
  data: Bar[];
  format: (n: number) => string;
  height?: number;
}) {
  const w = Math.max(data.length * 90, 200);
  const pad = 28;
  const chartH = height - pad * 2;
  const max = Math.max(0, ...data.map((d) => d.value));
  const min = Math.min(0, ...data.map((d) => d.value));
  const range = max - min || 1;
  const zeroY = pad + (max / range) * chartH;
  const bw = 46;
  const step = w / data.length;

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <line
        x1={0}
        x2={w}
        y1={zeroY}
        y2={zeroY}
        stroke="currentColor"
        className="text-slate-300 dark:text-slate-700"
        strokeWidth={1}
      />
      {data.map((d, i) => {
        const cx = i * step + step / 2;
        const h = (Math.abs(d.value) / range) * chartH;
        const y = d.value >= 0 ? zeroY - h : zeroY;
        return (
          <g key={i}>
            <rect
              x={cx - bw / 2}
              y={y}
              width={bw}
              height={Math.max(h, 1)}
              rx={4}
              fill={d.color}
            />
            <text
              x={cx}
              y={d.value >= 0 ? y - 6 : y + h + 14}
              textAnchor="middle"
              className="fill-slate-600 dark:fill-slate-300"
              fontSize={11}
              fontWeight={600}
            >
              {format(d.value)}
            </text>
            <text
              x={cx}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-400"
              fontSize={11}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Cumulative cash-flow area chart with a break-even marker. */
export function CashflowChart({
  points,
  format,
  height = 200,
}: {
  points: number[];
  format: (n: number) => string;
  height?: number;
}) {
  const w = 480;
  const padX = 8;
  const padY = 24;
  const chartH = height - padY * 2;
  const max = Math.max(...points, 0);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const n = points.length;
  const x = (i: number) => padX + (i / (n - 1)) * (w - padX * 2);
  const y = (v: number) => padY + ((max - v) / range) * chartH;
  const zeroY = y(0);

  const line = points.map((p, i) => `${x(i)},${y(p)}`).join(" ");
  const area = `${x(0)},${zeroY} ${line} ${x(n - 1)},${zeroY}`;
  const breakeven = points.findIndex((p) => p >= 0);

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="cf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <line
        x1={0}
        x2={w}
        y1={zeroY}
        y2={zeroY}
        stroke="currentColor"
        className="text-slate-300 dark:text-slate-700"
        strokeDasharray="4 4"
      />
      <polygon points={area} fill="url(#cf)" />
      <polyline
        points={line}
        fill="none"
        stroke="#4f46e5"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {breakeven > 0 && (
        <g>
          <circle cx={x(breakeven)} cy={y(points[breakeven])} r={4} fill="#10b981" />
          <text
            x={x(breakeven)}
            y={y(points[breakeven]) - 10}
            textAnchor="middle"
            className="fill-emerald-600 dark:fill-emerald-400"
            fontSize={11}
            fontWeight={700}
          >
            คืนทุน ~เดือน {breakeven}
          </text>
        </g>
      )}
      <text x={padX} y={height - 4} className="fill-slate-400" fontSize={10}>
        เดือน 0
      </text>
      <text
        x={w - padX}
        y={height - 4}
        textAnchor="end"
        className="fill-slate-400"
        fontSize={10}
      >
        เดือน {n - 1}: {format(points[n - 1])}
      </text>
    </svg>
  );
}
