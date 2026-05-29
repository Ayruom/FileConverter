"use client";

import * as Progress from "@radix-ui/react-progress";
import { CheckCircle2, ShieldCheck } from "lucide-react";

type ConversionProgressProps = {
  progress: number;
  stage: string;
  complete?: boolean;
};

export function ConversionProgress({ progress, stage, complete }: ConversionProgressProps) {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-zinc-200">{stage}</span>
        <span className="font-mono text-muted">{progress}%</span>
      </div>
      <Progress.Root className="relative h-2 overflow-hidden rounded-full bg-surface2" value={progress}>
        <Progress.Indicator
          className="h-full rounded-full bg-accent transition-transform duration-500"
          style={{ transform: `translateX(-${100 - progress}%)` }}
        />
      </Progress.Root>
      {complete ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Conversion ready.
          <ShieldCheck className="ml-2 h-4 w-4" />
          File deleted after download.
        </div>
      ) : null}
    </div>
  );
}
