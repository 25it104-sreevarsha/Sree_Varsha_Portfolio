import React from "react";
import { getFullPortfolioData, type FullPortfolioData } from "@/lib/portfolio-service";
import { DEFAULT_PORTFOLIO_DATA } from "@/lib/default-portfolio-data";
import { PortfolioExperience } from "@/components/PortfolioExperience";

export const dynamic = "force-dynamic";

function buildFallbackPortfolioData(): FullPortfolioData {
  return {
    profile: {
      id: 1,
      ...DEFAULT_PORTFOLIO_DATA.profile,
      updatedAt: new Date(),
    },
    education: DEFAULT_PORTFOLIO_DATA.education.map((e, i) => ({
      id: i + 1,
      ...e,
    })),
    skills: DEFAULT_PORTFOLIO_DATA.skills.map((s, i) => ({
      id: i + 1,
      ...s,
    })),
    experiences: DEFAULT_PORTFOLIO_DATA.experiences.map((exp, i) => ({
      id: i + 1,
      ...exp,
    })),
    projects: DEFAULT_PORTFOLIO_DATA.projects.map((p, i) => ({
      id: i + 1,
      ...p,
    })),
    certifications: DEFAULT_PORTFOLIO_DATA.certifications.map((c, i) => ({
      id: i + 1,
      ...c,
    })),
    achievements: DEFAULT_PORTFOLIO_DATA.achievements.map((a, i) => ({
      id: i + 1,
      ...a,
    })),
    publications: DEFAULT_PORTFOLIO_DATA.publications.map((pub, i) => ({
      id: i + 1,
      ...pub,
    })),
    beyondAcademics: DEFAULT_PORTFOLIO_DATA.beyondAcademics.map((b, i) => ({
      id: i + 1,
      ...b,
    })),
    currentFocus: DEFAULT_PORTFOLIO_DATA.currentFocus.map((f, i) => ({
      id: i + 1,
      ...f,
    })),
    messagesCount: 0,
  };
}

export default async function HomePage() {
  let portfolioData: FullPortfolioData;
  try {
    portfolioData = await getFullPortfolioData();
  } catch (error) {
    console.error("Using fallback portfolio data:", error);
    portfolioData = buildFallbackPortfolioData();
  }

  return <PortfolioExperience initialData={portfolioData} />;
}
