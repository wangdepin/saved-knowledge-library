import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the saved-post library", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Saved Knowledge/);
  assert.match(html, /6,025/);
  assert.match(html, /知识库/);
  assert.match(html, /GitHub/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("ships the complete saved-content indexes without private repositories", async () => {
  const [posts, xPosts, githubStarsJson, githubMeta, packageJson] = await Promise.all([
    readFile(new URL("../app/data/posts.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/x-posts.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/data/github-stars.json", import.meta.url), "utf8"),
    readFile(new URL("../app/data/github-stars-meta.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  const linkedInCount = posts.match(/\{"author"\s*:/g)?.length ?? 0;
  const xCount = xPosts.match(/"id"\s*:\s*"x-/g)?.length ?? 0;
  const githubStars = JSON.parse(githubStarsJson);
  assert.equal(linkedInCount, 253);
  assert.equal(xCount, 2484);
  assert.equal(githubStars.length, 3288);
  assert.equal(linkedInCount + xCount + githubStars.length, 6025);
  assert.ok(githubStars.every((repository) => repository.platform === "GitHub"));
  assert.ok(githubStars.every((repository) => repository.url.startsWith("https://github.com/")));
  assert.ok(githubStars.every((repository) => repository.language && repository.activity));
  assert.ok(githubStars.every((repository) => !("private" in repository)));
  assert.match(githubMeta, /["']?count["']?: 3288/);
  assert.match(packageJson, /"name": "saved-knowledge-library"/);
  assert.match(packageJson, /"sync:github-stars"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL("../github-pages/index.html", import.meta.url));
  await access(new URL("../.github/workflows/pages.yml", import.meta.url));
  await access(templateRoot);
});
