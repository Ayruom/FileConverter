"use client";

import { Download, ShieldCheck } from "lucide-react";

type DownloadCardProps = {
  onDownload: () => void;
  filename?: string;
  state?: "ready" | "downloading" | "downloaded";
};

export function DownloadCard({ onDownload, filename, state = "ready" }: DownloadCardProps) {
  const disabled = state !== "ready";
  const label = state === "downloading" ? "Downloading..." : state === "downloaded" ? "Downloaded" : "Download";

  return (
    <div className="mx-auto w-full max-w-2xl rounded-lg border border-success/40 bg-success/10 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">{filename ?? "Your converted file is ready"}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-success" />
            {state === "downloaded" ? "Server copy deleted." : "Deleted from the server as soon as download finishes."}
          </p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-semibold text-bg disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
        >
          <Download className="h-4 w-4" />
          {label}
        </button>
      </div>
    </div>
  );
}
