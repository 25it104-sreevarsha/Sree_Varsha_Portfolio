# IMPORTANT — customized portfolio setup

This ZIP has been prefilled with the verified details available in the previous portfolio page. The visual components and styling have been retained. Your next personal edits are your email, LinkedIn URL, current CGPA/semester, portrait, project screenshots, and any certificates or achievements you want to publish.

- The portfolio is a full-stack **Next.js + PostgreSQL** app. GitHub stores the code; use a Next.js hosting provider such as Vercel/Railway/Render for the live site. GitHub Pages alone cannot run its API routes or database.
- Set `DATABASE_URL` and a strong private `ADMIN_PASSKEY` before deploying. The source has a fallback Admin Studio passkey (`signature-2026`); replace it by setting the environment variable. Never publish your real passkey.
- The updated default content seeds a new/empty database. It does not automatically overwrite an already-populated database.
- For photo and certificate/project image naming, read `ASSET_UPLOAD_GUIDE.md`.

---

# THE DIGITAL SIGNATURE — Self-Maintenance & Deployment Guide

This portfolio is architected on a **Build Once, Grow Forever** philosophy. Every section is 100% data-driven and backed by PostgreSQL (with Drizzle ORM) and a centralized TypeScript seed schema (`src/lib/default-portfolio-data.ts`).

You **never** need to edit React layout components or redesign cards when you receive new semester results, complete a new project, or earn a new certificate.

---

## 0. Interactive Signature Systems (auto-powered by your records)

| System | Powered by | How it updates |
| --- | --- | --- |
| Identity Terminal (`whoami`, `skills`, `projects`…) | Profile + Skills + Project records | Edits in the Studio reflect instantly |
| Animated counters (hero telemetry) | Live counts of projects, skills, certifications, achievements | Any Studio add/delete updates them |
| Career Journey timeline | Education, Experience, Achievement, Publication dates | Adding a record auto-places a milestone node |
| GitHub contribution graph (last 365 days) | `githubUsername` in Identity & Photo tab | Falls back gracefully when offline/unset |
| Achievement medallions | Achievement `category` (hackathon → Trophy, award → Medal, academic → GraduationCap, competition → Zap) | Click any medallion to expand its dossier |
| Command Palette (Ctrl+K / ⌘K) | Static navigation map | Press `Esc` or Ctrl+K to toggle |
| Scroll progress beam, film grain, holo passport seal | Global chrome | Always on; reduced-motion visitors are respected |

---

## 1. Updating Your Portfolio via the Built-in Admin Studio (Recommended)

1. Click the **Studio** button in the top navigation bar (or press `Ctrl+K` / `⌘K` and select **Open Portfolio Admin Studio**).
2. Enter your Admin Studio Passkey (Default: `signature-2026`, or your custom `ADMIN_PASSKEY` environment variable).
3. Select the category tab you wish to update:

### A. Replacing Your Passport Photograph & Personal Details
- Go to **Identity & Photo**.
- Click **Choose Passport Photo File** to upload your passport-size photograph directly from your computer, or paste an image URL.
- Choose between three architectural framing modes: **Editorial Rounded Frame**, **Circular Optical Lens**, or **Futuristic Chamfered Frame**.
- Edit your Full Name, Headline, Academic Status, Email, GitHub URL, GitHub Username (for live repo telemetry), LinkedIn URL, and Availability status, then click **Save Profile Changes**.

### B. Updating Semester CGPA & Academic Marks
- Go to **Education & CGPA**.
- In the **Instant Semester Telemetry Update** box at the top, type your new semester (e.g., `Semester 6`) and your updated CGPA (e.g., `8.94 / 10.0`), and click **Update CGPA Now**.
- You can also add or edit full academic records including Class 10 and Class 12 marks and academic highlights.

### C. Adding or Editing Engineering Projects
- Go to **Projects**.
- Fill in the project name, category, status (`Completed`, `Prototype`, or `In Progress`), development date, short description, problem statement, proposed architectural solution, comma-separated tech stack, line-separated key features, GitHub repository URL, and live demo URL.
- Upload a project screenshot or provide an image URL.
- Click **Publish New Project**. Your new project automatically appears in the 3D tilt grid, category filters, search index, and interactive case-study modal.

### D. Adding Technical Skills & Categories
- Go to **Skills**.
- Enter the technology name, category (e.g., `Programming Languages`, `AI and Machine Learning`, or any new custom category), context tag, and practical description.

### E. Adding Internships, Certificates, Achievements & Research Papers
- Use the **Experience**, **Certificates**, **Achievements**, **Research**, and **Learning & Clubs** tabs to add, edit, or delete individual records.
- In the **Research** tab, always select the accurate manuscript status (`Draft`, `Submitted`, `Under Review`, `Accepted`, or `Published`).

---

## 2. Updating via the Centralized Seed File (`src/lib/default-portfolio-data.ts`)

If you prefer managing your content in code/Git:
1. Open `src/lib/default-portfolio-data.ts`.
2. Edit any array (`education`, `skills`, `experiences`, `projects`, `certifications`, `achievements`, `publications`, `beyondAcademics`, `currentFocus`) or the `profile` object.
3. All UI components automatically render whatever records exist in the data store.

---

## 3. Deployment Instructions

1. **Push to GitHub**: Push this repository to your GitHub account.
2. **Database Setup**: Create a free PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com) and copy the `DATABASE_URL` connection string.
3. **Environment Variables**:
   - `DATABASE_URL=postgresql://...`
   - `ADMIN_PASSKEY=your-chosen-secret-passkey`
4. **Deploy to Vercel / Railway / Render**:
   - Connect your GitHub repository.
   - On first request, the portfolio automatically initializes all PostgreSQL tables and seeds your starter data.
