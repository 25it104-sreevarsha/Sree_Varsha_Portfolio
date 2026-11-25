"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { FullPortfolioData } from "@/lib/portfolio-service";
import type { ProjectRecord, CertificationRecord } from "@/db/schema";
import { InteractiveEnvironment } from "@/components/InteractiveEnvironment";
import { TiltCard } from "@/components/TiltCard";
import { ProjectCaseStudyModal } from "@/components/ProjectCaseStudyModal";
import { CertificateLightboxModal } from "@/components/CertificateLightboxModal";
import { CommandPaletteModal } from "@/components/CommandPaletteModal";
import { AdminStudioModal } from "@/components/AdminStudioModal";
import { MagneticButton } from "@/components/MagneticButton";
import { IdentityTerminal } from "@/components/IdentityTerminal";
import { CareerJourney } from "@/components/CareerJourney";
import { GithubContributionGraph } from "@/components/GithubContributionGraph";
import { soundEngine } from "@/lib/sound-engine";
import {
  Terminal,
  Sparkles,
  Download,
  ExternalLink,
  GitBranch,
  Globe,
  Mail,
  MapPin,
  Search,
  Filter,
  FolderGit2,
  Cpu,
  Code2,
  Server,
  Database,
  BrainCircuit,
  Radio,
  ShieldCheck,
  Layout,
  GraduationCap,
  Briefcase,
  Award,
  Trophy,
  BookOpen,
  Compass,
  Users,
  Settings,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ArrowUp,
  CheckCircle2,
  Send,
  Plus,
  Edit3,
  Eye,
  Menu,
  X,
  Camera,
  FileText,
  Layers,
  Copy,
  Check,
  Clock,
  ChevronDown,
  Medal,
  Zap,
} from "lucide-react";

const WebGLBackdrop = dynamic(() => import("@/components/WebGLBackdropCanvas"), {
  ssr: false,
});

interface PortfolioExperienceProps {
  initialData: FullPortfolioData;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Terminal,
  Cpu,
  Layout,
  Sparkles,
  Server,
  Database,
  BrainCircuit,
  Radio,
  ShieldCheck,
  GitBranch,
};

/* Animated counter — genuine values from the live database, eased on mount */
function useAnimatedNumber(target: number, duration = 1500): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(Math.round(target * eased));
      if (p < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}

function AnimatedNumber({ value }: { value: number }) {
  return <>{useAnimatedNumber(value)}</>;
}

/* Collectible medallion icon selection, keyed off achievement category */
function badgeIconFor(category: string) {
  const c = category.toLowerCase();
  if (c.includes("hackathon")) return Trophy;
  if (c.includes("award") || c.includes("honor") || c.includes("recognition"))
    return Medal;
  if (c.includes("academic") || c.includes("scholar")) return GraduationCap;
  if (c.includes("competition") || c.includes("contest")) return Zap;
  return Sparkles;
}

