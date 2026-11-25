"use client";

import React, { useState } from "react";
import type { CertificationRecord } from "@/db/schema";
import {
  X,
  ExternalLink,
  Award,
  Calendar,
  Building2,
  ZoomIn,
  ZoomOut,
  Edit3,
  ShieldCheck,
} from "lucide-react";

interface CertificateLightboxModalProps {
  certificate: CertificationRecord | null;
  onClose: () => void;
  onEditInStudio: (cert: CertificationRecord) => void;
}

export function CertificateLightboxModal({
  certificate,
  onClose,
  onEditInStudio,
}: CertificateLightboxModalProps) {
  const [zoomed, setZoomed] = useState(false);

  if (!certificate) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-lightbox-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl sm:p-6"
      onClick={onClose}
    >
      <div
        className="modal-panel relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0C0E17] text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0C0E17]/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1 font-mono text-xs text-cyan-300">
              <Award className="h-3.5 w-3.5" />
              {certificate.category}
            </span>
            {certificate.isPlaceholder && (
              <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] text-amber-300">
                EDITABLE CREDENTIAL
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
            >
              {zoomed ? (
                <>
                  <ZoomOut className="h-3.5 w-3.5" />
                  Fit View
                </>
              ) : (
                <>
                  <ZoomIn className="h-3.5 w-3.5" />
                  Zoom 1.25x
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditInStudio(certificate);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-200 transition hover:bg-violet-500/25"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close certificate preview"
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="overflow-auto rounded-xl border border-white/10 bg-black/60 p-4">
            <img
              src={certificate.certificateImageUrl}
              alt={certificate.title}
              className={`mx-auto rounded-lg object-contain transition-transform duration-300 ${
                zoomed ? "scale-125 my-10" : "max-h-[420px] w-full"
              }`}
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-violet-400" />
                Issued by: {certificate.issuingOrganization}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                Completed: {certificate.completionDate}
              </span>
            </div>

            <h2
              id="cert-lightbox-title"
              className="text-2xl font-bold text-white"
            >
              {certificate.title}
            </h2>

            {certificate.description && (
              <p className="text-sm leading-relaxed text-slate-300">
                {certificate.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            {certificate.verificationUrl ? (
              <a
                href={certificate.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:opacity-95"
              >
                <ShieldCheck className="h-4 w-4" />
                Verify Credential Authenticity
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="font-mono text-xs text-slate-400">
                Add a verification URL in the Admin Studio
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
