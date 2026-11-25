"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Terminal } from "lucide-react";

interface IdentityTerminalProps {
  name: string;
  headline: string;
  shortIntro: string;
  email: string;
  availabilityText: string;
  topSkills: string[];
  projectsCount: number;
  completedProjects: number;
  technologiesCount: number;
}

interface Line {
  id: number;
  text: string;
  kind: "cmd" | "out" | "ok" | "err";
}

let lineId = 0;
const nextId = () => ++lineId;

/**
 * Terminal-inspired identity panel. Genuine data (name, email, counts) is
 * injected from the live portfolio database — nothing here is mocked.
 * Visitors can type commands or tap the quick-command chips.
 */
export function IdentityTerminal({
  name,
  headline,
  shortIntro,
  email,
  availabilityText,
  topSkills,
  projectsCount,
  completedProjects,
  technologiesCount,
}: IdentityTerminalProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const reduced = useRef(false);

  const summary = useMemo(() => {
    const intro = shortIntro.replace(/\s+/g, " ").trim();
    return intro.length > 150 ? `${intro.slice(0, 147)}...` : intro;
  }, [shortIntro]);

  const resolveCommand = (raw: string): Line[] => {
    const cmd = raw.trim().toLowerCase();
    const out = (text: string, kind: Line["kind"] = "out"): Line => ({
      id: nextId(),
      text,
      kind,
    });
    switch (cmd) {
      case "help":
        return [
          out("available commands:", "ok"),
          out("whoami     — identity summary"),
          out("about      — personal introduction"),
          out("skills     — primary technologies"),
          out("projects   — engineering build log"),
          out("contact    — direct email channel"),
          out("availability — current status"),
          out("sudo hire-me — elevated privileges"),
          out("clear      — flush terminal buffer"),
        ];
      case "whoami":
        return [out(`${name}`, "ok"), out(headline)];
      case "about":
        return [out(summary)];
      case "skills":
      case "stack":
        return [
          out(topSkills.slice(0, 8).join("  •  "), "ok"),
          out(`${technologiesCount} technologies tracked across all domains.`),
        ];
      case "projects":
        return [
          out(
            `${projectsCount} engineering projects documented (${completedProjects} fully completed).`,
            "ok"
          ),
          out("scroll to #projects for case studies."),
        ];
      case "contact":
      case "email":
        return [out(email, "ok"), out("or use the contact form in #contact.")];
      case "availability":
      case "status":
        return [out(`status: online — ${availabilityText}`, "ok")];
      case "sudo hire-me":
      case "hire-me":
        return [
          out("[sudo] authenticating recruiter... ok", "out"),
          out("privileges elevated. payload: immediate-interview.request", "ok"),
          out("hint: use the form below or email directly. response guaranteed."),
        ];
      case "resume":
        return [
          out("resume.pdf — generated live from this database at /api/resume", "ok"),
        ];
      case "clear":
        return [];
      default:
        return [
          out(`command not found: ${cmd} — type 'help'`, "err"),
        ];
    }
  };

  const runCommand = (raw: string, echo = true) => {
    const trimmed = raw.trim();
    if (trimmed.toLowerCase() === "clear") {
      setLines([]);
      return;
    }
    const echoLine: Line | null = echo
      ? { id: nextId(), text: `$ ${trimmed}`, kind: "cmd" }
      : null;
    const result = resolveCommand(trimmed);
    setLines((prev) => [...prev, ...(echoLine ? [echoLine] : []), ...result]);
  };

  // Boot sequence — typed line reveal (instant when reduced motion is set)
  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const boot: Array<{ cmd: string; echo: boolean }> = [
      { cmd: "whoami", echo: true },
      { cmd: "availability", echo: true },
    ];

    if (reduced.current) {
      const instant: Line[] = [];
      boot.forEach(({ cmd }) => {
        instant.push({ id: nextId(), text: `$ ${cmd}`, kind: "cmd" });
        instant.push(...resolveCommand(cmd));
      });
      setLines(instant);
      return;
    }

    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const step = () => {
      if (i >= boot.length) return;
      runCommand(boot[i].cmd);
      i += 1;
      timers.push(setTimeout(step, 480));
    };
    timers.push(setTimeout(step, 250));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep output pinned to the bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const quickCommands = ["help", "whoami", "skills", "projects", "contact"];

  return (
    <div
      className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#05070D]/95 shadow-2xl shadow-black/50"
      aria-label="Interactive identity terminal"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.03] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
          <Terminal className="h-3 w-3 text-emerald-400" />
          identity@signature — zsh
        </div>
        <div className="w-10" />
      </div>

      {/* Output buffer */}
      <div
        ref={scrollRef}
        className="h-36 space-y-1 overflow-y-auto px-4 py-3 font-mono text-[11px] leading-relaxed"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={
              line.kind === "cmd"
                ? "text-cyan-300"
                : line.kind === "ok"
                ? "text-emerald-300"
                : line.kind === "err"
                ? "text-rose-300"
                : "text-slate-400"
            }
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Quick command chips */}
      <div className="flex flex-wrap gap-1.5 border-t border-white/[0.06] px-4 pt-2">
        {quickCommands.map((qc) => (
          <button
            key={qc}
            type="button"
            onClick={() => runCommand(qc)}
            className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-slate-400 transition hover:border-emerald-400/40 hover:text-emerald-300"
          >
            {qc}
          </button>
        ))}
      </div>

      {/* Prompt input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          runCommand(input);
          setInput("");
        }}
        className="flex items-center gap-2 border-t border-white/[0.06] px-4 py-2"
      >
        <ChevronRight className="h-3.5 w-3.5 text-emerald-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="type 'help' and press Enter…"
          aria-label="Terminal command input"
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent font-mono text-[11px] text-emerald-200 placeholder-slate-600 focus:outline-none"
        />
      </form>
    </div>
  );
}
