import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  personalProfile,
  educationRecords,
  technicalSkills,
  experiences,
  projects,
  certifications,
  achievements,
  publications,
  beyondAcademics,
  currentFocusItems,
} from "@/db/schema";
import {
  ensurePortfolioSchemaAndSeed,
  getFullPortfolioData,
} from "@/lib/portfolio-service";
import { DEFAULT_PORTFOLIO_DATA } from "@/lib/default-portfolio-data";
import { eq } from "drizzle-orm";

const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY;

function verifyAuth(req: NextRequest): boolean {
  const headerKey = req.headers.get("x-admin-passkey");

  return Boolean(
    ADMIN_PASSKEY &&
    headerKey &&
    headerKey === ADMIN_PASSKEY
  );
}

export async function GET() {
  try {
    const data = await getFullPortfolioData();
    return NextResponse.json({ status: "ok", data });
  } catch (error) {
    console.error("Failed to load portfolio data:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to load portfolio data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensurePortfolioSchemaAndSeed();
    const body = await req.json();

    if (body.action === "verify-passkey") {
      const valid = Boolean(
  ADMIN_PASSKEY && body.passkey === ADMIN_PASSKEY
);
      return NextResponse.json({
        status: valid ? "ok" : "unauthorized",
        valid,
      });
    }

    if (!verifyAuth(req)) {
      return NextResponse.json(
        { status: "error", message: "Invalid Admin Studio Passkey" },
        { status: 401 }
      );
    }

    const { section, payload } = body;

    switch (section) {
      case "education": {
        await db.insert(educationRecords).values({
          institutionName: payload.institutionName || "[Institution Name]",
          degree: payload.degree || "Degree",
          department: payload.department || "Department",
          duration: payload.duration || "202X - 202X",
          currentSemester: payload.currentSemester || "Current",
          cgpa: payload.cgpa || "Pending",
          class10Marks: payload.class10Marks || "",
          class12Marks: payload.class12Marks || "",
          highlights: Array.isArray(payload.highlights) ? payload.highlights : [],
          isPlaceholder: Boolean(payload.isPlaceholder ?? false),
          sortOrder: Number(payload.sortOrder ?? 0),
        });
        break;
      }
      case "skills": {
        await db.insert(technicalSkills).values({
          name: payload.name || "New Technology",
          category: payload.category || "Programming Languages",
          iconName: payload.iconName || "Code2",
          contextTag: payload.contextTag || "Core Stack",
          description: payload.description || "",
          isPlaceholder: Boolean(payload.isPlaceholder ?? false),
          sortOrder: Number(payload.sortOrder ?? 0),
        });
        break;
      }
      case "experiences": {
        await db.insert(experiences).values({
          organizationName: payload.organizationName || "Organization",
          organizationLogo: payload.organizationLogo || "",
          role: payload.role || "Role",
          domain: payload.domain || "Software Development",
          startDate: payload.startDate || "",
          endDate: payload.endDate || "Present",
          description: payload.description || "",
          responsibilities: Array.isArray(payload.responsibilities)
            ? payload.responsibilities
            : [],
          technologies: Array.isArray(payload.technologies)
            ? payload.technologies
            : [],
          outcomes: Array.isArray(payload.outcomes) ? payload.outcomes : [],
          verificationUrl: payload.verificationUrl || "",
          isPlaceholder: Boolean(payload.isPlaceholder ?? false),
          sortOrder: Number(payload.sortOrder ?? 0),
        });
        break;
      }
      case "projects": {
        await db.insert(projects).values({
          name: payload.name || "Untitled Project",
          thumbnailUrl: payload.thumbnailUrl || "/images/project-neural.jpg",
          shortDescription: payload.shortDescription || "",
          problemStatement: payload.problemStatement || "",
          proposedSolution: payload.proposedSolution || "",
          techStack: Array.isArray(payload.techStack) ? payload.techStack : [],
          keyFeatures: Array.isArray(payload.keyFeatures) ? payload.keyFeatures : [],
          category: payload.category || "Full-Stack Systems",
          status: payload.status || "Completed",
          githubUrl: payload.githubUrl || "",
          liveDemoUrl: payload.liveDemoUrl || "",
          docsUrl: payload.docsUrl || "",
          screenshots: Array.isArray(payload.screenshots) ? payload.screenshots : [],
          developmentDate: payload.developmentDate || "2026",
          featured: Boolean(payload.featured ?? true),
          isPlaceholder: Boolean(payload.isPlaceholder ?? false),
          sortOrder: Number(payload.sortOrder ?? 0),
        });
        break;
      }
      case "certifications": {
        await db.insert(certifications).values({
          title: payload.title || "Certification Title",
          issuingOrganization: payload.issuingOrganization || "Organization",
          completionDate: payload.completionDate || "2026",
          certificateImageUrl:
            payload.certificateImageUrl || "/images/certificate-placeholder.svg",
          verificationUrl: payload.verificationUrl || "",
          category: payload.category || "Software Engineering",
          description: payload.description || "",
          isPlaceholder: Boolean(payload.isPlaceholder ?? false),
          sortOrder: Number(payload.sortOrder ?? 0),
        });
        break;
      }
      case "achievements": {
        await db.insert(achievements).values({
          title: payload.title || "Achievement Title",
          organization: payload.organization || "Organization",
          date: payload.date || "2026",
          category: payload.category || "Hackathon",
          description: payload.description || "",
          proofUrl: payload.proofUrl || "",
          isPlaceholder: Boolean(payload.isPlaceholder ?? false),
          sortOrder: Number(payload.sortOrder ?? 0),
        });
        break;
      }
      case "publications": {
        await db.insert(publications).values({
          title: payload.title || "Research Paper Title",
          domain: payload.domain || "Computer Science",
          venue: payload.venue || "Conference / Journal",
          coAuthors: Array.isArray(payload.coAuthors) ? payload.coAuthors : [],
          abstract: payload.abstract || "",
          status: payload.status || "Submitted",
          publicationDate: payload.publicationDate || "2026",
          paperUrl: payload.paperUrl || "",
          isPlaceholder: Boolean(payload.isPlaceholder ?? false),
          sortOrder: Number(payload.sortOrder ?? 0),
        });
        break;
      }
      case "beyondAcademics": {
        await db.insert(beyondAcademics).values({
          title: payload.title || "Activity Title",
          roleOrCategory: payload.roleOrCategory || "Technical Club",
          organization: payload.organization || "Organization",
          duration: payload.duration || "2026",
          description: payload.description || "",
          isPlaceholder: Boolean(payload.isPlaceholder ?? false),
          sortOrder: Number(payload.sortOrder ?? 0),
        });
        break;
      }
      case "currentFocus": {
        await db.insert(currentFocusItems).values({
          title: payload.title || "Learning / Building Focus",
          focusType: payload.focusType || "Currently Learning",
          statusTag: payload.statusTag || "Active",
          description: payload.description || "",
          tags: Array.isArray(payload.tags) ? payload.tags : [],
          isPlaceholder: Boolean(payload.isPlaceholder ?? false),
          sortOrder: Number(payload.sortOrder ?? 0),
        });
        break;
      }
      case "reset-defaults": {
        await db.delete(personalProfile);
        await db.delete(educationRecords);
        await db.delete(technicalSkills);
        await db.delete(experiences);
        await db.delete(projects);
        await db.delete(certifications);
        await db.delete(achievements);
        await db.delete(publications);
        await db.delete(beyondAcademics);
        await db.delete(currentFocusItems);

        await db.insert(personalProfile).values(DEFAULT_PORTFOLIO_DATA.profile);
        await db.insert(educationRecords).values(DEFAULT_PORTFOLIO_DATA.education);
        await db.insert(technicalSkills).values(DEFAULT_PORTFOLIO_DATA.skills);
        await db.insert(experiences).values(DEFAULT_PORTFOLIO_DATA.experiences);
        await db.insert(projects).values(DEFAULT_PORTFOLIO_DATA.projects);
        await db.insert(certifications).values(DEFAULT_PORTFOLIO_DATA.certifications);
        await db.insert(achievements).values(DEFAULT_PORTFOLIO_DATA.achievements);
        await db.insert(publications).values(DEFAULT_PORTFOLIO_DATA.publications);
        await db.insert(beyondAcademics).values(DEFAULT_PORTFOLIO_DATA.beyondAcademics);
        await db.insert(currentFocusItems).values(DEFAULT_PORTFOLIO_DATA.currentFocus);
        break;
      }
      default:
        return NextResponse.json(
          { status: "error", message: `Unknown section: ${section}` },
          { status: 400 }
        );
    }

    const updated = await getFullPortfolioData();
    return NextResponse.json({ status: "ok", data: updated });
  } catch (error) {
    console.error("Failed to create portfolio item:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to save item" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensurePortfolioSchemaAndSeed();
    if (!verifyAuth(req)) {
      return NextResponse.json(
        { status: "error", message: "Invalid Admin Studio Passkey" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { section, id, payload } = body;

    switch (section) {
      case "profile": {
        const profiles = await db.select().from(personalProfile);
        if (profiles.length > 0) {
          await db
            .update(personalProfile)
            .set({
              fullName: payload.fullName,
              headline: payload.headline,
              shortIntro: payload.shortIntro,
              academicStatus: payload.academicStatus,
              location: payload.location ?? "",
              photoUrl: payload.photoUrl,
              photoFrameStyle: payload.photoFrameStyle ?? "rounded-editorial",
              resumeUrl: payload.resumeUrl ?? "/api/resume",
              email: payload.email,
              githubUrl: payload.githubUrl,
              githubUsername: payload.githubUsername ?? "",
              linkedinUrl: payload.linkedinUrl,
              availabilityText: payload.availabilityText,
              isAvailable: Boolean(payload.isAvailable),
              updatedAt: new Date(),
            })
            .where(eq(personalProfile.id, profiles[0].id));
        }
        break;
      }
      case "education": {
        await db
          .update(educationRecords)
          .set({
            institutionName: payload.institutionName,
            degree: payload.degree,
            department: payload.department,
            duration: payload.duration,
            currentSemester: payload.currentSemester,
            cgpa: payload.cgpa,
            class10Marks: payload.class10Marks ?? "",
            class12Marks: payload.class12Marks ?? "",
            highlights: Array.isArray(payload.highlights) ? payload.highlights : [],
            isPlaceholder: Boolean(payload.isPlaceholder ?? false),
            sortOrder: Number(payload.sortOrder ?? 0),
          })
          .where(eq(educationRecords.id, Number(id)));
        break;
      }
      case "skills": {
        await db
          .update(technicalSkills)
          .set({
            name: payload.name,
            category: payload.category,
            iconName: payload.iconName ?? "Code2",
            contextTag: payload.contextTag ?? "Core Stack",
            description: payload.description ?? "",
            isPlaceholder: Boolean(payload.isPlaceholder ?? false),
            sortOrder: Number(payload.sortOrder ?? 0),
          })
          .where(eq(technicalSkills.id, Number(id)));
        break;
      }
      case "experiences": {
        await db
          .update(experiences)
          .set({
            organizationName: payload.organizationName,
            organizationLogo: payload.organizationLogo ?? "",
            role: payload.role,
            domain: payload.domain,
            startDate: payload.startDate,
            endDate: payload.endDate,
            description: payload.description,
            responsibilities: Array.isArray(payload.responsibilities)
              ? payload.responsibilities
              : [],
            technologies: Array.isArray(payload.technologies)
              ? payload.technologies
              : [],
            outcomes: Array.isArray(payload.outcomes) ? payload.outcomes : [],
            verificationUrl: payload.verificationUrl ?? "",
            isPlaceholder: Boolean(payload.isPlaceholder ?? false),
            sortOrder: Number(payload.sortOrder ?? 0),
          })
          .where(eq(experiences.id, Number(id)));
        break;
      }
      case "projects": {
        await db
          .update(projects)
          .set({
            name: payload.name,
            thumbnailUrl: payload.thumbnailUrl,
            shortDescription: payload.shortDescription,
            problemStatement: payload.problemStatement,
            proposedSolution: payload.proposedSolution,
            techStack: Array.isArray(payload.techStack) ? payload.techStack : [],
            keyFeatures: Array.isArray(payload.keyFeatures)
              ? payload.keyFeatures
              : [],
            category: payload.category,
            status: payload.status,
            githubUrl: payload.githubUrl ?? "",
            liveDemoUrl: payload.liveDemoUrl ?? "",
            docsUrl: payload.docsUrl ?? "",
            screenshots: Array.isArray(payload.screenshots)
              ? payload.screenshots
              : [],
            developmentDate: payload.developmentDate,
            featured: Boolean(payload.featured),
            isPlaceholder: Boolean(payload.isPlaceholder ?? false),
            sortOrder: Number(payload.sortOrder ?? 0),
          })
          .where(eq(projects.id, Number(id)));
        break;
      }
      case "certifications": {
        await db
          .update(certifications)
          .set({
            title: payload.title,
            issuingOrganization: payload.issuingOrganization,
            completionDate: payload.completionDate,
            certificateImageUrl: payload.certificateImageUrl,
            verificationUrl: payload.verificationUrl ?? "",
            category: payload.category,
            description: payload.description ?? "",
            isPlaceholder: Boolean(payload.isPlaceholder ?? false),
            sortOrder: Number(payload.sortOrder ?? 0),
          })
          .where(eq(certifications.id, Number(id)));
        break;
      }
      case "achievements": {
        await db
          .update(achievements)
          .set({
            title: payload.title,
            organization: payload.organization,
            date: payload.date,
            category: payload.category,
            description: payload.description,
            proofUrl: payload.proofUrl ?? "",
            isPlaceholder: Boolean(payload.isPlaceholder ?? false),
            sortOrder: Number(payload.sortOrder ?? 0),
          })
          .where(eq(achievements.id, Number(id)));
        break;
      }
      case "publications": {
        await db
          .update(publications)
          .set({
            title: payload.title,
            domain: payload.domain,
            venue: payload.venue,
            coAuthors: Array.isArray(payload.coAuthors) ? payload.coAuthors : [],
            abstract: payload.abstract,
            status: payload.status,
            publicationDate: payload.publicationDate,
            paperUrl: payload.paperUrl ?? "",
            isPlaceholder: Boolean(payload.isPlaceholder ?? false),
            sortOrder: Number(payload.sortOrder ?? 0),
          })
          .where(eq(publications.id, Number(id)));
        break;
      }
      case "beyondAcademics": {
        await db
          .update(beyondAcademics)
          .set({
            title: payload.title,
            roleOrCategory: payload.roleOrCategory,
            organization: payload.organization,
            duration: payload.duration,
            description: payload.description,
            isPlaceholder: Boolean(payload.isPlaceholder ?? false),
            sortOrder: Number(payload.sortOrder ?? 0),
          })
          .where(eq(beyondAcademics.id, Number(id)));
        break;
      }
      case "currentFocus": {
        await db
          .update(currentFocusItems)
          .set({
            title: payload.title,
            focusType: payload.focusType,
            statusTag: payload.statusTag,
            description: payload.description,
            tags: Array.isArray(payload.tags) ? payload.tags : [],
            isPlaceholder: Boolean(payload.isPlaceholder ?? false),
            sortOrder: Number(payload.sortOrder ?? 0),
          })
          .where(eq(currentFocusItems.id, Number(id)));
        break;
      }
      default:
        return NextResponse.json(
          { status: "error", message: `Unknown section: ${section}` },
          { status: 400 }
        );
    }

    const updated = await getFullPortfolioData();
    return NextResponse.json({ status: "ok", data: updated });
  } catch (error) {
    console.error("Failed to update portfolio record:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to update record" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensurePortfolioSchemaAndSeed();
    if (!verifyAuth(req)) {
      return NextResponse.json(
        { status: "error", message: "Invalid Admin Studio Passkey" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");
    const id = Number(searchParams.get("id"));

    if (!section || !id) {
      return NextResponse.json(
        { status: "error", message: "Missing section or id" },
        { status: 400 }
      );
    }

    switch (section) {
      case "education":
        await db.delete(educationRecords).where(eq(educationRecords.id, id));
        break;
      case "skills":
        await db.delete(technicalSkills).where(eq(technicalSkills.id, id));
        break;
      case "experiences":
        await db.delete(experiences).where(eq(experiences.id, id));
        break;
      case "projects":
        await db.delete(projects).where(eq(projects.id, id));
        break;
      case "certifications":
        await db.delete(certifications).where(eq(certifications.id, id));
        break;
      case "achievements":
        await db.delete(achievements).where(eq(achievements.id, id));
        break;
      case "publications":
        await db.delete(publications).where(eq(publications.id, id));
        break;
      case "beyondAcademics":
        await db.delete(beyondAcademics).where(eq(beyondAcademics.id, id));
        break;
      case "currentFocus":
        await db.delete(currentFocusItems).where(eq(currentFocusItems.id, id));
        break;
      default:
        return NextResponse.json(
          { status: "error", message: `Unknown section: ${section}` },
          { status: 400 }
        );
    }

    const updated = await getFullPortfolioData();
    return NextResponse.json({ status: "ok", data: updated });
  } catch (error) {
    console.error("Failed to delete record:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to delete record" },
      { status: 500 }
    );
  }
}
