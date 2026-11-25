import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for the GitHub contribution calendar.
 * Uses the free, key-less public API at github-contributions-api.jogruber.de.
 * Returns weeks of {count, level} cells so the client can render a genuine
 * contribution heatmap without exposing any secrets or scraping HTML.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim();

  if (!username || !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/.test(username)) {
    return NextResponse.json(
      { ok: false, error: "A valid GitHub username is required." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(
        username
      )}?y=last`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Contribution data unavailable right now." },
        { status: 502 }
      );
    }

    const json = (await res.json()) as {
      total?: Record<string, number>;
      contributions?: Array<{ date: string; count: number; level: number }>;
    };

    const days = Array.isArray(json.contributions) ? json.contributions : [];
    if (days.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No contribution history found." },
        { status: 404 }
      );
    }

    // Pad the front of the grid so the first column starts on a Sunday,
    // matching GitHub's own calendar layout.
    const first = days[0].date.split("-").map(Number);
    const firstUtc = new Date(Date.UTC(first[0], (first[1] || 1) - 1, first[2] || 1));
    const leadingBlanks = firstUtc.getUTCDay(); // 0 = Sunday

    const cells: Array<{ count: number; level: number } | null> = [
      ...Array.from({ length: leadingBlanks }, () => null),
      ...days.map((d) => ({
        count: Number(d.count) || 0,
        level: Math.min(4, Math.max(0, Number(d.level) || 0)),
      })),
    ];

    const weeks: Array<Array<{ count: number; level: number } | null>> = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    const totalLastYear =
      json.total && typeof json.total.lastYear === "number"
        ? json.total.lastYear
        : days.reduce((sum, d) => sum + (Number(d.count) || 0), 0);

    return NextResponse.json({ ok: true, totalLastYear, weeks });
  } catch (error) {
    console.error("GitHub contributions proxy error:", error);
    return NextResponse.json(
      { ok: false, error: "Could not reach the contributions service." },
      { status: 502 }
    );
  }
}
