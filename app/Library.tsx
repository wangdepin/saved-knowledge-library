"use client";

import { useMemo, useState } from "react";
import { savedPosts, type SavedPost } from "./data/posts";

type Topic = {
  name: string;
  short: string;
  pattern: RegExp;
};

const topics: Topic[] = [
  {
    name: "基因组学与生物技术",
    short: "Genomics",
    pattern:
      /genom|genetic|gene |bioinform|protein|single.?cell|sequenc|omics|crispr|rna|dna|biotech|molecular|epigen|variant|cell biology/i,
  },
  {
    name: "AI 与机器学习",
    short: "AI & ML",
    pattern:
      /\bai\b|artificial intelligence|machine learning|deep learning|neural|\bllm\b|language model|agentic|agent |chatgpt|claude|gemini|prompt|transformer/i,
  },
  {
    name: "科研方法与学术写作",
    short: "Research",
    pattern:
      /research|paper|manuscript|thesis|phd|literature review|academic|reproducib|citation|journal|peer review|experiment|scientific writing|publication/i,
  },
  {
    name: "数据科学与统计",
    short: "Data",
    pattern:
      /data science|statistic|bayes|causal|visuali[sz]ation|analytics|dataset|regression|probability|quantitative|data analysis/i,
  },
  {
    name: "软件工程与开发工具",
    short: "Engineering",
    pattern:
      /software|developer|programming|python|javascript|typescript|github|\bcode\b|coding|api|cloud|docker|database|open source|command line|workflow|automation/i,
  },
  {
    name: "生命科学与健康",
    short: "Life Science",
    pattern:
      /biology|medical|medicine|clinical|health|drug|disease|neuro|brain|laboratory|lab |cancer|patient|therapeutic/i,
  },
  {
    name: "职业发展与领导力",
    short: "Career",
    pattern:
      /career|leadership|management|manager|hiring|interview|job |workplace|team |founder|startup|business|networking/i,
  },
  {
    name: "学习、写作与效率",
    short: "Learning",
    pattern:
      /learning|productivity|writing|book|reading|note.?taking|knowledge|habit|focus|education|student|course|teach|communication/i,
  },
];

const fallbackTopic = "其他灵感";

function topicFor(post: SavedPost) {
  const haystack = [post.title, post.text, post.source].join(" ");
  return topics.find((topic) => topic.pattern.test(haystack))?.name ?? fallbackTopic;
}

