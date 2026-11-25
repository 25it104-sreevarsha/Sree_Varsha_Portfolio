import { NextResponse } from "next/server";
import { getFullPortfolioData } from "@/lib/portfolio-service";

function escapePdfText(input: string): string {
  return input
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildDynamicResumePdf(lines: string[]): Buffer {
  const textCommands: string[] = [
    "BT",
    "/F1 16 Tf",
    "50 755 Td",
    "18 TL",
  ];

  lines.slice(0, 38).forEach((line, index) => {
    if (index === 0) {
      textCommands.push(`(${escapePdfText(line)}) Tj`);
      textCommands.push("/F1 10 Tf");
      textCommands.push("15 TL");
    } else {
      textCommands.push(`T* (${escapePdfText(line)}) Tj`);
    }
  });

  textCommands.push("ET");
  const streamContent = textCommands.join("\n");

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n"
  );
  objects.push(
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
  );
  objects.push(
    `5 0 obj\n<< /Length ${Buffer.byteLength(streamContent, "utf8")} >>\nstream\n${streamContent}\nendstream\nendobj\n`
  );

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    const offsetStr = String(offsets[i]).padStart(10, "0");
    pdf += `${offsetStr} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

export async function GET() {
  try {
    const data = await getFullPortfolioData();
    const { profile, education, skills, projects, certifications } = data;

    const lines: string[] = [
      profile.fullName,
      profile.headline,
      `Email: ${profile.email} | Location: ${profile.location || "N/A"}`,
      `GitHub: ${profile.githubUrl} | LinkedIn: ${profile.linkedinUrl}`,
      "--------------------------------------------------------------------------------",
      "ACADEMIC PROFILE",
      ...education.flatMap((e) => [
        `${e.degree} - ${e.department} | ${e.institutionName} (${e.duration})`,
        `Semester: ${e.currentSemester} | CGPA: ${e.cgpa} | XII: ${e.class12Marks} | X: ${e.class10Marks}`,
      ]),
      "--------------------------------------------------------------------------------",
      "TECHNICAL SKILLS",
      skills.map((s) => s.name).join(", ").slice(0, 95),
      skills.map((s) => s.name).join(", ").slice(95, 190),
      "--------------------------------------------------------------------------------",
      "FEATURED ENGINEERING PROJECTS",
      ...projects.slice(0, 4).flatMap((p) => [
        `* ${p.name} [${p.status}] (${p.category})`,
        `  Stack: ${p.techStack.join(", ")}`,
        `  Summary: ${p.shortDescription.slice(0, 88)}`,
      ]),
      "--------------------------------------------------------------------------------",
      "CERTIFICATIONS & CREDENTIALS",
      ...certifications.slice(0, 4).map(
        (c) => `* ${c.title} - ${c.issuingOrganization} (${c.completionDate})`
      ),
      "--------------------------------------------------------------------------------",
      "Generated dynamically by THE DIGITAL SIGNATURE Portfolio Engine.",
      "Replace with a custom PDF anytime via the Portfolio Admin Studio.",
    ].filter(Boolean);

    const pdfBuffer = buildDynamicResumePdf(lines);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="Developer-Portfolio-Resume.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to generate resume PDF:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to generate resume PDF" },
      { status: 500 }
    );
  }
}
