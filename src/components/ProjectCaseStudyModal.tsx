"use client";

import React, { useState } from "react";
import type { ProjectRecord } from "@/db/schema";
import {
  X,
  ExternalLink,
  GitBranch,
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Edit3,
} from "lucide-react";

interface ProjectCaseStudyModalProps {
  project: ProjectRecord | null;
  onClose: () => void;
  onEditInStudio: (project: ProjectRecord) => void;
}

export function ProjectCaseStudyModal({
  project,
  onClose,
  onEditInStudio,
}: ProjectCaseStudyModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!project) return null;

  const gallery = Array.from(
    new Set([project.thumbnailUrl, ...(project.screenshots || [])].filter(Boolean))
  );
  const currentImg = gallery[activeImageIdx] || project.thumbnailUrl;

  const statusStyles =
    project.status === "Completed"
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
      : project.status === "Prototype"
      ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
      : "border-amber-500/40 bg-amber-500/15 text-amber-300";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl sm:p-6"
      onClick={onClose}
    >
      <div
        className="modal-panel relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0C0E17] text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0C0E17]/95 px-6 py-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-medium ${statusStyles}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {project.status}
            </span>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-xs text-violet-300">
              {project.category}
            </span>
            {project.isPlaceholder && (
              <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] text-amber-300">
                EDITABLE TEMPLATE RECORD
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditInStudio(project);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-200 transition hover:bg-violet-500/25"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Project
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close case study"
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          {/* Interactive Gallery */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/50">
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={currentImg}
                alt={project.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0E17] via-transparent to-transparent opacity-65" />
            </div>

            {gallery.length > 1 && (
              <div className="flex items-center justify-between border-t border-white/10 bg-[#080A11] px-4 py-2.5">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`h-12 w-20 overflow-hidden rounded-md border transition ${
                        idx === activeImageIdx
                          ? "border-cyan-400 ring-2 ring-cyan-400/30"
                          : "border-white/15 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${project.name} screenshot ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx((prev) =>
                        prev === 0 ? gallery.length - 1 : prev - 1
                      )
                    }
                    className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx((prev) =>
                        prev === gallery.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Title & Summary */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                Development Date: {project.developmentDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-violet-400" />
                {project.techStack.length} Technologies Integrated
              </span>
            </div>
            <h2
              id="case-study-title"
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              {project.name}
            </h2>
            <p className="text-base leading-relaxed text-slate-300">
              {project.shortDescription}
            </p>
          </div>

          {/* Problem Statement & Proposed Solution */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-5">
              <div className="mb-2.5 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-rose-300 uppercase">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                01 // Problem Statement
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {project.problemStatement}
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-5">
              <div className="mb-2.5 flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-cyan-300 uppercase">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                02 // Proposed Architectural Solution
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                {project.proposedSolution}
              </p>
            </div>
          </div>

          {/* Key Features */}
          {project.keyFeatures && project.keyFeatures.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="mb-3.5 font-mono text-xs font-semibold tracking-wider text-violet-300 uppercase">
                03 // Key Engineering Features
              </h3>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {project.keyFeatures.map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-slate-300"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technology Stack */}
          <div>
            <h3 className="mb-3 font-mono text-xs font-semibold tracking-wider text-slate-400 uppercase">
              04 // Technology Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 font-mono text-xs text-violet-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action Links Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="flex flex-wrap items-center gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-violet-400/50 hover:bg-white/10"
                >
                  <GitBranch className="h-4 w-4" />
                  GitHub Repository
                </a>
              )}
              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:opacity-95"
                >
                  <ExternalLink className="h-4 w-4" />
                  Launch Live Demo
                </a>
              )}
              {project.docsUrl && (
                <a
                  href={project.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                >
                  <FileText className="h-4 w-4" />
                  Documentation
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Close Case Study
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
