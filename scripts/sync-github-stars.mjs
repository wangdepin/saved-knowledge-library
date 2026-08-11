import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(projectRoot, "public/data/github-stars.json");
const metaOutputPath = resolve(projectRoot, "app/data/github-stars-meta.ts");
const perPage = 100;
const now = new Date();

function githubApi(path) {
  const output = execFileSync(
    "gh",
    [
      "api",
      "-H",
      "Accept: application/vnd.github.star+json",
      path,
    ],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  return JSON.parse(output);
}

function activityFor(repository) {
  if (repository.archived) return "已归档";
  if (!repository.pushed_at) return "低频维护";

  const pushedAt = new Date(repository.pushed_at);
  const ageInDays = Math.max(0, (now.getTime() - pushedAt.getTime()) / 86_400_000);
  if (ageInDays <= 90) return "活跃";
  if (ageInDays <= 365) return "近期维护";
  return "低频维护";
}

const starred = [];

for (let page = 1; ; page += 1) {
  const batch = githubApi(`/user/starred?per_page=${perPage}&page=${page}`);
  starred.push(...batch);
  if (batch.length < perPage) break;
}

const privateCount = starred.filter((item) => item.repo.private).length;
const publicStars = starred
  .filter((item) => !item.repo.private)
  .map(({ starred_at: starredAt, repo }) => ({
    id: `github-${repo.id}`,
    author: repo.owner.login,
    handle: repo.owner.login,
    profileUrl: repo.owner.html_url,
    time: starredAt,
    text: repo.description ?? "",
    title: repo.full_name,
    source: [
      repo.language,
      repo.license?.spdx_id,
      ...(repo.topics ?? []).slice(0, 8),
    ]
      .filter(Boolean)
      .join(" · "),
    platform: "GitHub",
    url: repo.html_url,
    language: repo.language ?? "未标注",
    topics: repo.topics ?? [],
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    pushedAt: repo.pushed_at,
    activity: activityFor(repo),
    archived: repo.archived,
    homepage: repo.homepage || undefined,
  }));

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(publicStars)}\n`, "utf8");

const activityCounts = Object.fromEntries(
  ["活跃", "近期维护", "低频维护", "已归档"].map((label) => [
    label,
    publicStars.filter((repository) => repository.activity === label).length,
  ]),
);

const languageCounts = Object.entries(
  publicStars.reduce((counts, repository) => {
    counts[repository.language] = (counts[repository.language] ?? 0) + 1;
    return counts;
  }, {}),
)
  .map(([language, count]) => ({ language, count }))
  .sort((a, b) => b.count - a.count);

const meta = {
  count: publicStars.length,
  syncedAt: now.toISOString(),
  activityCounts,
  topLanguages: languageCounts.slice(0, 12),
};

writeFileSync(
  metaOutputPath,
  `export const githubStarsMeta = ${JSON.stringify(meta, null, 2)} as const;\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      authenticatedStarCount: starred.length,
      exportedPublicCount: publicStars.length,
      excludedPrivateCount: privateCount,
      activityCounts,
      outputPath,
      metaOutputPath,
    },
    null,
    2,
  ),
);
