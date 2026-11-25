import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim();

  if (!username) {
    return NextResponse.json({
      configured: false,
      message: "Connect your GitHub username in the Admin Studio to stream live repository telemetry.",
    });
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 300 },
      }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=4`,
        {
          headers: { Accept: "application/vnd.github.v3+json" },
          next: { revalidate: 300 },
        }
      ),
    ]);

    if (!userRes.ok) {
      return NextResponse.json({
        configured: false,
        error: `GitHub user '${username}' not found or rate-limited.`,
      });
    }

    const userData = await userRes.json();
    const reposData = reposRes.ok ? await reposRes.json() : [];

    return NextResponse.json({
      configured: true,
      profile: {
        login: userData.login,
        name: userData.name,
        avatarUrl: userData.avatar_url,
        htmlUrl: userData.html_url,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        bio: userData.bio,
      },
      repos: Array.isArray(reposData)
        ? reposData.map((r: Record<string, unknown>) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            htmlUrl: r.html_url,
            language: r.language,
            stargazersCount: r.stargazers_count,
            forksCount: r.forks_count,
            updatedAt: r.updated_at,
          }))
        : [],
    });
  } catch (error) {
    console.error("GitHub API proxy error:", error);
    return NextResponse.json({
      configured: false,
      error: "Could not reach GitHub API.",
    });
  }
}
