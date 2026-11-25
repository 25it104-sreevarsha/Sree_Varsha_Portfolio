# Portfolio asset folders — image naming guide

The visual design and component files are intentionally unchanged. Add your own images inside `public/` and use the exact public URL path shown below in the Admin Studio or in `src/lib/default-portfolio-data.ts`.

## Profile photo

- Folder: `public/images/profile/`
- Recommended filename: `profile-photo.jpg`
- Website path: `/images/profile/profile-photo.jpg`
- Use a clear, well-lit portrait. Keep the original passport placeholder until you have added the photo and updated the profile's `photoUrl`.

## Certificates

- Image folder: `public/images/certificates/`
- PDF folder: `public/files/certificates/`
- Example image filename: `nptel-software-project-management.png`
- Website image path: `/images/certificates/nptel-software-project-management.png`
- Use `.jpg`, `.jpeg`, or `.png` for certificate previews. Keep PDF originals in `public/files/certificates/` and link them through the relevant verification/document URL when needed.
- Do not use generic names such as `certificate1.png`; use a readable issuer-or-course name.

## Project images

Use a separate folder for each project:

| Project | Folder | Suggested cover filename |
| --- | --- | --- |
| Jeny — AI Interviewer | `public/images/projects/jeny-ai-interviewer/` | `cover.jpg` |
| Smart Irrigation System | `public/images/projects/smart-irrigation/` | `cover.jpg` |
| Voice-cloning Impersonation Detection | `public/images/projects/voice-cloning-detection/` | `cover.jpg` |
| CoachTime | `public/images/projects/cochtime/` | `cover.jpg` |

Suggested screenshot names: `01-overview.jpg`, `02-dashboard.jpg`, `03-workflow.jpg`. Put screenshots in the same project folder. After adding an image, update that project's `thumbnailUrl` and `screenshots` values to the matching paths, for example `/images/projects/cochtime/cover.jpg`.

Until you add real project images, the site uses `public/images/project-placeholder.svg`.

## Other section images

- Education: `public/images/education/`
- Experience / internships: `public/images/experience/`
- Achievements / hackathons: `public/images/achievements/`
- Research / publications: `public/images/publications/`
- Clubs / activities: `public/images/activities/`
- Resume PDF: `public/files/resume/`

Use descriptive filenames, lowercase letters, and hyphens. Avoid spaces, Tamil characters, and special symbols in filenames.

## Important path rule

Files placed in `public/images/profile/profile-photo.jpg` are served by the website at `/images/profile/profile-photo.jpg` — do not include the word `public` in the website URL. Example: `public/images/certificates/example.png` becomes `/images/certificates/example.png`.

Empty folders are preserved in Git using `.gitkeep`. You can delete `.gitkeep` from a folder after adding your own files.
