
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  try {
    const resumePath = path.join(
      process.cwd(),
      "public",
      "resume",
      "Sree-Varsha-Resume.pdf"
    );

    const pdfBuffer = await readFile(resumePath);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="Sree-Varsha-Resume.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to download resume:", error);

    return NextResponse.json(
      { status: "error", message: "Resume PDF not found" },
      { status: 404 }
    );
  }
}
