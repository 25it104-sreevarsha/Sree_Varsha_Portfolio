import { db, pool } from "@/db";
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
  contactMessages,
  type PersonalProfile,
  type EducationRecord,
  type TechnicalSkill,
  type ExperienceRecord,
  type ProjectRecord,
  type CertificationRecord,
  type AchievementRecord,
  type PublicationRecord,
  type BeyondAcademicRecord,
  type CurrentFocusItem,
  type ContactMessage,
} from "@/db/schema";
import { DEFAULT_PORTFOLIO_DATA } from "@/lib/default-portfolio-data";
import { asc, desc } from "drizzle-orm";

export interface FullPortfolioData {
  profile: PersonalProfile;
  education: EducationRecord[];
  skills: TechnicalSkill[];
  experiences: ExperienceRecord[];
  projects: ProjectRecord[];
  certifications: CertificationRecord[];
  achievements: AchievementRecord[];
  publications: PublicationRecord[];
  beyondAcademics: BeyondAcademicRecord[];
  currentFocus: CurrentFocusItem[];
  messagesCount: number;
}

let schemaInitialized = false;

export async function ensurePortfolioSchemaAndSeed(): Promise<void> {
  if (!schemaInitialized) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS personal_profile (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        headline TEXT NOT NULL,
        short_intro TEXT NOT NULL,
        academic_status TEXT NOT NULL,
        location TEXT NOT NULL DEFAULT '',
        photo_url TEXT NOT NULL DEFAULT '/images/passport-placeholder.svg',
        photo_frame_style TEXT NOT NULL DEFAULT 'rounded-editorial',
        resume_url TEXT NOT NULL DEFAULT '/api/resume',
        email TEXT NOT NULL,
        github_url TEXT NOT NULL,
        github_username TEXT NOT NULL DEFAULT '',
        linkedin_url TEXT NOT NULL,
        availability_text TEXT NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT true,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS education_records (
        id SERIAL PRIMARY KEY,
        institution_name TEXT NOT NULL,
        degree TEXT NOT NULL,
        department TEXT NOT NULL,
        duration TEXT NOT NULL,
        current_semester TEXT NOT NULL,
        cgpa TEXT NOT NULL,
        class_10_marks TEXT NOT NULL DEFAULT '',
        class_12_marks TEXT NOT NULL DEFAULT '',
        highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_placeholder BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS technical_skills (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        icon_name TEXT NOT NULL DEFAULT 'Code2',
        context_tag TEXT NOT NULL DEFAULT 'Core Stack',
        description TEXT NOT NULL DEFAULT '',
        is_placeholder BOOLEAN NOT NULL DEFAULT false,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS experiences (
        id SERIAL PRIMARY KEY,
        organization_name TEXT NOT NULL,
        organization_logo TEXT NOT NULL DEFAULT '',
        role TEXT NOT NULL,
        domain TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        description TEXT NOT NULL,
        responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb,
        technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
        outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
        verification_url TEXT NOT NULL DEFAULT '',
        is_placeholder BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL DEFAULT '/images/project-neural.jpg',
        short_description TEXT NOT NULL,
        problem_statement TEXT NOT NULL,
        proposed_solution TEXT NOT NULL,
        tech_stack JSONB NOT NULL DEFAULT '[]'::jsonb,
        key_features JSONB NOT NULL DEFAULT '[]'::jsonb,
        category TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Completed',
        github_url TEXT NOT NULL DEFAULT '',
        live_demo_url TEXT NOT NULL DEFAULT '',
        docs_url TEXT NOT NULL DEFAULT '',
        screenshots JSONB NOT NULL DEFAULT '[]'::jsonb,
        development_date TEXT NOT NULL,
        featured BOOLEAN NOT NULL DEFAULT true,
        is_placeholder BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS certifications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        issuing_organization TEXT NOT NULL,
        completion_date TEXT NOT NULL,
        certificate_image_url TEXT NOT NULL DEFAULT '/images/certificate-placeholder.svg',
        verification_url TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        is_placeholder BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        organization TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        proof_url TEXT NOT NULL DEFAULT '',
        is_placeholder BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS publications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        domain TEXT NOT NULL,
        venue TEXT NOT NULL,
        co_authors JSONB NOT NULL DEFAULT '[]'::jsonb,
        abstract TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Submitted',
        publication_date TEXT NOT NULL,
        paper_url TEXT NOT NULL DEFAULT '',
        is_placeholder BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS beyond_academics (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        role_or_category TEXT NOT NULL,
        organization TEXT NOT NULL,
        duration TEXT NOT NULL,
        description TEXT NOT NULL,
        is_placeholder BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS current_focus_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        focus_type TEXT NOT NULL,
        status_tag TEXT NOT NULL,
        description TEXT NOT NULL,
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_placeholder BOOLEAN NOT NULL DEFAULT true,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        sender_name TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'unread',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    schemaInitialized = true;
  }

  const existingProfiles = await db.select().from(personalProfile);
  if (existingProfiles.length === 0) {
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
  }
}

export async function getFullPortfolioData(): Promise<FullPortfolioData> {
  await ensurePortfolioSchemaAndSeed();

  const [
    profiles,
    eduList,
    skillList,
    expList,
    projList,
    certList,
    achList,
    pubList,
    beyondList,
    focusList,
    msgList,
  ] = await Promise.all([
    db.select().from(personalProfile),
    db.select().from(educationRecords).orderBy(asc(educationRecords.sortOrder), asc(educationRecords.id)),
    db.select().from(technicalSkills).orderBy(asc(technicalSkills.sortOrder), asc(technicalSkills.id)),
    db.select().from(experiences).orderBy(asc(experiences.sortOrder), desc(experiences.id)),
    db.select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.id)),
    db.select().from(certifications).orderBy(asc(certifications.sortOrder), desc(certifications.id)),
    db.select().from(achievements).orderBy(asc(achievements.sortOrder), desc(achievements.id)),
    db.select().from(publications).orderBy(asc(publications.sortOrder), desc(publications.id)),
    db.select().from(beyondAcademics).orderBy(asc(beyondAcademics.sortOrder), desc(beyondAcademics.id)),
    db.select().from(currentFocusItems).orderBy(asc(currentFocusItems.sortOrder), asc(currentFocusItems.id)),
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)),
  ]);

  return {
    profile: profiles[0],
    education: eduList,
    skills: skillList,
    experiences: expList,
    projects: projList,
    certifications: certList,
    achievements: achList,
    publications: pubList,
    beyondAcademics: beyondList,
    currentFocus: focusList,
    messagesCount: msgList.length,
  };
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  await ensurePortfolioSchemaAndSeed();
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}
