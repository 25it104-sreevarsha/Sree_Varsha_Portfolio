"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FullPortfolioData } from "@/lib/portfolio-service";
import type { ProjectRecord, CertificationRecord } from "@/db/schema";
import {
  Search,
  Terminal,
  FolderGit2,
  Award,
  GraduationCap,
  Cpu,
  Briefcase,
  BookOpen,
  Trophy,
  Compass,
  Mail,
  Settings,
  Download,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ArrowRight,
  X,
  Milestone,
} from "lucide-react";

interface CommandPaletteModalProps {
  open: boolean;
  onClose: () => void;
  portfolio: FullPortfolioData;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAdmin: (tab?: string) => void;
  onSelectProject: (p: ProjectRecord) => void;
  onSelectCertificate: (c: CertificationRecord) => void;
}

export function CommandPaletteModal({
  open,
  onClose,
  portfolio,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenAdmin,
  onSelectProject,
  onSelectCertificate,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  const items = useMemo(() => {
    const scrollTo = (id: string) => {
      onClose();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    };

    const baseActions = [
      {
        id: "admin-studio",
        group: "Self-Maintenance Studio",
        label: "Open Portfolio Admin Studio (Add/Edit Projects, CGPA, Photo)",
        icon: Settings,
        shortcut: "STUDIO",
        action: () => {
          onClose();
          onOpenAdmin("profile");
        },
      },
      {
        id: "admin-cgpa",
        group: "Self-Maintenance Studio",
        label: "Update Semester CGPA & Academic Marks",
        icon: GraduationCap,
        shortcut: "CGPA",
        action: () => {
          onClose();
          onOpenAdmin("education");
        },
      },
      {
        id: "admin-add-project",
        group: "Self-Maintenance Studio",
        label: "Add a New Engineering Project",
        icon: FolderGit2,
        shortcut: "NEW",
        action: () => {
          onClose();
          onOpenAdmin("projects");
        },
      },
      {
        id: "sec-hero",
        group: "Navigate Sections",
        label: "01 // Personal Introduction & Passport Identity",
        icon: Terminal,
        shortcut: "#identity",
        action: () => scrollTo("identity"),
      },
      {
        id: "sec-projects",
        group: "Navigate Sections",
        label: "02 // Featured Projects & Case Studies",
        icon: FolderGit2,
        shortcut: "#projects",
        action: () => scrollTo("projects"),
      },
      {
        id: "sec-skills",
        group: "Navigate Sections",
        label: "03 // Technical Skills & Architecture Matrix",
        icon: Cpu,
        shortcut: "#skills",
        action: () => scrollTo("skills"),
      },
      {
        id: "sec-education",
        group: "Navigate Sections",
        label: "04 // Education & Semester CGPA Telemetry",
        icon: GraduationCap,
        shortcut: "#education",
        action: () => scrollTo("education"),
      },
      {
        id: "sec-experience",
        group: "Navigate Sections",
        label: "05 // Experience & Internships Timeline",
        icon: Briefcase,
        shortcut: "#experience",
        action: () => scrollTo("experience"),
      },
      {
        id: "sec-journey",
        group: "Navigate Sections",
        label: "Career Journey — Interactive Milestone Timeline",
        icon: Milestone,
        shortcut: "#journey",
        action: () => scrollTo("journey"),
      },
      {
        id: "sec-certifications",
        group: "Navigate Sections",
        label: "06 // Verifiable Certifications Gallery",
        icon: Award,
        shortcut: "#certifications",
        action: () => scrollTo("certifications"),
      },
      {
        id: "sec-research",
        group: "Navigate Sections",
        label: "07 // Research & Publications",
        icon: BookOpen,
        shortcut: "#research",
        action: () => scrollTo("research"),
      },
      {
        id: "sec-achievements",
        group: "Navigate Sections",
        label: "08 // Achievements, Hackathons & Recognition",
        icon: Trophy,
        shortcut: "#achievements",
        action: () => scrollTo("achievements"),
      },
      {
        id: "sec-focus",
        group: "Navigate Sections",
        label: "09 // Currently Learning & Building + Beyond Academics",
        icon: Compass,
        shortcut: "#focus",
        action: () => scrollTo("focus"),
      },
      {
        id: "sec-contact",
        group: "Navigate Sections",
        label: "10 // Contact & Collaboration Dispatch",
        icon: Mail,
        shortcut: "#contact",
        action: () => scrollTo("contact"),
      },
      {
        id: "sys-theme",
        group: "System Preferences",
        label: `Switch to ${theme === "dark" ? "Alabaster Daylight" : "Obsidian Sovereign"} Theme`,
        icon: theme === "dark" ? Sun : Moon,
        shortcut: "THEME",
        action: () => {
          onToggleTheme();
          onClose();
        },
      },
      {
        id: "sys-sound",
        group: "System Preferences",
        label: `${soundEnabled ? "Disable" : "Enable"} Subtle Harmonic UI Audio`,
        icon: soundEnabled ? VolumeX : Volume2,
        shortcut: "AUDIO",
        action: () => {
          onToggleSound();
          onClose();
        },
      },
      {
        id: "sys-resume",
        group: "System Preferences",
        label: "Download Dynamic PDF Resume",
        icon: Download,
        shortcut: "PDF",
        action: () => {
          window.open(portfolio.profile.resumeUrl || "/api/resume", "_blank");
          onClose();
        },
      },
    ];

    const projectActions = portfolio.projects.map((p) => ({
      id: `proj-${p.id}`,
      group: "Projects Showcase",
      label: `${p.name} [${p.status}]`,
      icon: FolderGit2,
      shortcut: p.category,
      action: () => {
        onClose();
        onSelectProject(p);
      },
    }));

    const certActions = portfolio.certifications.map((c) => ({
      id: `cert-${c.id}`,
      group: "Certifications",
      label: `${c.title} — ${c.issuingOrganization}`,
      icon: Award,
      shortcut: c.completionDate,
      action: () => {
        onClose();
        onSelectCertificate(c);
      },
    }));

    const all = [...baseActions, ...projectActions, ...certActions];
    if (!query.trim()) return all;

    const q = query.toLowerCase();
    return all.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.shortcut.toLowerCase().includes(q)
    );
  }, [
    portfolio,
    query,
    theme,
    soundEnabled,
    onClose,
    onOpenAdmin,
    onToggleTheme,
    onToggleSound,
    onSelectProject,
    onSelectCertificate,
  ]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 px-4 pt-20 backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="modal-panel w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#0D101B] text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="h-5 w-5 text-violet-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, section, project, skill, or 'CGPA'..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 bg-white/5 p-1 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              No matching commands or records found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition hover:bg-violet-500/15"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-violet-300 group-hover:border-violet-400/40 group-hover:text-cyan-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-100 group-hover:text-white">
                        {item.label}
                      </div>
                      <div className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                        {item.group}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                      {item.shortcut}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-black/40 px-4 py-2.5 font-mono text-[11px] text-slate-400">
          <span>Portfolio // COMMAND INTERFACE</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
