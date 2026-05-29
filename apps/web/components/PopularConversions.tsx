"use client";

import { useEffect, useMemo, useState } from "react";
import { AnalyticsTile } from "@/components/AnalyticsTile";
import type { ConversionAnalytics } from "@/components/AnalyticsTile";
import { CONVERSIONS } from "@/lib/formats";

type AnalyticsResponse = {
  conversions: ConversionAnalytics[];
};

async function fetchPopularAnalytics() {
  const response = await fetch("/api/analytics/popular", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<AnalyticsResponse>;
}

export function PopularConversions() {
  const [analytics, setAnalytics] = useState<ConversionAnalytics[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLocal(["localhost", "127.0.0.1", "::1"].includes(window.location.hostname));

    async function refresh() {
      try {
        const nextAnalytics = await fetchPopularAnalytics();
        if (!cancelled) {
          setAnalytics(nextAnalytics.conversions);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    refresh();
    const interval = window.setInterval(refresh, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const visibleConversions = useMemo(
    () =>
      analytics
        .map((item) => ({
          analytics: item,
          conversion: CONVERSIONS.find((conversion) => conversion.slug === item.slug)
        }))
        .filter((item): item is { analytics: ConversionAnalytics; conversion: (typeof CONVERSIONS)[number] } =>
          Boolean(item.conversion)
        ),
    [analytics]
  );

  return (
    <section id="tools" className="mx-auto max-w-6xl px-4 pb-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Popular conversions</h2>
          <p className="mt-2 text-sm text-muted">
            {isLocal ? "Live local test conversion activity, updated automatically." : "Live customer conversion activity, updated automatically."}
          </p>
        </div>
      </div>
      {visibleConversions.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {visibleConversions.map(({ analytics: item, conversion }) => (
            <AnalyticsTile key={item.slug} analytics={item} conversion={conversion} isLocal={isLocal} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-6 text-sm text-muted">
          {loaded
            ? isLocal
              ? "Local test analytics will appear here after completed conversions."
              : "Customer conversion analytics will appear here after completed conversions."
            : "Loading live conversion analytics..."}
        </div>
      )}
    </section>
  );
}
