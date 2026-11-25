"use client";

import React, { useEffect, useState } from "react";
import { Flame, Loader2 } from "lucide-react";

interface ContributionCell {
  count: number;
  level: number;
}
interface ContributionPayload {
  ok: boolean;
  totalLastYear?: number;
  weeks?: Array<Array<ContributionCell | null>>;
  error?: string;
}

const LEVEL_COLORS = [
  "rgba(255,255,255,0.05)",
  "rgba(124,58,237,0.32)",
  "rgba(124,58,237,0.55)",
  "#7C3AED",
  "#06B6D4",
];

/**
 * Genuine GitHub contribution heatmap (last 365 days), proxied server-side
 * through /api/github-contributions (free, key-less public API, cached 1h).
 */
export function GithubContributionGraph({ username }: { username: string }) {
  const [state, setState] = useState<
    { status: "loading" } | { status: "error"; message: string } | {
        status: "ready";
        total: number;
        weeks: Array<Array<ContributionCell | null>>;
      }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/github-contributions?username=${encodeURIComponent(username)}`)
      .then(async (res) => (await res.json()) as ContributionPayload)
      .then((json) => {
        if (cancelled) return;
        if (json.ok && json.weeks) {
          setState({
            status: "ready",
            total: json.totalLastYear ?? 0,
            weeks: json.weeks,
          });
        } else {
          setState({
            status: "error",
            message: json.error || "Contribution graph unavailable.",
          });
        }
      })
      .catch(() => {
        if (!cancelled)
          setState({ status: "error", message: "Contribution graph unavailable." });
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (state.status === "loading") {
    return (
      <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 font-mono text-[11px] text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
        synchronizing contribution graph…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 font-mono text-[11px] text-slate-500">
        {state.message} — the GitHub profile link above always remains valid.
      </div>
    );
  }

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/30">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-2.5">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-slate-400 uppercase">
          <Flame className="h-3.5 w-3.5 text-violet-400" />
          Contribution Streak — Last 365 Days
        </div>
        <div className="font-mono text-[11px] font-bold text-cyan-300">
          {state.total.toLocaleString()} contributions
        </div>
      </div>
      <div className="overflow-x-auto px-4 py-3">
        <div
          className="grid w-max grid-flow-col gap-[3px]"
          style={{ gridTemplateRows: "repeat(7, 10px)" }}
          role="img"
          aria-label={`GitHub contribution heatmap for the last 365 days: ${state.total} total contributions`}
        >
          {state.weeks.flatMap((week, wi) =>
            week.map((cell, di) => (
              <div
                key={`${wi}-${di}`}
                title={cell ? `${cell.count} contribution(s)` : ""}
                className="h-[10px] w-[10px] rounded-[2px]"
                style={{
                  backgroundColor: cell
                    ? LEVEL_COLORS[cell.level]
                    : "transparent",
                }}
              />
            ))
          )}
        </div>
        <div className="mt-2.5 flex items-center justify-end gap-1.5 font-mono text-[9px] text-slate-500">
          less
          {LEVEL_COLORS.map((c, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: c }}
            />
          ))}
          more
        </div>
      </div>
    </div>
  );
}
