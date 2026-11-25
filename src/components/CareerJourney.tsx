"use client";

import React, { useMemo, useState } from "react";
import type { FullPortfolioData } from "@/lib/portfolio-service";
import {
  GraduationCap,
  Briefcase,
  Trophy,
  BookOpen,
  ChevronDown,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

type JourneyType = "Education" | "Experience" | "Achievement" | "Research";
type Filter = "All" | JourneyType;

interface JourneyItem {
  id: string;
  type: JourneyType;
  year: number | null;
  yearLabel: string;
  title: string;
  subtitle: string;
  details: React.ReactNode;
  proofUrl?: string;
}

interface CareerJourneyProps {
  portfolio: FullPortfolioData;
  isLight: boolean;
}

const TYPE_META: Record<
  JourneyType,
  { icon: LucideIcon; chip: string; dot: string }
> = {
  Education: {
    icon: GraduationCap,
    chip: "border-violet-500/35 bg-violet-500/10 text-violet-300",
    dot: "border-violet-400 bg-violet-500/30 shadow-[0_0_14px_rgba(124,58,237,0.55)]",
  },
  Experience: {
    icon: Briefcase,
    chip: "border-cyan-500/35 bg-cyan-500/10 text-cyan-300",
    dot: "border-cyan-400 bg-cyan-500/30 shadow-[0_0_14px_rgba(6,182,212,0.55)]",
  },
  Achievement: {
    icon: Trophy,
    chip: "border-amber-500/35 bg-amber-500/10 text-amber-300",
    dot: "border-amber-400 bg-amber-500/30 shadow-[0_0_14px_rgba(245,158,11,0.5)]",
  },
  Research: {
    icon: BookOpen,
    chip: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
    dot: "border-emerald-400 bg-emerald-500/30 shadow-[0_0_14px_rgba(16,185,129,0.5)]",
  },
};

function parseFirstYear(text: string): number | null {
  const match = text.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

/**
 * Interactive career-journey timeline. Milestones are derived automatically
 * from the Education, Experience, Achievement and Publication records — adding
 * a record in the Admin Studio automatically extends this timeline.
 */
export function CareerJourney({ portfolio, isLight }: CareerJourneyProps) {
  const [filter, setFilter] = useState<Filter>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo<JourneyItem[]>(() => {
    const out: JourneyItem[] = [];

    portfolio.education.forEach((edu) => {
      const year = parseFirstYear(edu.duration);
      out.push({
        id: `edu-${edu.id}`,
        type: "Education",
        year,
        yearLabel: year ? String(year) : "STUDY",
        title: `${edu.degree} — ${edu.department}`,
        subtitle: edu.institutionName,
        proofUrl: undefined,
        details: (
          <div className="space-y-2 text-xs leading-relaxed text-slate-400">
            <p>
              Duration: {edu.duration} · {edu.currentSemester} · CGPA{" "}
              <span className="font-mono text-cyan-300">{edu.cgpa}</span>
            </p>
            {edu.class12Marks && (
              <p>
                Class XII: {edu.class12Marks}
                {edu.class10Marks ? ` · Class X: ${edu.class10Marks}` : ""}
              </p>
            )}
            {edu.highlights.length > 0 && (
              <ul className="list-disc space-y-1 pl-4">
                {edu.highlights.slice(0, 3).map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        ),
      });
    });

    portfolio.experiences.forEach((exp) => {
      const year =
        parseFirstYear(exp.startDate) ?? parseFirstYear(exp.endDate);
      out.push({
        id: `exp-${exp.id}`,
        type: "Experience",
        year,
        yearLabel: year ? String(year) : "TENURE",
        title: `${exp.role}`,
        subtitle: `${exp.organizationName} · ${exp.startDate} – ${exp.endDate}`,
        proofUrl: exp.verificationUrl || undefined,
        details: (
          <div className="space-y-2 text-xs leading-relaxed text-slate-400">
            <p>{exp.description}</p>
            {exp.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {exp.technologies.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ),
      });
    });

    portfolio.achievements.forEach((ach) => {
      const year = parseFirstYear(ach.date);
      out.push({
        id: `ach-${ach.id}`,
        type: "Achievement",
        year,
        yearLabel: year ? String(year) : ach.date.toUpperCase(),
        title: ach.title,
        subtitle: `${ach.organization} · ${ach.category}`,
        proofUrl: ach.proofUrl || undefined,
        details: (
          <p className="text-xs leading-relaxed text-slate-400">
            {ach.description}
          </p>
        ),
      });
    });

    portfolio.publications.forEach((pub) => {
      const year = parseFirstYear(pub.publicationDate);
      out.push({
        id: `pub-${pub.id}`,
        type: "Research",
        year,
        yearLabel: year ? String(year) : "RESEARCH",
        title: pub.title,
        subtitle: `${pub.venue} · Status: ${pub.status}`,
        proofUrl: pub.paperUrl || undefined,
        details: (
          <p className="text-xs leading-relaxed text-slate-400">{pub.abstract}</p>
        ),
      });
    });

    return out.sort((a, b) => {
      if (a.year === null && b.year === null) return 0;
      if (a.year === null) return 1;
      if (b.year === null) return -1;
      return b.year - a.year;
    });
  }, [portfolio]);

  const visible =
    filter === "All" ? items : items.filter((item) => item.type === filter);

  const counts = useMemo(() => {
    const map: Record<Filter, number> = {
      All: items.length,
      Education: 0,
      Experience: 0,
      Achievement: 0,
      Research: 0,
    };
    items.forEach((item) => {
      map[item.type] += 1;
    });
    return map;
  }, [items]);

  const filters: Filter[] = [
    "All",
    "Education",
    "Experience",
    "Achievement",
    "Research",
  ];

  return (
    <div className="space-y-6">
      {/* Filter rail */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-xl px-3.5 py-2 font-mono text-[11px] font-semibold tracking-wide transition ${
              filter === f
                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-600/20"
                : isLight
                ? "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {f} <span className="opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Timeline spine */}
      <div className="relative pl-6 sm:pl-10">
        <div
          aria-hidden="true"
          className="spine-breathe absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-violet-500/70 via-cyan-400/50 to-transparent sm:left-[11px]"
        />
        <ol className="space-y-4">
          {visible.map((item) => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            const open = openId === item.id;
            return (
              <li key={item.id} className="relative">
                {/* Milestone node */}
                <span
                  aria-hidden="true"
                  className={`absolute top-5 -left-6 h-3.5 w-3.5 rounded-full border-2 sm:-left-10 ${meta.dot}`}
                />
                <div
                  className={`overflow-hidden rounded-2xl border transition ${
                    isLight
                      ? "border-slate-200 bg-white"
                      : "border-white/10 bg-[#0D101B]/90 hover:border-violet-500/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : item.id)}
                    aria-expanded={open}
                    className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left"
                  >
                    <span className="w-14 shrink-0 font-mono text-lg font-extrabold tracking-tight text-cyan-400">
                      {item.yearLabel}
                    </span>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider uppercase ${meta.chip}`}
                    >
                      <Icon className="h-3 w-3" />
                      {item.type}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold sm:text-base">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500 sm:text-[11px]">
                        {item.subtitle}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${
                        open ? "rotate-180 text-cyan-300" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="border-t border-white/[0.07] px-5 py-4 pl-[4.75rem] sm:pl-[6.5rem]">
                      {item.details}
                      {item.proofUrl && (
                        <a
                          href={item.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-cyan-300 hover:underline"
                        >
                          Open verification / reference link
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            No {filter.toLowerCase()} milestones recorded yet. Add one in the
            Admin Studio and it will appear here automatically.
          </p>
        )}
      </div>
    </div>
  );
}
