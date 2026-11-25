import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio // Futuristic Developer Portfolio & Engineering Identity",
  description:
    "Interactive, data-driven personal portfolio and engineering identity system for a B.Tech Information Technology undergraduate and aspiring software developer.",
  keywords: [
    "B.Tech Information Technology Portfolio",
    "Software Developer Portfolio",
    "Full-Stack Engineer",
    "Sree Varsha's Portfolio",
    "Interactive Developer Identity",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Sree Varsha's Portfolio // Developer Identity & Case Studies",
    description:
      "Futuristic, self-maintainable developer portfolio featuring interactive 3D project case studies, semester CGPA telemetry, and verifiable credentials.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#07080C] text-[#F8FAFC] antialiased selection:bg-violet-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
