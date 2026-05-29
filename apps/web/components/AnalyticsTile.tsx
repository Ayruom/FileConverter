import Link from "next/link";
import { labelFor } from "@/lib/formats";
import type { Conversion } from "@/lib/formats";

export type ConversionAnalytics = {
  slug: string;
  total: number;
  trend: number[];
  mix: number[];
  labels: {
    trend: string[];
    mix: string[];
  };
  updatedAt?: number;
};

type AnalyticsTileProps = {
  analytics: ConversionAnalytics;
  conversion: Conversion;
  isLocal?: boolean;
};

const COLORS = ["#6c63ff", "#10b981", "#a78bfa"];
const CIRCLE_CIRCUMFERENCE = 100;

function sparkPath(values: number[], width: number, height: number) {
  const max = Math.max(1, ...values);
  return values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function arcSegments(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  let offset = 0;
  return values.map((value, index) => {
    const size = total > 0 ? (value / total) * CIRCLE_CIRCUMFERENCE : 0;
    const segment = {
      size,
      offset,
      color: COLORS[index] ?? COLORS[0],
      value
    };
    offset += size;
    return segment;
  });
}

function MiniAnalytics({ analytics, chartId }: { analytics: ConversionAnalytics; chartId: string }) {
  const arcs = arcSegments(analytics.mix);
  const maxTrend = Math.max(1, ...analytics.trend);

  return (
    <div className="pointer-events-none absolute inset-0 opacity-95 transition duration-500 group-hover:opacity-100">
      <svg className="absolute bottom-4 left-4 h-14 w-[64%]" viewBox="0 0 170 56" aria-hidden="true">
        <defs>
          <linearGradient id={`miniArea-${chartId}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#6c63ff" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id={`miniBar-${chartId}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.78" />
          </linearGradient>
        </defs>
        {analytics.trend.map((value, index) => {
          const height = value > 0 ? Math.max(10, (value / maxTrend) * 32) : 0;
          const x = 5 + index * 23;
          return height > 0 ? (
            <rect
              key={`${chartId}-mini-bar-${index}-${value}`}
              x={x}
              y={44 - height}
              width="12"
              height={height}
              rx="4"
              fill={`url(#miniBar-${chartId})`}
              opacity="0.76"
            />
          ) : null;
        })}
        <path d={`${sparkPath(analytics.trend, 160, 34)} L 160 50 L 0 50 Z`} fill={`url(#miniArea-${chartId})`} opacity="0.42" />
        <path
          d={sparkPath(analytics.trend, 160, 34)}
          fill="none"
          stroke="rgba(167,139,250,0.94)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(0 10)"
        />
      </svg>
      <svg className="absolute right-7 top-7 h-14 w-14 -rotate-90" viewBox="0 0 42 42" aria-hidden="true">
        <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="5.5" />
        {arcs.filter((arc) => arc.value > 0).map((arc, index) => (
          <circle
            key={`${chartId}-mini-arc-${index}-${arc.value}`}
            cx="21"
            cy="21"
            r="15.9"
            fill="transparent"
            stroke={arc.color}
            pathLength={100}
            strokeDasharray={`${arc.size} ${100 - arc.size}`}
            strokeDashoffset={`-${arc.offset}`}
            strokeWidth="5.5"
            strokeLinecap="butt"
          />
        ))}
      </svg>
    </div>
  );
}

function ExpandedAnalytics({
  analytics,
  chartId,
  isLocal,
  title
}: {
  analytics: ConversionAnalytics;
  chartId: string;
  isLocal?: boolean;
  title: string;
}) {
  const arcs = arcSegments(analytics.mix);
  const maxTrend = Math.max(1, ...analytics.trend);

  return (
    <div className="pointer-events-none invisible fixed left-1/2 top-1/2 z-50 w-[min(92vw,46rem)] -translate-x-1/2 -translate-y-1/2 scale-95 rounded-lg border border-accent/40 bg-bg/95 p-5 opacity-0 shadow-2xl shadow-accent/20 backdrop-blur-xl transition duration-300 group-hover:visible group-hover:scale-100 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:scale-100 group-focus-visible:opacity-100">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs text-muted">{isLocal ? "Live local test conversions" : "Live customer conversions"}</p>
        </div>
        <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_18px_rgba(16,185,129,0.9)]" />
      </div>
      <div className="grid gap-5 sm:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">Conversion source</p>
          <svg viewBox="0 0 180 180" className="mx-auto h-44 w-44" role="img" aria-label={`${title} conversion source mix`}>
            <circle cx="90" cy="90" r="56" fill="transparent" stroke="rgba(255,255,255,0.07)" strokeWidth="22" />
            {arcs.filter((arc) => arc.value > 0).map((arc, index) => (
              <circle
                key={`${chartId}-arc-${index}-${arc.value}`}
                cx="90"
                cy="90"
                r="56"
                fill="transparent"
                stroke={arc.color}
                pathLength={100}
                strokeDasharray={`${arc.size} ${100 - arc.size}`}
                strokeDashoffset={`-${arc.offset}`}
                strokeWidth="22"
                strokeLinecap="butt"
                transform="rotate(-90 90 90)"
              />
            ))}
            <circle cx="90" cy="90" r="32" fill="#0a0a0f" />
          </svg>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {analytics.labels.mix.map((label, index) => (
              <div key={`${chartId}-legend-${label}`} className="flex items-center gap-1.5 text-[0.68rem] text-zinc-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">Last 7 days</p>
          <svg viewBox="0 0 340 210" className="h-56 w-full" role="img" aria-label={`${title} conversions over the last seven days`}>
            <defs>
              <linearGradient id={`barGradient-${chartId}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((line) => (
              <line key={`${chartId}-grid-${line}`} x1="8" x2="326" y1={32 + line * 36} y2={32 + line * 36} stroke="rgba(255,255,255,0.08)" />
            ))}
            {analytics.trend.map((value, index) => {
              const height = value > 0 ? Math.max(10, (value / maxTrend) * 118) : 0;
              const x = 18 + index * 45;
              return (
                <g key={`${chartId}-bar-${index}`}>
                  {height > 0 ? (
                    <rect
                      x={x}
                      y={154 - height}
                      width="25"
                      height={height}
                      rx="6"
                      fill={`url(#barGradient-${chartId})`}
                      opacity={0.74 + index * 0.03}
                    />
                  ) : null}
                  <text x={x + 12.5} y="188" textAnchor="middle" fill="#6b7280" fontSize="10">
                    {analytics.labels.trend[index]}
                  </text>
                </g>
              );
            })}
            <path
              d={sparkPath(analytics.trend, 292, 98)}
              transform="translate(28 48)"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.65"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsTile({ analytics, conversion, isLocal }: AnalyticsTileProps) {
  const title = `${labelFor(conversion.from)} to ${labelFor(conversion.to)}`;
  const chartId = conversion.slug.replace(/[^a-z0-9-]/g, "");

  return (
    <Link
      href={`/${conversion.slug}`}
      className="group relative isolate min-h-36 overflow-visible rounded-lg border border-border bg-surface p-4 transition duration-300 hover:z-[70] hover:border-accent hover:bg-surface2 focus-visible:z-[70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <MiniAnalytics analytics={analytics} chartId={chartId} />
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface/70 to-bg/35" />
      </div>
      <span className="relative z-10 text-sm font-semibold text-white">{title}</span>
      <p className="relative z-10 mt-2 text-xs text-muted">{isLocal ? "Live local tests" : "Live customer usage"}</p>
      <ExpandedAnalytics analytics={analytics} title={title} chartId={chartId} isLocal={isLocal} />
    </Link>
  );
}
