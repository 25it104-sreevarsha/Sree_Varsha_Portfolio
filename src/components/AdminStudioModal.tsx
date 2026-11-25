"use client";

import React, { useEffect, useState } from "react";
import type { FullPortfolioData } from "@/lib/portfolio-service";
import type { ContactMessage } from "@/db/schema";
import {
  X,
  Lock,
  Unlock,
  User,
  GraduationCap,
  FolderGit2,
  Cpu,
  Briefcase,
  Award,
  Trophy,
  BookOpen,
  Compass,
  Mail,
  FileJson,
  Plus,
  Trash2,
  Edit3,
  Check,
  Upload,
  RotateCcw,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface AdminStudioModalProps {
  open: boolean;
  initialTab?: string;
  onClose: () => void;
  portfolio: FullPortfolioData;
  onPortfolioUpdated: (data: FullPortfolioData) => void;
}

export function AdminStudioModal({
  open,
  initialTab = "profile",
  onClose,
  portfolio,
  onPortfolioUpdated,
}: AdminStudioModalProps) {
  const [passkey, setPasskey] = useState("signature-2026");
  const [unlocked, setUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState(portfolio.profile);

  // Selected item for editing in lists
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Contact messages
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    setActiveTab(initialTab || "profile");
  }, [initialTab]);

  useEffect(() => {
    setProfileForm(portfolio.profile);
  }, [portfolio.profile]);

  const showNotice = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-passkey", passkey }),
      });
      const json = await res.json();
      if (json.valid) {
        setUnlocked(true);
        showNotice("Studio unlocked. You have full live editing control.");
      } else {
        setAuthError("Invalid studio passkey. Default is 'signature-2026'.");
      }
    } catch {
      setAuthError("Could not verify passkey.");
    }
  };

  const fetchInbox = async () => {
    try {
      const res = await fetch("/api/contact", {
        headers: { "x-admin-passkey": passkey },
      });
      const json = await res.json();
      if (json.messages) setMessages(json.messages);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (unlocked && activeTab === "messages") {
      fetchInbox();
    }
  }, [unlocked, activeTab]);

  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onResult: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 900;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.86);
          onResult(compressed);
          showNotice("Image processed and ready to save.");
        }
      };
      if (typeof reader.result === "string") {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passkey": passkey,
        },
        body: JSON.stringify({
          section: "profile",
          payload: profileForm,
        }),
      });
      const json = await res.json();
      if (json.status === "ok") {
        onPortfolioUpdated(json.data);
        showNotice("Personal profile & passport portrait updated live!");
      }
    } finally {
      setSaving(false);
    }
  };

  const saveRecord = async (section: string) => {
    setSaving(true);
    try {
      const isEdit = editingId !== null;
      const res = await fetch("/api/portfolio", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passkey": passkey,
        },
        body: JSON.stringify({
          section,
          id: editingId,
          payload: { ...formData, isPlaceholder: false },
        }),
      });
      const json = await res.json();
      if (json.status === "ok") {
        onPortfolioUpdated(json.data);
        setEditingId(null);
        setFormData({});
        showNotice(`Saved ${section} record and updated live website!`);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (section: string, id: number) => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/portfolio?section=${encodeURIComponent(section)}&id=${id}`,
        {
          method: "DELETE",
          headers: { "x-admin-passkey": passkey },
        }
      );
      const json = await res.json();
      if (json.status === "ok") {
        onPortfolioUpdated(json.data);
        showNotice("Record removed from portfolio.");
      }
    } finally {
      setSaving(false);
    }
  };

  const quickUpdateSemesterCgpa = async (
    eduId: number,
    semester: string,
    cgpa: string
  ) => {
    const target = portfolio.education.find((e) => e.id === eduId);
    if (!target) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passkey": passkey,
        },
        body: JSON.stringify({
          section: "education",
          id: eduId,
          payload: {
            ...target,
            currentSemester: semester,
            cgpa,
            isPlaceholder: false,
          },
        }),
      });
      const json = await res.json();
      if (json.status === "ok") {
        onPortfolioUpdated(json.data);
        showNotice("Semester CGPA updated immediately across the website!");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(portfolio, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "digital-signature-portfolio.json";
    a.click();
    URL.revokeObjectURL(url);
    showNotice("Exported complete portfolio JSON snapshot.");
  };

  if (!open) return null;

  const tabs = [
    { id: "profile", label: "Identity & Photo", icon: User },
    { id: "education", label: "Education & CGPA", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "skills", label: "Skills", icon: Cpu },
    { id: "experiences", label: "Experience", icon: Briefcase },
    { id: "certifications", label: "Certificates", icon: Award },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "publications", label: "Research", icon: BookOpen },
    { id: "focus", label: "Learning & Clubs", icon: Compass },
    {
      id: "messages",
      label: `Inbox (${portfolio.messagesCount})`,
      icon: Mail,
    },
    { id: "guide", label: "Maintenance Guide", icon: FileJson },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio Admin Studio"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-xl sm:p-6"
    >
      <div className="modal-panel relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0A0C14] text-slate-100 shadow-2xl">
        {/* Top Studio Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0E111D] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-600/20">
              {unlocked ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">
                SREE VARSHA // PERSONAL PORTFOLIO STUDIO
              </h2>
              <p className="font-mono text-[11px] text-slate-400">
                Add, edit, or remove any portfolio entry live without rebuilding the website
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {toast && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 font-mono text-xs text-emerald-300">
                <Check className="h-3.5 w-3.5" />
                {toast}
              </span>
            )}
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-1.5 font-mono text-xs text-cyan-200 transition hover:bg-cyan-500/20"
            >
              <FileJson className="h-3.5 w-3.5" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!unlocked ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <form
              onSubmit={handleUnlock}
              className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-[#101423] p-8 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Unlock Owner Content Studio
                  </h3>
                  <p className="text-xs text-slate-400">
                    Protected CMS for updating projects, CGPA, certificates, and passport photo.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs text-slate-300">
                  STUDIO PASSKEY
                </label>
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter passkey..."
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 font-mono text-sm text-white focus:border-violet-400 focus:outline-none"
                />
                <p className="mt-2 font-mono text-[11px] text-cyan-300">
                  Default owner passkey: <code className="rounded bg-white/10 px-1.5 py-0.5">signature-2026</code> (pre-filled for instant verification)
                </p>
              </div>

              {authError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:opacity-95"
              >
                Unlock Studio & Manage Content
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            {/* Sidebar Navigation */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-white/10 bg-[#0D101B] p-3 lg:w-60 lg: shrink-0 lg:flex-col lg:border-r lg:border-b-0">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(t.id);
                      setEditingId(null);
                      setFormData({});
                    }}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition ${
                      active
                        ? "bg-gradient-to-r from-violet-600/30 to-cyan-500/20 text-white border border-violet-500/40"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-violet-400" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Content Workspace */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              {/* TAB 1: PERSONAL PROFILE & PASSPORT PHOTO */}
              {activeTab === "profile" && (
                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Personal Identity & Passport Photograph
                      </h3>
                      <p className="text-xs text-slate-400">
                        Designed specifically to frame a passport-size portrait without requiring a full-body photo.
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/20"
                    >
                      <Check className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Profile Changes"}
                    </button>
                  </div>

                  {/* Passport Photo Upload & Frame Selector */}
                  <div className="grid gap-6 rounded-2xl border border-violet-500/25 bg-violet-500/[0.04] p-5 md:grid-cols-[180px_1fr]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="aspect-[3.5/4.5] w-36 overflow-hidden rounded-2xl border border-violet-400/40 bg-black/50 shadow-inner">
                        <img
                          src={profileForm.photoUrl}
                          alt="Passport preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="font-mono text-[10px] text-cyan-300">
                        PASSPORT RATIO 3.5 : 4.5
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block font-mono text-xs text-slate-200">
                          UPLOAD ACTUAL PASSPORT PHOTOGRAPH (OR PASTE URL)
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/25">
                            <Upload className="h-4 w-4" />
                            Choose Passport Photo File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageFileUpload(e, (dataUrl) =>
                                  setProfileForm((prev) => ({
                                    ...prev,
                                    photoUrl: dataUrl,
                                  }))
                                )
                              }
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setProfileForm((prev) => ({
                                ...prev,
                                photoUrl: "/images/passport-placeholder.svg",
                              }))
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset to Placeholder Frame
                          </button>
                        </div>
                        <input
                          type="text"
                          value={profileForm.photoUrl}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              photoUrl: e.target.value,
                            })
                          }
                          placeholder="/images/passport-placeholder.svg or https://..."
                          className="mt-2.5 w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 font-mono text-xs text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block font-mono text-xs text-slate-200">
                          PORTRAIT FRAME ARCHITECTURAL STYLE
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {[
                            {
                              id: "rounded-editorial",
                              label: "Editorial Rounded Frame",
                            },
                            {
                              id: "circular-precision",
                              label: "Circular Optical Lens",
                            },
                            {
                              id: "biometric-hex",
                              label: "Futuristic Chamfered Frame",
                            },
                          ].map((style) => (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() =>
                                setProfileForm({
                                  ...profileForm,
                                  photoFrameStyle: style.id,
                                })
                              }
                              className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition ${
                                profileForm.photoFrameStyle === style.id
                                  ? "border-cyan-400 bg-cyan-500/20 text-white"
                                  : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                              }`}
                            >
                              {style.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Text Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-mono text-xs text-slate-300">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            fullName: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-xs text-slate-300">
                        CURRENT ACADEMIC STATUS
                      </label>
                      <input
                        type="text"
                        value={profileForm.academicStatus}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            academicStatus: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block font-mono text-xs text-slate-300">
                        PROFESSIONAL HEADLINE
                      </label>
                      <input
                        type="text"
                        value={profileForm.headline}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            headline: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block font-mono text-xs text-slate-300">
                        SHORT PERSONAL INTRODUCTION
                      </label>
                      <textarea
                        rows={3}
                        value={profileForm.shortIntro}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            shortIntro: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-xs text-slate-300">
                        DIRECT EMAIL (FOR MAILTO & CONTACT)
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-xs text-slate-300">
                        LOCATION (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            location: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-xs text-slate-300">
                        GITHUB PROFILE URL
                      </label>
                      <input
                        type="url"
                        value={profileForm.githubUrl}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            githubUrl: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-xs text-cyan-300">
                        GITHUB USERNAME (FOR LIVE REPO TELEMETRY)
                      </label>
                      <input
                        type="text"
                        value={profileForm.githubUsername}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            githubUsername: e.target.value,
                          })
                        }
                        placeholder="e.g. torvalds or your-github-handle"
                        className="w-full rounded-xl border border-cyan-500/30 bg-black/40 px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-xs text-slate-300">
                        LINKEDIN PROFILE URL
                      </label>
                      <input
                        type="url"
                        value={profileForm.linkedinUrl}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            linkedinUrl: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-xs text-slate-300">
                        RESUME DOWNLOAD URL (DEFAULT: /api/resume)
                      </label>
                      <input
                        type="text"
                        value={profileForm.resumeUrl}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            resumeUrl: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block font-mono text-xs text-slate-300">
                        AVAILABILITY BANNER MESSAGE
                      </label>
                      <input
                        type="text"
                        value={profileForm.availabilityText}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            availabilityText: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* TAB 2: EDUCATION & INSTANT SEMESTER CGPA UPDATER */}
              {activeTab === "education" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Education & Semester CGPA Manager
                    </h3>
                    <p className="text-xs text-slate-400">
                      Update your CGPA every semester in 1 click without rebuilding the education section.
                    </p>
                  </div>

                  {/* Instant Semester CGPA Quick-Update Card */}
                  {portfolio.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.04] p-5"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-mono text-[11px] text-cyan-300 uppercase">
                            INSTANT SEMESTER TELEMETRY UPDATE
                          </span>
                          <h4 className="text-base font-bold text-white">
                            {edu.degree} — {edu.institutionName}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(edu.id);
                              setFormData({
                                ...edu,
                                highlightsText: (edu.highlights || []).join("\n"),
                              });
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Full Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecord("education", edu.id)}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          quickUpdateSemesterCgpa(
                            edu.id,
                            String(fd.get("currentSemester") || edu.currentSemester),
                            String(fd.get("cgpa") || edu.cgpa)
                          );
                        }}
                        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                      >
                        <div>
                          <label className="mb-1 block font-mono text-[11px] text-slate-300">
                            CURRENT SEMESTER / YEAR
                          </label>
                          <input
                            name="currentSemester"
                            defaultValue={edu.currentSemester}
                            className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block font-mono text-[11px] text-cyan-300">
                            CURRENT CGPA / SCORE
                          </label>
                          <input
                            name="cgpa"
                            defaultValue={edu.cgpa}
                            className="w-full rounded-xl border border-cyan-500/40 bg-black/50 px-3 py-2 font-mono text-xs font-bold text-cyan-200"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={saving}
                            className="w-full rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                          >
                            Update CGPA Now
                          </button>
                        </div>
                      </form>
                    </div>
                  ))}

                  {/* Full Education Add / Edit Form */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <h4 className="mb-4 font-mono text-xs font-semibold text-violet-300 uppercase">
                      {editingId
                        ? "Edit Academic Record"
                        : "Add New Academic Record"}
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        placeholder="Institution / University Name"
                        value={String(formData.institutionName || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            institutionName: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Degree (e.g. B.Tech)"
                        value={String(formData.degree || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, degree: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Department (e.g. Information Technology)"
                        value={String(formData.department || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Academic Duration (e.g. 2023 - 2027)"
                        value={String(formData.duration || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Current Semester (e.g. Semester 6)"
                        value={String(formData.currentSemester || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currentSemester: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="CGPA (e.g. 8.92 / 10.0)"
                        value={String(formData.cgpa || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, cgpa: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Class 10 Marks / Percentage"
                        value={String(formData.class10Marks || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            class10Marks: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Class 12 Marks / Percentage"
                        value={String(formData.class12Marks || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            class12Marks: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <textarea
                        rows={3}
                        placeholder="Academic Highlights (one per line)"
                        value={String(formData.highlightsText || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            highlightsText: e.target.value,
                            highlights: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveRecord("education")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500"
                      >
                        <Plus className="h-4 w-4" />
                        {editingId ? "Update Education Record" : "Add Education Record"}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setFormData({});
                          }}
                          className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-400"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PROJECTS SHOWCASE MANAGER */}
              {activeTab === "projects" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Projects & Case Studies Manager
                    </h3>
                    <p className="text-xs text-slate-400">
                      Add unlimited projects. Every new entry automatically inherits the 3D tilt card and interactive case-study modal.
                    </p>
                  </div>

                  {/* Project Form */}
                  <div className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-5">
                    <h4 className="mb-4 font-mono text-xs font-semibold text-violet-300 uppercase">
                      {editingId ? "Edit Project Record" : "Add New Project"}
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        placeholder="Project Name"
                        value={String(formData.name || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Category (e.g. Full-Stack Systems, AI & ML, IoT)"
                        value={String(formData.category || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <select
                        value={String(formData.status || "Completed")}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-[#0D101B] px-3.5 py-2 text-sm text-white"
                      >
                        <option value="Completed">Status: Completed Product</option>
                        <option value="Prototype">Status: Functional Prototype</option>
                        <option value="In Progress">Status: In Progress Build</option>
                      </select>
                      <input
                        placeholder="Development Date (e.g. Spring 2026)"
                        value={String(formData.developmentDate || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            developmentDate: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                        <input
                          placeholder="Thumbnail Image URL (/images/project-neural.jpg)"
                          value={String(formData.thumbnailUrl || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              thumbnailUrl: e.target.value,
                            })
                          }
                          className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                        />
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3.5 py-2 text-xs font-medium text-cyan-200">
                          <Upload className="h-3.5 w-3.5" />
                          Upload Screenshot
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageFileUpload(e, (url) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  thumbnailUrl: url,
                                }))
                              )
                            }
                          />
                        </label>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Short Description (displayed on project card)"
                        value={String(formData.shortDescription || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shortDescription: e.target.value,
                          })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <textarea
                        rows={3}
                        placeholder="Problem Statement (for Case Study view)"
                        value={String(formData.problemStatement || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            problemStatement: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <textarea
                        rows={3}
                        placeholder="Proposed Architectural Solution (for Case Study view)"
                        value={String(formData.proposedSolution || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            proposedSolution: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Technology Stack (comma separated: Next.js, TypeScript, PostgreSQL)"
                        value={String(formData.techStackText || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            techStackText: e.target.value,
                            techStack: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <textarea
                        rows={3}
                        placeholder="Key Features (one feature per line)"
                        value={String(formData.keyFeaturesText || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            keyFeaturesText: e.target.value,
                            keyFeatures: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="GitHub Repository URL (https://github.com/...)"
                        value={String(formData.githubUrl || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            githubUrl: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Live Demo URL (optional)"
                        value={String(formData.liveDemoUrl || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            liveDemoUrl: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Documentation URL (optional)"
                        value={String(formData.docsUrl || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            docsUrl: e.target.value,
                          })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveRecord("projects")}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-white"
                      >
                        <Plus className="h-4 w-4" />
                        {editingId ? "Save Project Changes" : "Publish New Project"}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setFormData({});
                          }}
                          className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-400"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Existing Projects List */}
                  <div className="space-y-3">
                    {portfolio.projects.map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={p.thumbnailUrl}
                            alt={p.name}
                            className="h-12 w-20 rounded-lg object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-semibold text-white">
                                {p.name}
                              </h5>
                              <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                                {p.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {p.category} • {p.techStack.join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(p.id);
                              setFormData({
                                ...p,
                                techStackText: (p.techStack || []).join(", "),
                                keyFeaturesText: (p.keyFeatures || []).join("\n"),
                              });
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecord("projects", p.id)}
                            className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TECHNICAL SKILLS */}
              {activeTab === "skills" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Technical Skills & Categories
                    </h3>
                    <p className="text-xs text-slate-400">
                      Add new technologies or custom categories without percentage bars.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        placeholder="Technology Name (e.g. Rust, Docker, PyTorch)"
                        value={String(formData.name || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Category (e.g. Programming Languages, AI and Machine Learning)"
                        value={String(formData.category || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Context Tag (e.g. Core Stack, Production, Active Exploration)"
                        value={String(formData.contextTag || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contextTag: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Practical Usage Description"
                        value={String(formData.description || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveRecord("skills")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white"
                      >
                        <Plus className="h-4 w-4" />
                        {editingId ? "Update Skill" : "Add Skill"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {portfolio.skills.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3.5"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {s.name}
                          </div>
                          <div className="font-mono text-[11px] text-cyan-300">
                            {s.category} • {s.contextTag}
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(s.id);
                              setFormData(s);
                            }}
                            className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:bg-white/10"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecord("skills", s.id)}
                            className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300 hover:bg-rose-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: EXPERIENCE & INTERNSHIPS */}
              {activeTab === "experiences" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Experience & Internships Manager
                    </h3>
                    <p className="text-xs text-slate-400">
                      Add unlimited internships, industrial training, or software roles.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        placeholder="Organization Name"
                        value={String(formData.organizationName || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            organizationName: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Role & Title (e.g. Software Engineering Intern)"
                        value={String(formData.role || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Domain (e.g. Backend Engineering / Cloud)"
                        value={String(formData.domain || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, domain: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Start Date"
                          value={String(formData.startDate || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                        />
                        <input
                          placeholder="End Date"
                          value={String(formData.endDate || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                          className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Overview Description"
                        value={String(formData.description || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <textarea
                        rows={2}
                        placeholder="Responsibilities (one per line)"
                        value={String(formData.responsibilitiesText || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            responsibilitiesText: e.target.value,
                            responsibilities: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <textarea
                        rows={2}
                        placeholder="Key Outcomes (one per line)"
                        value={String(formData.outcomesText || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            outcomesText: e.target.value,
                            outcomes: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Technologies Used (comma separated)"
                        value={String(formData.technologiesText || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            technologiesText: e.target.value,
                            technologies: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Certificate / Verification URL"
                        value={String(formData.verificationUrl || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            verificationUrl: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => saveRecord("experiences")}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      {editingId ? "Update Experience" : "Add Experience"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {portfolio.experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {exp.role} @ {exp.organizationName}
                          </div>
                          <div className="font-mono text-xs text-slate-400">
                            {exp.startDate} – {exp.endDate} • {exp.domain}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(exp.id);
                              setFormData({
                                ...exp,
                                responsibilitiesText: (
                                  exp.responsibilities || []
                                ).join("\n"),
                                outcomesText: (exp.outcomes || []).join("\n"),
                                technologiesText: (exp.technologies || []).join(
                                  ", "
                                ),
                              });
                            }}
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecord("experiences", exp.id)}
                            className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: CERTIFICATIONS */}
              {activeTab === "certifications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Certifications & Verifiable Credentials
                    </h3>
                    <p className="text-xs text-slate-400">
                      Upload certificate previews and attach verification URLs.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        placeholder="Certificate Title"
                        value={String(formData.title || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Issuing Organization (e.g. AWS, Coursera, NPTEL)"
                        value={String(formData.issuingOrganization || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            issuingOrganization: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Completion Date (e.g. Oct 2025)"
                        value={String(formData.completionDate || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            completionDate: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Category (e.g. Cloud & Software Engineering)"
                        value={String(formData.category || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                        <input
                          placeholder="Certificate Image URL"
                          value={String(formData.certificateImageUrl || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              certificateImageUrl: e.target.value,
                            })
                          }
                          className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                        />
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3.5 py-2 text-xs font-medium text-cyan-200">
                          <Upload className="h-3.5 w-3.5" />
                          Upload Certificate Image
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageFileUpload(e, (url) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  certificateImageUrl: url,
                                }))
                              )
                            }
                          />
                        </label>
                      </div>
                      <input
                        placeholder="Official Credential Verification URL"
                        value={String(formData.verificationUrl || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            verificationUrl: e.target.value,
                          })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <textarea
                        rows={2}
                        placeholder="Description / Key Competencies Covered"
                        value={String(formData.description || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => saveRecord("certifications")}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      {editingId ? "Update Certificate" : "Add Certificate"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {portfolio.certifications.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {c.title}
                          </div>
                          <div className="font-mono text-xs text-slate-400">
                            {c.issuingOrganization} • {c.completionDate}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(c.id);
                              setFormData(c);
                            }}
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecord("certifications", c.id)}
                            className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: ACHIEVEMENTS & RECOGNITION */}
              {activeTab === "achievements" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Achievements, Hackathons & Recognition
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        placeholder="Achievement Title"
                        value={String(formData.title || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Organization / Event Name"
                        value={String(formData.organization || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            organization: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Category (Hackathon, Award, Competition, Academic)"
                        value={String(formData.category || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Date / Year"
                        value={String(formData.date || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <textarea
                        rows={2}
                        placeholder="Description"
                        value={String(formData.description || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Proof / Verification Link (optional)"
                        value={String(formData.proofUrl || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, proofUrl: e.target.value })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => saveRecord("achievements")}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      {editingId ? "Update Achievement" : "Add Achievement"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {portfolio.achievements.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {a.title}
                          </div>
                          <div className="font-mono text-xs text-slate-400">
                            {a.organization} • {a.category} • {a.date}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(a.id);
                              setFormData(a);
                            }}
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecord("achievements", a.id)}
                            className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: RESEARCH & PUBLICATIONS */}
              {activeTab === "publications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Research & Publications
                    </h3>
                    <p className="text-xs text-slate-400">
                      Transparent status badges ensure submitted manuscripts are never falsely labeled as published.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        placeholder="Research Paper Title"
                        value={String(formData.title || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Research Domain"
                        value={String(formData.domain || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, domain: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Conference or Journal Name"
                        value={String(formData.venue || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, venue: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <select
                        value={String(formData.status || "Submitted")}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="rounded-xl border border-white/15 bg-[#0D101B] px-3.5 py-2 text-sm text-white"
                      >
                        <option value="Draft">Status: Working Draft / Preprint</option>
                        <option value="Submitted">Status: Submitted Manuscript</option>
                        <option value="Under Review">Status: Under Peer Review</option>
                        <option value="Accepted">Status: Accepted for Publication</option>
                        <option value="Published">Status: Officially Published</option>
                      </select>
                      <input
                        placeholder="Co-Authors (comma separated)"
                        value={String(formData.coAuthorsText || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coAuthorsText: e.target.value,
                            coAuthors: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Submission / Publication Date"
                        value={String(formData.publicationDate || "")}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            publicationDate: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <textarea
                        rows={3}
                        placeholder="Abstract / Research Summary"
                        value={String(formData.abstract || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, abstract: e.target.value })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Paper / Conference URL"
                        value={String(formData.paperUrl || "")}
                        onChange={(e) =>
                          setFormData({ ...formData, paperUrl: e.target.value })
                        }
                        className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => saveRecord("publications")}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      <Plus className="h-4 w-4" />
                      {editingId ? "Update Publication" : "Add Publication"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {portfolio.publications.map((pub) => (
                      <div
                        key={pub.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {pub.title}
                            </span>
                            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                              {pub.status}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-slate-400">
                            {pub.venue} • {pub.domain}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(pub.id);
                              setFormData({
                                ...pub,
                                coAuthorsText: (pub.coAuthors || []).join(", "),
                              });
                            }}
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecord("publications", pub.id)}
                            className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: CURRENTLY LEARNING & BEYOND ACADEMICS */}
              {activeTab === "focus" && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">
                      Currently Learning / Currently Building
                    </h3>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          placeholder="Title (e.g. Distributed Consensus & Raft)"
                          value={String(formData.title || "")}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                        />
                        <select
                          value={String(formData.focusType || "Currently Learning")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              focusType: e.target.value,
                            })
                          }
                          className="rounded-xl border border-white/15 bg-[#0D101B] px-3.5 py-2 text-sm text-white"
                        >
                          <option value="Currently Learning">Currently Learning</option>
                          <option value="Currently Building">Currently Building</option>
                          <option value="Technology Explored">Technology Explored</option>
                          <option value="Development Goal">Development Goal</option>
                        </select>
                        <input
                          placeholder="Status Tag (e.g. Active Study, In Development)"
                          value={String(formData.statusTag || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              statusTag: e.target.value,
                            })
                          }
                          className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                        />
                        <input
                          placeholder="Tags (comma separated)"
                          value={String(formData.tagsText || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tagsText: e.target.value,
                              tags: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                        />
                        <textarea
                          rows={2}
                          placeholder="Description"
                          value={String(formData.description || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => saveRecord("currentFocus")}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white"
                      >
                        <Plus className="h-4 w-4" />
                        Save Current Focus Item
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {portfolio.currentFocus.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3.5"
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {f.title}
                            </div>
                            <div className="font-mono text-xs text-cyan-300">
                              {f.focusType} • {f.statusTag}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteRecord("currentFocus", f.id)}
                            className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/10 pt-6">
                    <h3 className="text-lg font-bold text-white">
                      Beyond Academics (Leadership, Clubs, Volunteering & Interests)
                    </h3>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          placeholder="Activity / Role Title"
                          value={String(formData.beyondTitle || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              beyondTitle: e.target.value,
                              title: e.target.value,
                            })
                          }
                          className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                        />
                        <input
                          placeholder="Category (Leadership, Technical Club, Volunteering, Interest)"
                          value={String(formData.roleOrCategory || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              roleOrCategory: e.target.value,
                            })
                          }
                          className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                        />
                        <input
                          placeholder="Organization / Community"
                          value={String(formData.organization || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              organization: e.target.value,
                            })
                          }
                          className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                        />
                        <input
                          placeholder="Duration (e.g. 2024 – Present)"
                          value={String(formData.duration || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration: e.target.value,
                            })
                          }
                          className="rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                        />
                        <textarea
                          rows={2}
                          placeholder="Description"
                          value={String(formData.beyondDescription || "")}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              beyondDescription: e.target.value,
                              description: e.target.value,
                            })
                          }
                          className="sm:col-span-2 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => saveRecord("beyondAcademics")}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950"
                      >
                        <Plus className="h-4 w-4" />
                        Add Beyond Academics Entry
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {portfolio.beyondAcademics.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3.5"
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {b.title}
                            </div>
                            <div className="font-mono text-xs text-violet-300">
                              {b.roleOrCategory} • {b.organization} ({b.duration})
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteRecord("beyondAcademics", b.id)}
                            className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: CONTACT INBOX */}
              {activeTab === "messages" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Contact & Collaboration Inbox
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real messages submitted through your portfolio contact form are stored in PostgreSQL and listed here.
                    </p>
                  </div>

                  {messages.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-slate-400">
                      No messages received yet. Test the Contact Form on the main page to see real-time backend persistence!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-white">
                                {m.subject}
                              </h4>
                              <p className="font-mono text-xs text-cyan-300">
                                From: {m.senderName} ({m.senderEmail})
                              </p>
                            </div>
                            <span className="font-mono text-[11px] text-slate-400">
                              {new Date(m.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-slate-300">
                            {m.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 11: MAINTENANCE & DEPLOYMENT GUIDE */}
              {activeTab === "guide" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.05] p-6">
                    <div className="mb-2 flex items-center gap-2 font-mono text-xs text-violet-300 uppercase">
                      <Sparkles className="h-4 w-4" />
                      BUILD ONCE • GROW FOREVER ARCHITECTURE
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Complete Self-Maintenance & Deployment Documentation
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      This portfolio is engineered as a data-driven system. You never need to edit UI components or regenerate the website when you receive new semester results, complete a new project, or earn a new certificate.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                      <h4 className="font-mono text-xs font-bold text-cyan-300 uppercase">
                        METHOD 1 // LIVE ADMIN STUDIO (RECOMMENDED)
                      </h4>
                      <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-300">
                        <li>
                          • Click <strong>Studio</strong> in the top navbar or press <code className="rounded bg-white/10 px-1.5 py-0.5">Ctrl+K</code> and select <strong>Open Portfolio Admin Studio</strong>.
                        </li>
                        <li>
                          • <strong>Semester CGPA Update:</strong> Open the <em>Education & CGPA</em> tab, type your new semester CGPA, and click <em>Update CGPA Now</em>.
                        </li>
                        <li>
                          • <strong>Passport Photo Replacement:</strong> Open <em>Identity & Photo</em>, click <em>Choose Passport Photo File</em>, and select your passport-size photo.
                        </li>
                        <li>
                          • <strong>New Projects & Certificates:</strong> Add a single record in the <em>Projects</em> or <em>Certificates</em> tab—cards, filters, 3D tilt, and modals are generated automatically.
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                      <h4 className="font-mono text-xs font-bold text-violet-300 uppercase">
                        METHOD 2 // CENTRALIZED TYPESCRIPT SEED FILE
                      </h4>
                      <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-300">
                        <li>
                          • All initial starter records live in a single strongly-typed file: <code className="rounded bg-white/10 px-1.5 py-0.5">src/lib/default-portfolio-data.ts</code>.
                        </li>
                        <li>
                          • You can edit <code className="rounded bg-white/10 px-1.5 py-0.5">DEFAULT_PORTFOLIO_DATA</code> directly in VS Code or GitHub Web Editor and click <em>Reset to Seed File</em> below to sync the database.
                        </li>
                        <li>
                          • Use the <strong>Export JSON</strong> button in the top bar anytime to download a complete backup of your portfolio database.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                    <h4 className="font-mono text-xs font-bold text-emerald-300 uppercase">
                      STUDENT-FRIENDLY ZERO-COST DEPLOYMENT INSTRUCTIONS
                    </h4>
                    <ol className="mt-3 space-y-2 text-xs leading-relaxed text-slate-300">
                      <li>
                        <strong>1. Push to GitHub:</strong> Commit this repository to your personal GitHub account.
                      </li>
                      <li>
                        <strong>2. Connect Free Serverless Postgres:</strong> Create a free PostgreSQL database on Neon.tech or Supabase and set <code className="rounded bg-white/10 px-1.5 py-0.5">DATABASE_URL</code> in your environment variables.
                      </li>
                      <li>
                        <strong>3. Set Custom Passkey:</strong> Set <code className="rounded bg-white/10 px-1.5 py-0.5">ADMIN_PASSKEY=your-secret-passkey</code> in your deployment environment variables (Vercel / Railway / Render).
                      </li>
                      <li>
                        <strong>4. Automatic Schema Bootstrap:</strong> On first boot, the application automatically creates all PostgreSQL tables and seeds your starter data—no manual SQL required.
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
