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
  assert.match(html, /207/);
  assert.match(html, /知识库/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("ships the complete post index without starter artifacts", async () => {
  const [posts, packageJson] = await Promise.all([
    readFile(new URL("../app/data/posts.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  const postCount = posts.match(/^  \{"author":/gm)?.length ?? 0;
  assert.equal(postCount, 207);
  assert.match(packageJson, /"name": "saved-knowledge-library"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL("../github-pages/index.html", import.meta.url));
  await access(new URL("../.github/workflows/pages.yml", import.meta.url));
  await access(templateRoot);
});
