import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const personalProfile = pgTable("personal_profile", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  headline: text("headline").notNull(),
  shortIntro: text("short_intro").notNull(),
  academicStatus: text("academic_status").notNull(),
  location: text("location").notNull().default(""),
  photoUrl: text("photo_url").notNull().default("/images/passport-placeholder.svg"),
  photoFrameStyle: text("photo_frame_style").notNull().default("rounded-editorial"),
  resumeUrl: text("resume_url").notNull().default("/api/resume"),
  email: text("email").notNull(),
  githubUrl: text("github_url").notNull(),
  githubUsername: text("github_username").notNull().default(""),
  linkedinUrl: text("linkedin_url").notNull(),
  availabilityText: text("availability_text").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const educationRecords = pgTable("education_records", {
  id: serial("id").primaryKey(),
  institutionName: text("institution_name").notNull(),
  degree: text("degree").notNull(),
  department: text("department").notNull(),
  duration: text("duration").notNull(),
  currentSemester: text("current_semester").notNull(),
  cgpa: text("cgpa").notNull(),
  class10Marks: text("class_10_marks").notNull().default(""),
  class12Marks: text("class_12_marks").notNull().default(""),
  highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
  isPlaceholder: boolean("is_placeholder").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const technicalSkills = pgTable("technical_skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  iconName: text("icon_name").notNull().default("Code2"),
  contextTag: text("context_tag").notNull().default("Core Stack"),
  description: text("description").notNull().default(""),
  isPlaceholder: boolean("is_placeholder").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  organizationName: text("organization_name").notNull(),
  organizationLogo: text("organization_logo").notNull().default(""),
  role: text("role").notNull(),
  domain: text("domain").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  description: text("description").notNull(),
  responsibilities: jsonb("responsibilities").$type<string[]>().notNull().default([]),
  technologies: jsonb("technologies").$type<string[]>().notNull().default([]),
  outcomes: jsonb("outcomes").$type<string[]>().notNull().default([]),
  verificationUrl: text("verification_url").notNull().default(""),
  isPlaceholder: boolean("is_placeholder").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull().default("/images/project-neural.jpg"),
  shortDescription: text("short_description").notNull(),
  problemStatement: text("problem_statement").notNull(),
  proposedSolution: text("proposed_solution").notNull(),
  techStack: jsonb("tech_stack").$type<string[]>().notNull().default([]),
  keyFeatures: jsonb("key_features").$type<string[]>().notNull().default([]),
  category: text("category").notNull(),
  status: text("status").notNull().default("Completed"), // Completed | Prototype | In Progress
  githubUrl: text("github_url").notNull().default(""),
  liveDemoUrl: text("live_demo_url").notNull().default(""),
  docsUrl: text("docs_url").notNull().default(""),
  screenshots: jsonb("screenshots").$type<string[]>().notNull().default([]),
  developmentDate: text("development_date").notNull(),
  featured: boolean("featured").notNull().default(true),
  isPlaceholder: boolean("is_placeholder").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  issuingOrganization: text("issuing_organization").notNull(),
  completionDate: text("completion_date").notNull(),
  certificateImageUrl: text("certificate_image_url")
    .notNull()
    .default("/images/certificate-placeholder.svg"),
  verificationUrl: text("verification_url").notNull().default(""),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  isPlaceholder: boolean("is_placeholder").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  proofUrl: text("proof_url").notNull().default(""),
  isPlaceholder: boolean("is_placeholder").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const publications = pgTable("publications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  domain: text("domain").notNull(),
  venue: text("venue").notNull(),
  coAuthors: jsonb("co_authors").$type<string[]>().notNull().default([]),
  abstract: text("abstract").notNull(),
  status: text("status").notNull().default("Submitted"), // Submitted | Under Review | Accepted | Published | Draft
  publicationDate: text("publication_date").notNull(),
  paperUrl: text("paper_url").notNull().default(""),
  isPlaceholder: boolean("is_placeholder").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const beyondAcademics = pgTable("beyond_academics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  roleOrCategory: text("role_or_category").notNull(),
  organization: text("organization").notNull(),
  duration: text("duration").notNull(),
  description: text("description").notNull(),
  isPlaceholder: boolean("is_placeholder").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const currentFocusItems = pgTable("current_focus_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  focusType: text("focus_type").notNull(), // Currently Learning | Technology Explored | Currently Building | Development Goal
  statusTag: text("status_tag").notNull(),
  description: text("description").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  isPlaceholder: boolean("is_placeholder").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PersonalProfile = typeof personalProfile.$inferSelect;
export type EducationRecord = typeof educationRecords.$inferSelect;
export type TechnicalSkill = typeof technicalSkills.$inferSelect;
export type ExperienceRecord = typeof experiences.$inferSelect;
export type ProjectRecord = typeof projects.$inferSelect;
export type CertificationRecord = typeof certifications.$inferSelect;
export type AchievementRecord = typeof achievements.$inferSelect;
export type PublicationRecord = typeof publications.$inferSelect;
export type BeyondAcademicRecord = typeof beyondAcademics.$inferSelect;
export type CurrentFocusItem = typeof currentFocusItems.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