export function PortfolioExperience({ initialData }: PortfolioExperienceProps) {
  const [portfolio, setPortfolio] = useState<FullPortfolioData>(initialData);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeSection, setActiveSection] = useState("identity");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Passport Portrait Frame Live Override
  const [frameStyle, setFrameStyle] = useState<string>(
    initialData.profile.photoFrameStyle || "rounded-editorial"
  );

  // Project filters
  const [projectSearch, setProjectSearch] = useState("");
  const [projectCategory, setProjectCategory] = useState("All");
  const [projectStatus, setProjectStatus] = useState("All");
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(
    null
  );

  // Skill filter
  const [skillCategory, setSkillCategory] = useState("All");

  // Certificate filters
  const [certSearch, setCertSearch] = useState("");
  const [certCategory, setCertCategory] = useState("All");
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificationRecord | null>(null);

  // Command palette & Admin Studio
  const [cmdOpen, setCmdOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("profile");

  // GitHub live telemetry state
  const [githubData, setGithubData] = useState<{
    configured: boolean;
    profile?: {
      login: string;
      name: string;
      publicRepos: number;
      followers: number;
      htmlUrl: string;
    };
    repos?: Array<{
      id: number;
      name: string;
      description: string;
      htmlUrl: string;
      language: string;
      stargazersCount: number;
    }>;
  } | null>(null);

  // Cinematic chrome state: scroll beam, clock, typewriter, clipboard, badges
  const [scrollProgress, setScrollProgress] = useState(0);
  const [clock, setClock] = useState("--:--:--");
  const [typedRole, setTypedRole] = useState("Information Technology");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [expandedAchievementId, setExpandedAchievementId] = useState<
    number | null
  >(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactFeedback, setContactFeedback] = useState<{
    type: "success" | "error";
    text: string;
    receiptId?: number;
  } | null>(null);

  useEffect(() => {
    setFrameStyle(portfolio.profile.photoFrameStyle || "rounded-editorial");
  }, [portfolio.profile.photoFrameStyle]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        soundEngine.playClick();
        setCmdOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCmdOpen(false);
        setSelectedProject(null);
        setSelectedCertificate(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll spy & back-to-top
  useEffect(() => {
    const sectionIds = [
      "identity",
      "projects",
      "skills",
      "education",
      "experience",
      "journey",
      "certifications",
      "research",
      "achievements",
      "focus",
      "contact",
    ];
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 520);
      const scrollPos = window.scrollY + 240;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch GitHub telemetry when username is configured
  useEffect(() => {
    const username = portfolio.profile.githubUsername?.trim();
    if (!username) {
      setGithubData({ configured: false });
      return;
    }
    fetch(`/api/github?username=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then((d) => setGithubData(d))
      .catch(() => setGithubData({ configured: false }));
  }, [portfolio.profile.githubUsername]);

  // Scroll progress beam (top of viewport)
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setScrollProgress(max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Live local clock (visitor's timezone)
  useEffect(() => {
    const update = () =>
      setClock(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    update();
    const t = window.setInterval(update, 1000);
    return () => window.clearInterval(t);
  }, []);

  // Animated typewriter — rotating engineering identity phrases
  useEffect(() => {
    const roles = [
      "Information Technology, B.Tech",
      "Aspiring Software Developer",
      "Full-Stack Systems Builder",
      "Problem Solver by Design",
    ];
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTypedRole(roles[0]);
      return;
    }
    let roleIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timeout: number;
    const tick = () => {
      const current = roles[roleIdx];
      if (!deleting) {
        charIdx += 1;
        setTypedRole(current.slice(0, charIdx));
        if (charIdx >= current.length) {
          deleting = true;
          timeout = window.setTimeout(tick, 1750);
          return;
        }
        timeout = window.setTimeout(tick, 42 + Math.random() * 42);
      } else {
        charIdx -= 1;
        setTypedRole(current.slice(0, Math.max(0, charIdx)));
        if (charIdx <= 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          timeout = window.setTimeout(tick, 340);
          return;
        }
        timeout = window.setTimeout(tick, 22);
      }
    };
    timeout = window.setTimeout(tick, 550);
    return () => window.clearTimeout(timeout);
  }, []);

  // Copy email to clipboard with feedback
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(portfolio.profile.email);
      setCopiedEmail(true);
      soundEngine.playSuccess();
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      // Clipboard API unavailable — the mailto CTA remains the fallback
    }
  };

  // Genuine marquee ticker, derived from tracked technologies
  const ticker = useMemo(
    () => portfolio.skills.slice(0, 16).map((s) => s.name.toUpperCase()),
    [portfolio.skills]
  );

  const toggleTheme = () => {
    soundEngine.playClick();
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    soundEngine.enabled = next;
    setSoundEnabled(next);
    if (next) soundEngine.playSuccess();
  };

  const openStudio = (tab = "profile") => {
    soundEngine.playClick();
    setAdminTab(tab);
    setAdminOpen(true);
  };

  // Derived project categories & filtered list
  const projectCategories = useMemo(() => {
    const cats = Array.from(
      new Set(portfolio.projects.map((p) => p.category).filter(Boolean))
    );
    return ["All", ...cats];
  }, [portfolio.projects]);

  const filteredProjects = useMemo(() => {
    return portfolio.projects.filter((p) => {
      const matchesCat =
        projectCategory === "All" || p.category === projectCategory;
      const matchesStatus =
        projectStatus === "All" || p.status === projectStatus;
      const q = projectSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.problemStatement.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesStatus && matchesQuery;
    });
  }, [portfolio.projects, projectCategory, projectStatus, projectSearch]);

  // Derived skill categories & filtered skills
  const skillCategories = useMemo(() => {
    const cats = Array.from(
      new Set(portfolio.skills.map((s) => s.category).filter(Boolean))
    );
    return ["All", ...cats];
  }, [portfolio.skills]);

  const filteredSkills = useMemo(() => {
    if (skillCategory === "All") return portfolio.skills;
    return portfolio.skills.filter((s) => s.category === skillCategory);
  }, [portfolio.skills, skillCategory]);

  // Derived certificate categories & filtered list
  const certCategories = useMemo(() => {
    const cats = Array.from(
      new Set(portfolio.certifications.map((c) => c.category).filter(Boolean))
    );
    return ["All", ...cats];
  }, [portfolio.certifications]);

  const filteredCertificates = useMemo(() => {
    return portfolio.certifications.filter((c) => {
      const matchesCat = certCategory === "All" || c.category === certCategory;
      const q = certSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.issuingOrganization.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [portfolio.certifications, certCategory, certSearch]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactFeedback(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const json = await res.json();
      if (res.ok && json.status === "ok") {
        soundEngine.playSuccess();
        setContactFeedback({
          type: "success",
          text: json.message,
          receiptId: json.receipt?.id,
        });
        setContactForm({ name: "", email: "", subject: "", message: "" });
        setPortfolio((prev) => ({
          ...prev,
          messagesCount: prev.messagesCount + 1,
        }));
      } else {
        setContactFeedback({
          type: "error",
          text: json.message || "Failed to send message.",
        });
      }
    } catch {
      setContactFeedback({
        type: "error",
        text: "Network error. Please use the direct Email button.",
      });
    } finally {
      setContactSubmitting(false);
    }
  };

  const navItems = [
    { id: "identity", label: "Identity" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "education", label: "Education" },
    { id: "experience", label: "Experience" },
    { id: "journey", label: "Journey" },
    { id: "contact", label: "Contact" },
  ];

  const isLight = theme === "light";

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isLight
          ? "bg-[#F8FAFC] text-[#0F172A]"
          : "bg-[#07080C] text-[#F8FAFC]"
      }`}
    >
      <InteractiveEnvironment theme={theme} />
      <WebGLBackdrop theme={theme} />

      {/* Cinematic scroll progress beam */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 z-50 h-[2px] bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-400 transition-[width] duration-150 ease-out"
        style={{ width: `${scrollProgress * 100}%` }}
      />
      {/* Subtle cinematic film grain */}
      <div aria-hidden="true" className="grain-overlay" />

      {/* Ambient Atmospheric Top Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[520px] opacity-60"
        style={{
          background: isLight
            ? "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(124, 58, 237, 0.12), rgba(6, 182, 212, 0.08), transparent)"
            : "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(124, 58, 237, 0.24), rgba(6, 182, 212, 0.11), transparent)",
        }}
      />

      {/* TOP FLOATING GLASSMORPHIC NAVIGATION DOCK */}
      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 backdrop-blur-xl transition-colors ${
            isLight
              ? "border-slate-200/90 bg-white/85 shadow-lg shadow-slate-900/5"
              : "border-white/10 bg-[#0B0D16]/80 shadow-2xl shadow-black/50"
          }`}
        >
          {/* Brand Signature */}
          <a
            href="#identity"
            onClick={() => soundEngine.playClick()}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-violet-500 to-cyan-400 font-mono text-xs font-bold text-white shadow-md shadow-violet-600/25">
              DS
            </div>
            <div className="hidden sm:block">
              <div className="font-mono text-[10px] tracking-[0.2em] text-violet-400 uppercase">
                Portfolio
              </div>
              <div className="text-xs font-semibold tracking-tight">
                {portfolio.profile.fullName.length > 26
                  ? "Developer Identity System"
                  : portfolio.profile.fullName}
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden items-center gap-1 lg:flex"
          >
            {navItems.map((item) => {
              const active = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => soundEngine.playClick()}
                  onMouseEnter={() => soundEngine.playHover()}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
                      : isLight
                      ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right Utility Controls */}
          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCmdOpen(true);
              }}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-xs transition ${
                isLight
                  ? "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-violet-400/40 hover:text-white"
              }`}
              title="Open Command Palette (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5 text-violet-400" />
              <span className="hidden sm:inline">Command</span>
              <kbd className="rounded bg-black/25 px-1.5 py-0.5 text-[10px] text-cyan-400">
                ⌘K
              </kbd>
            </button>

            {/* Ambient Sound Toggle (Off by default) */}
            <button
              type="button"
              onClick={toggleSound}
              aria-label={
                soundEnabled ? "Disable ambient sound" : "Enable ambient sound"
              }
              title={
                soundEnabled
                  ? "Harmonic UI Audio: Enabled"
                  : "Harmonic UI Audio: Disabled (Click to enable)"
              }
              className={`rounded-xl border p-2 transition ${
                soundEnabled
                  ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-400"
                  : isLight
                  ? "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              title="Switch Theme"
              className={`rounded-xl border p-2 transition ${
                isLight
                  ? "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:text-white"
              }`}
            >
              {isLight ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>

            {/* Studio / Self-Maintenance Button */}
            <button
              type="button"
              onClick={() => openStudio("profile")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:opacity-95"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Studio</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle mobile navigation"
              className="rounded-xl border border-white/10 bg-white/5 p-2 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            className={`mx-auto mt-2 max-w-7xl rounded-2xl border p-4 backdrop-blur-xl lg:hidden ${
              isLight
                ? "border-slate-200 bg-white/95"
                : "border-white/10 bg-[#0B0D16]/95"
            }`}
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-medium"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-7xl space-y-28 px-4 pt-10 pb-28 sm:px-6 lg:px-8">
        {/* =====================================================================
            SECTION A: PERSONAL INTRODUCTION & PASSPORT PORTRAIT MONOLITH
           ===================================================================== */}
        <section id="identity" className="perspective-stage relative scroll-mt-28">
          {/* MODEL B — perspective grid floor receding to a vanishing point */}
          <div aria-hidden="true" className="grid-floor" />

          <div className="relative grid items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Editorial Identity & CTAs (7 Cols) */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="font-mono text-xs font-medium tracking-wide text-violet-300">
                  {portfolio.profile.availabilityText}
                </span>
              </div>

              <div className="space-y-3">
                <div className="font-mono text-xs tracking-[0.2em] text-cyan-400 uppercase">
                  DIGITAL IDENTITY // {portfolio.profile.academicStatus}
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="bg-gradient-to-r from-white via-violet-200 to-cyan-300 bg-clip-text text-transparent">
                    {portfolio.profile.fullName}
                  </span>
                </h1>
                <p
                  className={`text-lg font-medium sm:text-xl ${
                    isLight ? "text-slate-700" : "text-slate-300"
                  }`}
                >
                  {portfolio.profile.headline}
                </p>
                {/* Animated typewriter identity line */}
                <p className="font-mono text-sm text-emerald-300">
                  <span className="text-slate-500">$ </span>
                  <span aria-live="polite">{typedRole}</span>
                  <span className="typed-caret ml-0.5 text-cyan-300">▌</span>
                </p>
              </div>

              <p
                className={`max-w-2xl text-base leading-relaxed ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {portfolio.profile.shortIntro}
              </p>

              <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-slate-400">
                {portfolio.profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                    {portfolio.profile.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-violet-400" />
                  CGPA:{" "}
                  <strong className="text-cyan-300">
                    {portfolio.education[0]?.cgpa || "Editable in Studio"}
                  </strong>
                </span>
                <span
                  className="inline-flex items-center gap-1.5"
                  title="Your local time"
                  suppressHydrationWarning
                >
                  <Clock className="h-3.5 w-3.5 text-violet-400" />
                  LOCAL&nbsp;{clock}
                </span>
              </div>

              {/* Primary CTAs — magnetic hover on the principal action */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <MagneticButton strength={0.28}>
                  <a
                    href="#projects"
                    onClick={() => soundEngine.playClick()}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-600/25 transition hover:scale-[1.02]"
                  >
                    <FolderGit2 className="h-4 w-4" />
                    Explore Engineering Projects
                  </a>
                </MagneticButton>

                <a
                  href={portfolio.profile.resumeUrl || "/api/resume"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick()}
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-semibold transition ${
                    isLight
                      ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                      : "border-white/15 bg-white/5 text-white hover:border-cyan-400/50 hover:bg-white/10"
                  }`}
                >
                  <Download className="h-4 w-4 text-cyan-400" />
                  Download Resume PDF
                </a>

                <a
                  href={portfolio.profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition ${
                    isLight
                      ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-violet-400/40 hover:text-white"
                  }`}
                >
                  <GitBranch className="h-4 w-4 text-violet-400" />
                  GitHub
                </a>

                <a
                  href={portfolio.profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition ${
                    isLight
                      ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/40 hover:text-white"
                  }`}
                >
                  <Globe className="h-4 w-4 text-cyan-400" />
                  LinkedIn
                </a>
              </div>

              {/* Terminal-inspired identity console (genuine profile data) */}
              <div className="pt-2">
                <IdentityTerminal
                  name={portfolio.profile.fullName}
                  headline={portfolio.profile.headline}
                  shortIntro={portfolio.profile.shortIntro}
                  email={portfolio.profile.email}
                  availabilityText={portfolio.profile.availabilityText}
                  topSkills={portfolio.skills.map((s) => s.name)}
                  projectsCount={portfolio.projects.length}
                  completedProjects={
                    portfolio.projects.filter((p) => p.status === "Completed")
                      .length
                  }
                  technologiesCount={portfolio.skills.length}
                />
              </div>
            </div>

            {/* Right Column: Interactive Passport Portrait Monolith (5 Cols) */}
            <div className="preserve-3d relative flex flex-col items-center lg:col-span-5">
              {/* MODEL B — depth-layered floating tech satellites (genuine stack) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden sm:block"
              >
                <span
                  className="float-chip absolute top-2 -left-2 rounded-xl border border-violet-500/40 bg-[#12152A]/90 px-3 py-1.5 font-mono text-[10px] font-bold text-violet-300 shadow-lg shadow-violet-950/40 backdrop-blur-md"
                  style={{ "--chip-tilt": "-6deg", zIndex: 20 } as React.CSSProperties}
                >
                  &lt;Next.js 16 /&gt;
                </span>
                <span
                  className="float-chip float-chip-late absolute top-24 -right-3 rounded-xl border border-cyan-500/40 bg-[#0B1620]/90 px-3 py-1.5 font-mono text-[10px] font-bold text-cyan-300 shadow-lg shadow-cyan-950/40 backdrop-blur-md"
                  style={{ "--chip-tilt": "7deg", zIndex: 20 } as React.CSSProperties}
                >
                  type TypeScript
                </span>
                <span
                  className="float-chip float-chip-later absolute bottom-40 -left-5 rounded-xl border border-emerald-500/40 bg-[#0C1A15]/90 px-3 py-1.5 font-mono text-[10px] font-bold text-emerald-300 shadow-lg shadow-emerald-950/40 backdrop-blur-md"
                  style={{ "--chip-tilt": "5deg", zIndex: 20 } as React.CSSProperties}
                >
                  SELECT * FROM growth;
                </span>
                <span
                  className="float-chip float-chip-late absolute bottom-6 -right-4 rounded-xl border border-amber-500/40 bg-[#1C150B]/90 px-3 py-1.5 font-mono text-[10px] font-bold text-amber-300 shadow-lg shadow-amber-950/40 backdrop-blur-md"
                  style={{ "--chip-tilt": "-7deg", zIndex: 20 } as React.CSSProperties}
                >
                  git commit -m deploy
                </span>
              </div>

              <TiltCard intensity={7} className="relative z-10 w-full max-w-sm">
                <div
                  className={`card-depth relative overflow-hidden rounded-3xl border p-6 backdrop-blur-2xl ${
                    isLight
                      ? "border-slate-200 bg-white/90"
                      : "border-white/15 bg-[#0E111D]/90"
                  }`}
                >
                  {/* Top Telemetry Header inside Identity Card */}
                  <div className="mb-4 flex items-center justify-between font-mono text-[10px] tracking-widest text-slate-400">
                    <span className="inline-flex items-center gap-1.5 text-cyan-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      PASSPORT PORTRAIT UNIT
                    </span>
                    <span>3.5 : 4.5 OPTICS</span>
                  </div>

                  {/* Architectural Passport Frame Container */}
                  <div className="relative mx-auto flex items-center justify-center py-2">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-tr from-violet-600/30 via-transparent to-cyan-400/30 blur-xl"
                    />

                    <div
                      className={`relative overflow-hidden border-2 border-violet-400/40 bg-[#07080C] shadow-inner transition-all duration-500 ${
                        frameStyle === "circular-precision"
                          ? "h-64 w-64 rounded-full"
                          : frameStyle === "biometric-hex"
                          ? "aspect-[3.5/4.5] w-60 rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg"
                          : "aspect-[3.5/4.5] w-60 rounded-2xl"
                      }`}
                    >
                      <img
                        src={portfolio.profile.photoUrl}
                        alt={`${portfolio.profile.fullName} portrait`}
                        className="h-full w-full object-cover object-center"
                      />

                      {/* Subtle Glass Corner Brackets */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Holographic sheen sweep */}
                      <div
                        aria-hidden="true"
                        className="holo-sweep pointer-events-none absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />

                      {/* Rotating holographic verification seal */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-1.5 bottom-1.5 h-12 w-12"
                      >
                        <div
                          className="holo-seal absolute inset-0 rounded-full"
                          style={{
                            background:
                              "conic-gradient(from 0deg, #7C3AED, #06B6D4, #C4B5FD, #7C3AED)",
                          }}
                        />
                        <div className="absolute inset-[4px] flex items-center justify-center rounded-full bg-[#0A0C14]/95">
                          <ShieldCheck className="h-5 w-5 text-cyan-300" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ID chip + barcode — futuristic smart-badge treatment */}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <svg
                      width="44"
                      height="32"
                      viewBox="0 0 44 32"
                      aria-hidden="true"
                      className="text-amber-200/80"
                    >
                      <rect x="1" y="1" width="42" height="30" rx="4" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.5" />
                      <path d="M1 12h13M1 20h13M30 12h13M30 20h13M14 10v12M30 10v12" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.4" />
                    </svg>
                    <svg
                      width="96"
                      height="30"
                      viewBox="0 0 96 30"
                      aria-hidden="true"
                      className="text-slate-400"
                    >
                      {[3, 6, 8, 13, 16, 19, 21, 26, 30, 34, 37, 39, 44, 47, 51, 55, 57, 62, 65, 69, 72, 75, 80, 83, 86, 90].map(
                        (x, i) => (
                          <rect
                            key={i}
                            x={x}
                            y={2}
                            width={i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1.2}
                            height={20}
                            fill="currentColor"
                            opacity={0.75}
                          />
                        )
                      )}
                      <text x="48" y="29" textAnchor="middle" fontSize="6" fill="currentColor" letterSpacing="2">
                        DS-2026-IT
                      </text>
                    </svg>
                    <span className="text-right font-mono text-[9px] leading-tight text-slate-500">
                      DIGITAL<br />SIGNATURE
                    </span>
                  </div>

                  {/* Interactive Frame Mode Switcher + Photo Upload Trigger */}
                  <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                        Frame Architecture:
                      </span>
                      <button
                        type="button"
                        onClick={() => openStudio("profile")}
                        className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-cyan-400 hover:underline"
                      >
                        <Camera className="h-3 w-3" />
                        Replace Photo
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "rounded-editorial", label: "Editorial" },
                        { id: "circular-precision", label: "Circular" },
                        { id: "biometric-hex", label: "Chamfered" },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            setFrameStyle(mode.id);
                          }}
                          className={`rounded-lg border py-1.5 font-mono text-[10px] font-medium transition ${
                            frameStyle === mode.id
                              ? "border-violet-400 bg-violet-500/20 text-violet-200"
                              : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>

          {/* Genuine Data-Driven Animated Counters */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: "Engineering Projects",
                value: portfolio.projects.length,
                sub: `${
                  portfolio.projects.filter((p) => p.status === "Completed")
                    .length
                } Completed • ${
                  portfolio.projects.filter((p) => p.status !== "Completed")
                    .length
                } Prototype/Active`,
                action: () => openStudio("projects"),
              },
              {
                label: "Technologies Tracked",
                value: portfolio.skills.length,
                sub: `Across ${skillCategories.length - 1} Technical Domains`,
                action: () => openStudio("skills"),
              },
              {
                label: "Verifiable Credentials",
                value: portfolio.certifications.length,
                sub: "Click any credential to inspect",
                action: () => openStudio("certifications"),
              },
              {
                label: "Honors & Hackathons",
                value: portfolio.achievements.length,
                sub: "Expandable collectible medallions",
                action: () => openStudio("achievements"),
              },
            ].map((stat, i) => (
              <button
                key={i}
                type="button"
                onClick={stat.action}
                className={`group rounded-2xl border p-5 text-left transition ${
                  isLight
                    ? "border-slate-200 bg-white hover:border-violet-400"
                    : "border-white/10 bg-[#0D101B]/80 hover:border-violet-500/40 hover:bg-[#111525]"
                }`}
              >
                <div className="font-mono text-2xl font-bold tracking-tight text-cyan-400 tabular-nums sm:text-3xl">
                  <AnimatedNumber value={stat.value} />
                </div>
                <div className="mt-1 text-sm font-semibold">{stat.label}</div>
                <div className="mt-1 font-mono text-[11px] text-slate-400">
                  {stat.sub}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Cinematic stack ticker — genuine technology names, infinite loop */}
        <div
          aria-hidden="true"
          className="-mx-4 overflow-hidden border-y border-white/[0.06] bg-black/20 py-2.5 sm:-mx-6 lg:-mx-8"
        >
          <div className="animate-marquee flex w-max items-center whitespace-nowrap">
            {[...ticker, ...ticker].map((item, i) => (
              <span
                key={i}
                className="flex items-center font-mono text-[10px] tracking-[0.3em] text-slate-500"
              >
                <span className="px-6">{item}</span>
                <span className="text-violet-500">◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* =====================================================================
            SECTION E: PROJECTS — THE MOST IMPORTANT SECTION
           ===================================================================== */}
        <section id="projects" className="scroll-mt-28 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-xs tracking-[0.2em] text-violet-400 uppercase">
                01 // ARCHITECTURAL CASE STUDIES
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Featured Engineering Projects
              </h2>
              <p className="max-w-2xl text-sm text-slate-400">
                Interactive showcase with category filtering, status distinction (Completed Products vs. Prototypes vs. In Progress), and expandable technical case studies.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openStudio("projects")}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/15 px-4 py-2.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/25"
            >
              <Plus className="h-4 w-4" />
              Add / Edit Projects in Studio
            </button>
          </div>

          {/* Search, Category Filter & Status Filter Bar */}
          <div
            className={`space-y-4 rounded-2xl border p-4 backdrop-blur-xl ${
              isLight
                ? "border-slate-200 bg-white/90"
                : "border-white/10 bg-[#0C0F1A]/85"
            }`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search projects by title, problem statement, or technology stack..."
                  className={`w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm focus:border-violet-400 focus:outline-none ${
                    isLight
                      ? "border-slate-200 bg-slate-50 text-slate-900"
                      : "border-white/10 bg-black/40 text-white"
                  }`}
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 inline-flex items-center gap-1 font-mono text-xs text-slate-400">
                  <Filter className="h-3.5 w-3.5" /> Status:
                </span>
                {["All", "Completed", "Prototype", "In Progress"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setProjectStatus(st);
                    }}
                    className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition ${
                      projectStatus === st
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                        : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
              {projectCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setProjectCategory(cat);
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                    projectCategory === cat
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-600/20"
                      : isLight
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
              <p className="text-base text-slate-400">
                No projects match your current filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setProjectCategory("All");
                  setProjectStatus("All");
                  setProjectSearch("");
                }}
                className="mt-4 rounded-xl border border-violet-500/40 bg-violet-500/15 px-4 py-2 text-xs font-semibold text-violet-200"
              >
                Reset Project Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => {
                const statusBadge =
                  project.status === "Completed"
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : project.status === "Prototype"
                    ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
                    : "border-amber-500/40 bg-amber-500/15 text-amber-300";

                return (
                  <TiltCard key={project.id} intensity={4} className="h-full">
                    <article
                      className={`card-depth group flex h-full flex-col overflow-hidden rounded-2xl border transition ${
                        isLight
                          ? "border-slate-200 bg-white shadow-lg shadow-slate-900/5 hover:border-violet-400"
                          : "border-white/10 bg-[#0D101B]/90 hover:border-violet-500/40"
                      }`}
                    >
                      {/* Thumbnail Header */}
                      <div
                        className="relative aspect-video w-full cursor-pointer overflow-hidden bg-black"
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedProject(project);
                        }}
                      >
                        <img
                          src={project.thumbnailUrl}
                          alt={project.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D101B] via-transparent to-black/30 opacity-85" />

                        {/* Status & Category Badges */}
                        <div className="absolute top-3 right-3 left-3 flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium backdrop-blur-md ${statusBadge}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {project.status}
                          </span>
                          <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[10px] text-slate-200 backdrop-blur-md">
                            {project.category}
                          </span>
                        </div>

                        {project.isPlaceholder && (
                          <div className="absolute bottom-2.5 left-3 rounded-md border border-amber-500/40 bg-black/75 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                            EDITABLE PLACEHOLDER
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                            <span>{project.developmentDate}</span>
                            <button
                              type="button"
                              onClick={() => openStudio("projects")}
                              className="inline-flex items-center gap-1 text-violet-400 hover:underline"
                            >
                              <Edit3 className="h-3 w-3" />
                              Edit
                            </button>
                          </div>

                          <h3
                            onClick={() => setSelectedProject(project)}
                            className="cursor-pointer text-lg font-bold tracking-tight transition group-hover:text-cyan-400"
                          >
                            {project.name}
                          </h3>

                          <p className="line-clamp-3 text-sm leading-relaxed text-slate-400">
                            {project.shortDescription}
                          </p>
                        </div>

                        <div className="mt-5 space-y-4">
                          {/* Tech Stack Pills */}
                          <div className="flex flex-wrap gap-1.5">
                            {project.techStack.slice(0, 5).map((t, i) => (
                              <span
                                key={i}
                                className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 font-mono text-[11px] text-violet-300"
                              >
                                {t}
                              </span>
                            ))}
                            {project.techStack.length > 5 && (
                              <span className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[11px] text-slate-400">
                                +{project.techStack.length - 5}
                              </span>
                            )}
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playClick();
                                setSelectedProject(project);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600/20 px-3.5 py-2 font-mono text-xs font-semibold text-violet-300 transition hover:bg-violet-600 hover:text-white"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Case Study
                            </button>

                            <div className="flex items-center gap-2">
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 font-mono text-xs text-slate-300 transition hover:border-violet-400 hover:text-white"
                                  title="View GitHub Repository"
                                >
                                  <GitBranch className="h-3.5 w-3.5" />
                                  Code
                                </a>
                              )}
                              {project.liveDemoUrl && (
                                <a
                                  href={project.liveDemoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-2.5 py-1.5 font-mono text-xs text-cyan-300 transition hover:bg-cyan-500/20"
                                  title="Launch Live Demo"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  Demo
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </TiltCard>
                );
              })}
            </div>
          )}

          {/* GitHub Live Telemetry & Selected Repositories Bar */}
          <div
            className={`rounded-2xl border p-6 ${
              isLight
                ? "border-slate-200 bg-white"
                : "border-white/10 bg-[#0B0E18]/90"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    GitHub Repository Telemetry
                  </h3>
                  <p className="text-xs text-slate-400">
                    {githubData?.configured
                      ? `Streaming live public repositories for @${githubData.profile?.login}`
                      : "Connect your GitHub handle in the Admin Studio to stream live repository metrics."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={portfolio.profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium hover:border-violet-400"
                >
                  Open GitHub Profile
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => openStudio("profile")}
                  className="rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-3.5 py-2 font-mono text-xs text-cyan-300 hover:bg-cyan-500/20"
                >
                  Configure Handle
                </button>
              </div>
            </div>

            {githubData?.configured &&
              githubData.repos &&
              githubData.repos.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {githubData.repos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-cyan-400/50"
                    >
                      <div className="font-mono text-xs font-bold text-cyan-300">
                        {repo.name}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                        {repo.description || "Public engineering repository"}
                      </p>
                      <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-slate-400">
                        <span>{repo.language || "Code"}</span>
                        <span>★ {repo.stargazersCount}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            {portfolio.profile.githubUsername?.trim() && (
              <GithubContributionGraph
                username={portfolio.profile.githubUsername.trim()}
              />
            )}
          </div>
        </section>

        {/* =====================================================================
            SECTION C: TECHNICAL SKILLS MATRIX (NO FAKE PERCENTAGE BARS)
           ===================================================================== */}
        <section id="skills" className="scroll-mt-28 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-xs tracking-[0.2em] text-cyan-400 uppercase">
                02 // CAPABILITY TOPOLOGY
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Technical Skills & Stack Architecture
              </h2>
              <p className="max-w-2xl text-sm text-slate-400">
                Categorized engineering capabilities across languages, frontend, backend, databases, AI/ML, IoT, cybersecurity, and developer tooling—presented with practical context rather than arbitrary percentage bars.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openStudio("skills")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium hover:border-cyan-400"
            >
              <Plus className="h-3.5 w-3.5 text-cyan-400" />
              Add Technology / Category
            </button>
          </div>

          {/* Skill Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {skillCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setSkillCategory(cat);
                }}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  skillCategory === cat
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-600/20"
                    : isLight
                    ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    : "border border-white/10 bg-[#0D101B] text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Interactive Skill Nodes Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSkills.map((skill) => {
              const IconComponent = ICON_MAP[skill.iconName] || Code2;
              return (
                <div
                  key={skill.id}
                  className={`group rounded-2xl border p-5 transition ${
                    isLight
                      ? "border-slate-200 bg-white hover:border-violet-400"
                      : "border-white/10 bg-[#0D101B]/80 hover:border-cyan-400/40 hover:bg-[#111525]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400 transition group-hover:border-cyan-400/40 group-hover:text-cyan-300">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold">{skill.name}</h3>
                        <span className="font-mono text-[11px] text-cyan-400">
                          {skill.category}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                      {skill.contextTag}
                    </span>
                  </div>
                  {skill.description && (
                    <p className="mt-3 text-xs leading-relaxed text-slate-400">
                      {skill.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            SECTION B: EDUCATION & EDITABLE SEMESTER CGPA TELEMETRY
           ===================================================================== */}
        <section id="education" className="scroll-mt-28 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-xs tracking-[0.2em] text-violet-400 uppercase">
                03 // ACADEMIC FOUNDATION
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Education & Semester Telemetry
              </h2>
              <p className="max-w-2xl text-sm text-slate-400">
                Supports multiple academic records with instant semester CGPA updates and Class 10 / Class 12 marks.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openStudio("education")}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2.5 font-mono text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/25"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Update Semester CGPA
            </button>
          </div>

          <div className="space-y-6">
            {portfolio.education.map((edu) => (
              <div
                key={edu.id}
                className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 ${
                  isLight
                    ? "border-slate-200 bg-white shadow-sm"
                    : "border-white/10 bg-[#0D101B]/90"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-0.5 font-mono text-xs text-violet-300">
                        {edu.duration}
                      </span>
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 font-mono text-xs text-cyan-300">
                        {edu.currentSemester}
                      </span>
                      {edu.isPlaceholder && (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] text-amber-300">
                          EDITABLE PLACEHOLDER
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold sm:text-2xl">
                      {edu.degree} — {edu.department}
                    </h3>
                    <p className="text-sm font-medium text-slate-400">
                      {edu.institutionName}
                    </p>
                  </div>

                  {/* Prominent Editable CGPA & Board Marks Telemetry Boxes */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openStudio("education")}
                      title="Click to update CGPA for the new semester"
                      className="group rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-left transition hover:bg-cyan-500/20"
                    >
                      <div className="font-mono text-[10px] tracking-wider text-cyan-300 uppercase">
                        CURRENT CGPA (CLICK TO EDIT)
                      </div>
                      <div className="font-mono text-lg font-extrabold text-white">
                        {edu.cgpa}
                      </div>
                    </button>

                    {edu.class12Marks && (
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
                        <div className="font-mono text-[10px] text-slate-400 uppercase">
                          CLASS XII SCORE
                        </div>
                        <div className="font-mono text-sm font-bold">
                          {edu.class12Marks}
                        </div>
                      </div>
                    )}

                    {edu.class10Marks && (
                      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
                        <div className="font-mono text-[10px] text-slate-400 uppercase">
                          CLASS X SCORE
                        </div>
                        <div className="font-mono text-sm font-bold">
                          {edu.class10Marks}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {edu.highlights && edu.highlights.length > 0 && (
                  <ul className="mt-5 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2">
                    {edu.highlights.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs leading-relaxed text-slate-400"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            SECTION D: EXPERIENCE & INTERNSHIPS TIMELINE
           ===================================================================== */}
        <section id="experience" className="scroll-mt-28 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-xs tracking-[0.2em] text-cyan-400 uppercase">
                04 // INDUSTRY & RESEARCH TENURE
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Experience & Internships
              </h2>
            </div>

            <button
              type="button"
              onClick={() => openStudio("experiences")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium hover:border-violet-400"
            >
              <Plus className="h-3.5 w-3.5 text-violet-400" />
              Add Internship / Experience
            </button>
          </div>

          <div className="space-y-6">
            {portfolio.experiences.map((exp) => (
              <div
                key={exp.id}
                className={`rounded-2xl border p-6 sm:p-8 ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : "border-white/10 bg-[#0D101B]/90"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-500/35 bg-violet-500/10 font-mono text-xs font-bold text-violet-300">
                      {exp.organizationLogo ||
                        exp.organizationName.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold">{exp.role}</h3>
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[11px] text-cyan-300">
                          {exp.domain}
                        </span>
                        {exp.isPlaceholder && (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                            EDITABLE PLACEHOLDER
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-400">
                        {exp.organizationName} • {exp.startDate} – {exp.endDate}
                      </p>
                    </div>
                  </div>

                  {exp.verificationUrl && (
                    <a
                      href={exp.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-mono text-xs text-cyan-300 hover:border-cyan-400"
                    >
                      Verify Credential
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  {exp.description}
                </p>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-mono text-xs font-semibold text-violet-300 uppercase">
                        Key Responsibilities
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-400">
                        {exp.responsibilities.map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exp.outcomes && exp.outcomes.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-mono text-xs font-semibold text-cyan-300 uppercase">
                        Key Outcomes & Impact
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-400">
                        {exp.outcomes.map((o, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
                    {exp.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            CAREER JOURNEY — INTERACTIVE MILESTONE CIRCUIT TIMELINE
           ===================================================================== */}
        <section id="journey" className="scroll-mt-28 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-xs tracking-[0.2em] text-violet-400 uppercase">
                MILESTONE CIRCUIT // CAREER TIMELINE
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                The Journey So Far
              </h2>
              <p className="max-w-2xl text-sm text-slate-400">
                One continuous signal — education, internships, hackathons and
                research — auto-assembled from the records you maintain in the
                Admin Studio. Filter by stream, tap any node to expand it.
              </p>
            </div>
          </div>

          <CareerJourney portfolio={portfolio} isLight={isLight} />
        </section>

        {/* =====================================================================
            SECTION F: CERTIFICATIONS GALLERY & LIGHTBOX
           ===================================================================== */}
        <section id="certifications" className="scroll-mt-28 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-xs tracking-[0.2em] text-violet-400 uppercase">
                05 // VERIFIABLE CREDENTIALS
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Certifications & Specializations
              </h2>
              <p className="max-w-2xl text-sm text-slate-400">
                Click any certificate card to open the interactive credential lightbox preview.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openStudio("certifications")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/40 bg-violet-500/15 px-4 py-2 text-xs font-semibold text-violet-200"
            >
              <Plus className="h-4 w-4" />
              Add Certificate
            </button>
          </div>

          {/* Certificate Search & Category Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="Search certificates by title or issuer..."
                className={`w-full rounded-xl border py-2 pr-4 pl-10 text-sm focus:border-violet-400 focus:outline-none ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-900"
                    : "border-white/10 bg-[#0D101B] text-white"
                }`}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {certCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCertCategory(cat)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                    certCategory === cat
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                      : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCertificates.map((cert) => (
              <div
                key={cert.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedCertificate(cert);
                }}
                className={`group cursor-pointer overflow-hidden rounded-2xl border transition ${
                  isLight
                    ? "border-slate-200 bg-white hover:border-violet-400"
                    : "border-white/10 bg-[#0D101B]/90 hover:border-cyan-400/50"
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
                  <img
                    src={cert.certificateImageUrl}
                    alt={cert.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/70 px-2.5 py-0.5 font-mono text-[10px] text-cyan-300 backdrop-blur-md">
                    {cert.category}
                  </div>
                </div>

                <div className="p-5">
                  <div className="font-mono text-xs text-slate-400">
                    {cert.issuingOrganization} • {cert.completionDate}
                  </div>
                  <h3 className="mt-1 text-base font-bold group-hover:text-cyan-300">
                    {cert.title}
                  </h3>
                  {cert.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                      {cert.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-violet-300">
                    <span>Click to Preview Credential</span>
                    <Eye className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            SECTION H: RESEARCH & PUBLICATIONS
           ===================================================================== */}
        <section id="research" className="scroll-mt-28 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-xs tracking-[0.2em] text-cyan-400 uppercase">
                06 // SCHOLARLY INQUIRY
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Research & Publications
              </h2>
              <p className="max-w-2xl text-sm text-slate-400">
                Strict academic integrity badges distinguish between Draft, Submitted, Under Review, Accepted, and Published works.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openStudio("publications")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium hover:border-cyan-400"
            >
              <Plus className="h-3.5 w-3.5 text-cyan-400" />
              Add Research Entry
            </button>
          </div>

          <div className="space-y-4">
            {portfolio.publications.map((pub) => {
              const pubBadge =
                pub.status === "Published"
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                  : pub.status === "Accepted"
                  ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
                  : "border-amber-500/40 bg-amber-500/15 text-amber-300";

              return (
                <div
                  key={pub.id}
                  className={`rounded-2xl border p-6 ${
                    isLight
                      ? "border-slate-200 bg-white"
                      : "border-white/10 bg-[#0D101B]/90"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`rounded-full border px-3 py-1 font-mono text-xs font-semibold ${pubBadge}`}
                      >
                        Status: {pub.status}
                      </span>
                      <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-xs text-violet-300">
                        {pub.domain}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-400">
                      {pub.publicationDate}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold">{pub.title}</h3>
                  <p className="mt-1 font-mono text-xs text-cyan-400">
                    Venue: {pub.venue} • Co-Authors:{" "}
                    {(pub.coAuthors || []).join(", ")}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {pub.abstract}
                  </p>

                  {pub.paperUrl && (
                    <div className="mt-4">
                      <a
                        href={pub.paperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-violet-400 hover:underline"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Inspect Manuscript / Conference Link
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            SECTION G: ACHIEVEMENTS & RECOGNITION
           ===================================================================== */}
        <section id="achievements" className="scroll-mt-28 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="font-mono text-xs tracking-[0.2em] text-violet-400 uppercase">
                07 // COMPETITIVE MILESTONES
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Achievements, Hackathons & Recognition
              </h2>
            </div>

            <button
              type="button"
              onClick={() => openStudio("achievements")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium hover:border-violet-400"
            >
              <Plus className="h-3.5 w-3.5 text-violet-400" />
              Add Achievement
            </button>
          </div>

          {/* Collectible medallion badges — tap to expand full dossier */}
          <div className="grid gap-5 lg:grid-cols-2">
            {portfolio.achievements.map((ach) => {
              const BadgeIcon = badgeIconFor(ach.category);
              const open = expandedAchievementId === ach.id;
              return (
                <div
                  key={ach.id}
                  className={`group rounded-2xl border p-5 sm:p-6 transition ${
                    isLight
                      ? "border-slate-200 bg-white hover:border-violet-400"
                      : "border-white/10 bg-[#0D101B]/90 hover:border-amber-500/40"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setExpandedAchievementId(open ? null : ach.id);
                    }}
                    aria-expanded={open}
                    className="flex w-full items-center gap-4 text-left sm:gap-5"
                  >
                    {/* Medallion */}
                    <span className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full transition-transform duration-500 group-hover:rotate-45"
                        style={{
                          background:
                            "conic-gradient(from 210deg, #7C3AED, #06B6D4, #F59E0B, #A78BFA, #7C3AED)",
                        }}
                      />
                      <span className="absolute inset-[4px] flex items-center justify-center rounded-full bg-[#0C0E17]">
                        <BadgeIcon className="h-6 w-6 text-amber-300 sm:h-7 sm:w-7" />
                      </span>
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.18em] text-amber-300 uppercase">
                          {ach.category}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {ach.date}
                        </span>
                        {ach.isPlaceholder && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[9px] text-slate-500 uppercase">
                            Editable
                          </span>
                        )}
                      </span>
                      <span className="mt-1.5 block text-sm leading-snug font-bold sm:text-base">
                        {ach.title}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-cyan-400">
                        {ach.organization}
                      </span>
                    </span>

                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 ${
                        open ? "rotate-180 text-amber-300" : ""
                      }`}
                    />
                  </button>

                  {/* Expandable dossier */}
                  {open && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="text-sm leading-relaxed text-slate-400">
                        {ach.description}
                      </p>
                      {ach.proofUrl && (
                        <a
                          href={ach.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-300 hover:underline"
                        >
                          Verification / Event Link
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            SECTIONS I & J: CURRENTLY LEARNING / BUILDING + BEYOND ACADEMICS
           ===================================================================== */}
        <section id="focus" className="scroll-mt-28 grid gap-8 lg:grid-cols-12">
          {/* J. Currently Learning / Currently Building (7 Cols) */}
          <div className="space-y-5 lg:col-span-7">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-xs tracking-[0.2em] text-cyan-400 uppercase">
                  08 // ACTIVE TRAJECTORY
                </div>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                  Currently Learning & Building
                </h2>
              </div>
              <button
                type="button"
                onClick={() => openStudio("focus")}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-cyan-300 hover:bg-white/10"
              >
                Update Focus
              </button>
            </div>

            <div className="space-y-4">
              {portfolio.currentFocus.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-5 ${
                    isLight
                      ? "border-slate-200 bg-white"
                      : "border-white/10 bg-[#0D101B]/90"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 font-mono text-xs text-cyan-300">
                      <Compass className="h-3.5 w-3.5" />
                      {item.focusType}
                    </span>
                    <span className="font-mono text-xs text-violet-300">
                      {item.statusTag}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-bold">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                    {item.description}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* I. Beyond Academics (5 Cols) */}
          <div className="space-y-5 lg:col-span-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-xs tracking-[0.2em] text-violet-400 uppercase">
                  09 // LEADERSHIP & COMMUNITY
                </div>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                  Beyond Academics
                </h2>
              </div>
              <button
                type="button"
                onClick={() => openStudio("focus")}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-violet-300 hover:bg-white/10"
              >
                Edit Clubs
              </button>
            </div>

            <div className="space-y-4">
              {portfolio.beyondAcademics.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-2xl border p-5 ${
                    isLight
                      ? "border-slate-200 bg-white"
                      : "border-white/10 bg-[#0D101B]/90"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-xs text-violet-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {b.roleOrCategory}
                    </span>
                    <span className="text-slate-400">{b.duration}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold">{b.title}</h3>
                  <div className="font-mono text-xs text-cyan-400">
                    {b.organization}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION K: CONTACT & COLLABORATION DISPATCH
           ===================================================================== */}
        <section id="contact" className="scroll-mt-28">
          <div
            className={`card-depth overflow-hidden rounded-3xl border p-6 sm:p-10 ${
              isLight
                ? "border-slate-200 bg-white shadow-xl"
                : "border-white/15 bg-gradient-to-br from-[#0D101D] via-[#0A0C16] to-[#111528]"
            }`}
          >
            <div className="grid gap-10 lg:grid-cols-12">
              {/* Left Info Column */}
              <div className="space-y-6 lg:col-span-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 font-mono text-xs text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {portfolio.profile.availabilityText}
                </div>

                <div className="space-y-2">
                  <div className="font-mono text-xs tracking-[0.2em] text-violet-400 uppercase">
                    10 // DIRECT TRANSMISSION
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Initiate Collaboration
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-400">
                    Have an internship opportunity, software engineering role, research collaboration, or hackathon team inquiry? Send a message directly to the PostgreSQL inbox or launch your email client.
                  </p>
                </div>

                {/* Direct Email & Resume Actions */}
                <div className="space-y-3 pt-2">
                  <a
                    href={`mailto:${portfolio.profile.email}`}
                    className="flex items-center justify-between rounded-2xl border border-violet-500/35 bg-violet-500/10 p-4 transition hover:bg-violet-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-violet-400" />
                      <div>
                        <div className="font-mono text-[10px] text-violet-300 uppercase">
                          DIRECT MAILTO DISPATCH
                        </div>
                        <div className="text-sm font-bold">
                          {portfolio.profile.email}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-violet-300" />
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-2 font-mono text-[11px] text-slate-400 transition hover:text-cyan-300"
                    aria-live="polite"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-300">
                          email address copied to clipboard
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        copy email address to clipboard
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-3 gap-2.5">
                    <a
                      href={portfolio.profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-medium hover:border-violet-400"
                    >
                      <GitBranch className="h-4 w-4 text-violet-400" />
                      GitHub
                    </a>
                    <a
                      href={portfolio.profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-medium hover:border-cyan-400"
                    >
                      <Globe className="h-4 w-4 text-cyan-400" />
                      LinkedIn
                    </a>
                    <a
                      href={portfolio.profile.resumeUrl || "/api/resume"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-medium hover:border-emerald-400"
                    >
                      <FileText className="h-4 w-4 text-emerald-400" />
                      Resume
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Functional Contact Form */}
              <div className="lg:col-span-7">
                <form
                  onSubmit={handleContactSubmit}
                  className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-slate-300">
                        YOUR NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Recruiter / Collaborator Name"
                        className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-xs text-slate-300">
                        YOUR EMAIL *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="you@organization.com"
                        className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block font-mono text-xs text-slate-300">
                      SUBJECT *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          subject: e.target.value,
                        })
                      }
                      placeholder="Software Engineering Internship / Project Inquiry"
                      className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block font-mono text-xs text-slate-300">
                      MESSAGE *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      placeholder="Write your message here..."
                      className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:outline-none"
                    />
                  </div>

                  {contactFeedback && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-xs ${
                        contactFeedback.type === "success"
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                          : "border-rose-500/40 bg-rose-500/15 text-rose-200"
                      }`}
                    >
                      <div className="font-semibold">
                        {contactFeedback.text}
                      </div>
                      {contactFeedback.receiptId && (
                        <div className="mt-1 font-mono text-[11px] text-emerald-300">
                          Database Receipt ID: #{contactFeedback.receiptId} • Viewable in Admin Studio Inbox
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:opacity-95 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      {contactSubmitting
                        ? "Transmitting to Database..."
                        : "Transmit Message"}
                    </button>

                    <a
                      href={`mailto:${portfolio.profile.email}?subject=${encodeURIComponent(
                        contactForm.subject || "Portfolio Inquiry"
                      )}&body=${encodeURIComponent(contactForm.message || "")}`}
                      className="font-mono text-xs text-slate-400 hover:text-cyan-300"
                    >
                      Or send via default email client →
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 font-mono text-[10px] font-bold text-white">
              DS
            </div>
            <span className="font-mono text-xs text-slate-400">
              Sree Varsha's Portfolio
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => openStudio("guide")}
              className="font-mono text-cyan-400 hover:underline"
            >
              Self-Maintenance & Update Documentation
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="font-mono hover:text-white"
            >
              Command Palette (Ctrl+K)
            </button>
          </div>
        </div>
      </footer>

      {/* FLOATING BACK-TO-TOP CONTROL */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="Back to top"
          className="fixed right-6 bottom-6 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-500/40 bg-[#0D101B]/90 text-violet-300 shadow-xl backdrop-blur-md transition hover:scale-105 hover:border-cyan-400 hover:text-cyan-300"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* MODALS */}
      <ProjectCaseStudyModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onEditInStudio={() => openStudio("projects")}
      />

      <CertificateLightboxModal
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        onEditInStudio={() => openStudio("certifications")}
      />

      <CommandPaletteModal
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        portfolio={portfolio}
        theme={theme}
        onToggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenAdmin={(tab) => openStudio(tab)}
        onSelectProject={(p) => setSelectedProject(p)}
        onSelectCertificate={(c) => setSelectedCertificate(c)}
      />

      <AdminStudioModal
        open={adminOpen}
        initialTab={adminTab}
        onClose={() => setAdminOpen(false)}
        portfolio={portfolio}
        onPortfolioUpdated={(updated) => setPortfolio(updated)}
      />
    </div>
  );
}
