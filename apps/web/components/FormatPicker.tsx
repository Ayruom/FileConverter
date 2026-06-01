"use client";

import { useEffect, useMemo, useState } from "react";
import { Conversion, CONVERSIONS, labelFor } from "@/lib/formats";

type PickerAnalytics = {
  slug: string;
  total: number;
  trend?: number[];
};

type FormatPickerProps = {
  selected?: Conversion;
  onSelect: (conversion: Conversion) => void;
};

const PICKER_CONVERSIONS = CONVERSIONS.slice(0, 26);

function conversionLabel(conversion: Conversion) {
  return conversion.label ?? `${labelFor(conversion.from)} to ${labelFor(conversion.to)}`;
}

function metricScore(metric: PickerAnalytics | undefined) {
  if (!metric) {
    return 0;
  }

  const recent = metric.trend?.reduce((sum, value) => sum + value, 0) ?? 0;
  return metric.total * 10 + recent;
}

export function FormatPicker({ selected, onSelect }: FormatPickerProps) {
  const [analytics, setAnalytics] = useState<PickerAnalytics[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const response = await fetch("/api/analytics/popular", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { conversions?: PickerAnalytics[] };
        if (!cancelled) {
          setAnalytics(data.conversions ?? []);
        }
      } catch {
        if (!cancelled) {
          setAnalytics([]);
        }
      }
    }

    refresh();
    const interval = window.setInterval(refresh, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const rankedConversions = useMemo(() => {
    const metrics = new Map(analytics.map((item) => [item.slug, item]));
    return [...PICKER_CONVERSIONS].sort((left, right) => {
      const scoreDifference = metricScore(metrics.get(right.slug)) - metricScore(metrics.get(left.slug));
      if (scoreDifference !== 0) {
        return scoreDifference;
      }
      return (right.priority ?? 0) - (left.priority ?? 0);
    });
  }, [analytics]);

  const hotSlugs = useMemo(() => {
    const rankedWithUsage = rankedConversions.filter((conversion) => metricScore(analytics.find((item) => item.slug === conversion.slug)) > 0);
    return new Set(rankedWithUsage.slice(0, 3).map((conversion) => conversion.slug));
  }, [analytics, rankedConversions]);

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {rankedConversions.map((conversion) => {
        const active = selected?.slug === conversion.slug;
        const hot = hotSlugs.has(conversion.slug);
        const label = conversionLabel(conversion);

        if (hot) {
          return (
            <div key={conversion.slug} className="badge-btn-container">
              <span className="btn-badge">
                <span className="badge-icon" aria-hidden="true">
                  🔥
                </span>
                Popular
              </span>
              <button
                type="button"
                onClick={() => onSelect(conversion)}
                title="Popular with users"
                className={`popular-btn btn-border-sweep ${active ? "popular-btn-active" : ""}`}
              >
                <span className="btn-content">
                  <span>{label}</span>
                </span>
              </button>
            </div>
          );
        }

        return (
          <button
            key={conversion.slug}
            type="button"
            onClick={() => onSelect(conversion)}
            className={`inline-flex min-h-10 items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition ${
              active
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-zinc-300 hover:border-accent hover:text-white"
            }`}
          >
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