function cleanText(value: string) {
  return value
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function summaryFor(post: SavedPost, limit = 260) {
  const source = cleanText(post.text || post.title || post.source);
  if (!source) return `查看 ${post.author} 分享的 LinkedIn 原帖。`;
  if (source.length <= limit) return source;
  const candidate = source.slice(0, limit);
  const boundary = Math.max(
    candidate.lastIndexOf(". "),
    candidate.lastIndexOf("。"),
    candidate.lastIndexOf("! "),
    candidate.lastIndexOf("? "),
  );
  return `${candidate.slice(0, boundary > limit * 0.55 ? boundary + 1 : limit).trim()}…`;
}

function titleFor(post: SavedPost) {
  if (post.title) return post.title;
  const summary = summaryFor(post, 112);
  return summary.length > 112 ? `${summary.slice(0, 109)}…` : summary;
}

function displayTime(value: string) {
  const first = value.trim().split(/\s+/)[0];
  return first || "已保存";
}

export default function Library() {
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("全部主题");
  const [selectedAuthor, setSelectedAuthor] = useState("全部作者");
  const [sort, setSort] = useState<"saved" | "author">("saved");
  const [visible, setVisible] = useState(24);

  const enriched = useMemo(
    () => savedPosts.map((post) => ({ ...post, topic: topicFor(post) })),
    [],
  );

  const authors = useMemo(
    () =>
      [...new Set(enriched.map((post) => post.author))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [enriched],
  );

  const topicCounts = useMemo(() => {
    const counts = new Map<string, number>();
    enriched.forEach((post) =>
      counts.set(post.topic, (counts.get(post.topic) ?? 0) + 1),
    );
    return counts;
  }, [enriched]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const results = enriched.filter((post) => {
      const matchesQuery =
        !normalized ||
        [post.author, post.title, post.text, post.source, post.topic]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalized);
      const matchesTopic =
        selectedTopic === "全部主题" || post.topic === selectedTopic;
      const matchesAuthor =
        selectedAuthor === "全部作者" || post.author === selectedAuthor;
      return matchesQuery && matchesTopic && matchesAuthor;
    });
    if (sort === "author") {
      return [...results].sort((a, b) => a.author.localeCompare(b.author));
    }
    return results;
  }, [enriched, query, selectedAuthor, selectedTopic, sort]);

  const allTopicNames = [
    ...topics.map((topic) => topic.name),
    fallbackTopic,
  ].filter((topic) => topicCounts.has(topic));

  const resetFilters = () => {
    setQuery("");
    setSelectedTopic("全部主题");
    setSelectedAuthor("全部作者");
    setVisible(24);
  };

  return (
    <main>
      <section className="hero">
        <nav className="topbar" aria-label="主导航">
          <a className="brand" href="#top" aria-label="Saved Knowledge 首页">
            <span className="brand-mark">SK</span>
            <span>Saved Knowledge</span>
          </a>
          <a className="top-link" href="#library">
            浏览知识库 <span aria-hidden="true">↓</span>
          </a>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">LINKEDIN SAVED LIBRARY · 2026</p>
            <h1>
              把收藏变成
              <br />
              <em>随时可用的知识。</em>
            </h1>
            <p className="hero-intro">
              207 篇已保存帖子，按主题与作者重新组织。搜索一个关键词，
              找回当时值得收藏的那个想法。
            </p>
          </div>
          <div className="hero-stats" aria-label="知识库统计">
            <div className="stat stat-primary">
              <strong>{savedPosts.length}</strong>
              <span>篇帖子</span>
            </div>
            <div className="stat">
              <strong>{authors.length}</strong>
              <span>位作者</span>
            </div>
            <div className="stat">
              <strong>{allTopicNames.length}</strong>
              <span>个主题</span>
            </div>
            <p className="stat-note">
              摘要来自 LinkedIn 当前可见正文。每篇卡片都保留原帖入口。
            </p>
          </div>
        </div>

        <div className="topic-ticker" aria-label="热门主题">
          {allTopicNames.slice(0, 7).map((topic, index) => (
            <button
              key={topic}
              onClick={() => {
                setSelectedTopic(topic);
                setVisible(24);
                document
                  .getElementById("library")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {topic}
              <b>{topicCounts.get(topic)}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="library-shell" id="library">
        <header className="library-header">
          <div>
            <p className="section-kicker">THE COLLECTION</p>
            <h2>知识库</h2>
          </div>
          <p>
            当前显示 <strong>{filtered.length}</strong> / {savedPosts.length} 篇
          </p>
        </header>

        <div className="search-panel">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">搜索标题、作者或正文</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisible(24);
              }}
              placeholder="搜索标题、作者、关键词…"
            />
          </label>
          <label>
            <span>作者</span>
            <select
              value={selectedAuthor}
              onChange={(event) => {
                setSelectedAuthor(event.target.value);
                setVisible(24);
              }}
            >
              <option>全部作者</option>
              {authors.map((author) => (
                <option key={author}>{author}</option>
              ))}
            </select>
          </label>
          <label>
            <span>排序</span>
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as "saved" | "author")
              }
            >
              <option value="saved">LinkedIn 顺序</option>
              <option value="author">作者 A–Z</option>
            </select>
          </label>
        </div>

        <div className="collection-layout">
          <aside className="filters" aria-label="主题筛选">
            <p>按主题浏览</p>
            <button
              className={selectedTopic === "全部主题" ? "active" : ""}
              onClick={() => {
                setSelectedTopic("全部主题");
                setVisible(24);
              }}
            >
              <span>全部主题</span>
              <b>{savedPosts.length}</b>
            </button>
            {allTopicNames.map((topic) => (
              <button
                key={topic}
                className={selectedTopic === topic ? "active" : ""}
                onClick={() => {
                  setSelectedTopic(topic);
                  setVisible(24);
                }}
              >
                <span>{topic}</span>
                <b>{topicCounts.get(topic)}</b>
              </button>
            ))}
            {(query ||
              selectedTopic !== "全部主题" ||
              selectedAuthor !== "全部作者") && (
              <button className="reset" onClick={resetFilters}>
                清除筛选
              </button>
            )}
          </aside>

          <div className="results">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <span>⌕</span>
                <h3>没有找到匹配内容</h3>
                <p>换一个关键词，或者清除当前筛选。</p>
                <button onClick={resetFilters}>查看全部帖子</button>
              </div>
            ) : (
              <>
                <div className="post-grid">
                  {filtered.slice(0, visible).map((post, index) => {
                    const summary = summaryFor(post);
                    return (
                      <article className="post-card" key={post.id}>
                        <div className="card-number">
                          {String(index + 1).padStart(3, "0")}
                        </div>
                        <div className="card-meta">
                          <span className="topic-label">{post.topic}</span>
                          <span>{displayTime(post.time)}</span>
                        </div>
                        <h3>{titleFor(post)}</h3>
                        <p className="summary">{summary}</p>
                        {post.text && cleanText(post.text) !== summary && (
                          <details>
                            <summary>展开正文摘录</summary>
                            <p>{cleanText(post.text)}</p>
                          </details>
                        )}
                        <footer>
                          <a
                            className="author"
                            href={post.profileUrl || post.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span aria-hidden="true">
                              {post.author.charAt(0).toUpperCase()}
                            </span>
                            <b>{post.author}</b>
                          </a>
                          <a
                            className="open-post"
                            href={post.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            查看原帖 <span aria-hidden="true">↗</span>
                          </a>
                        </footer>
                      </article>
                    );
                  })}
                </div>
                {visible < filtered.length && (
                  <button
                    className="load-more"
                    onClick={() => setVisible((count) => count + 24)}
                  >
                    加载更多
                    <span>
                      {Math.min(filtered.length - visible, 24)} 篇
                    </span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <span className="brand-mark">SK</span>
          <p>
            一个把“稍后阅读”
            <br />
            变成“随时可用”的私人索引。
          </p>
        </div>
        <p>
          内容版权归原作者所有
          <br />
          最后整理：2026 年 8 月 10 日
        </p>
      </footer>
    </main>
  );
}
