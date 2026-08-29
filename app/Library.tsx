"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { githubStarsMeta } from "./data/github-stars-meta";
import { savedPosts, type SavedPost } from "./data/posts";
import { xPosts } from "./data/x-posts";

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
      /genom|genetic|gene |bioinform|protein|single.?cell|sequenc|omics|crispr|rna|dna|biotech|molecular|epigen|variant|cell biology|基因|蛋白|单细胞|测序|生物信息|转录组/i,
  },
  {
    name: "AI 与机器学习",
    short: "AI & ML",
    pattern:
      /\bai\b|artificial intelligence|machine learning|deep learning|neural|\bllm\b|language model|agentic|agent |chatgpt|claude|gemini|prompt|transformer|人工智能|机器学习|深度学习|大模型|智能体|提示词/i,
  },
  {
    name: "科研方法与学术写作",
    short: "Research",
    pattern:
      /research|paper|manuscript|thesis|phd|literature review|academic|reproducib|citation|journal|peer review|experiment|scientific writing|publication|科研|论文|学术|博士|文献|实验|发表/i,
  },
  {
    name: "数据科学与统计",
    short: "Data",
    pattern:
      /data science|statistic|bayes|causal|visuali[sz]ation|analytics|dataset|regression|probability|quantitative|data analysis|数据科学|统计|因果|可视化|回归|概率/i,
  },
  {
    name: "软件工程与开发工具",
    short: "Engineering",
    pattern:
      /software|developer|programming|python|javascript|typescript|github|\bcode\b|coding|api|cloud|docker|database|open source|command line|workflow|automation|软件|开发|编程|代码|开源|自动化|工作流|数据库/i,
  },
  {
    name: "生命科学与健康",
    short: "Life Science",
    pattern:
      /biology|medical|medicine|clinical|health|drug|disease|neuro|brain|laboratory|lab |cancer|patient|therapeutic|生物|医学|临床|健康|疾病|癌症|药物|神经/i,
  },
  {
    name: "职业发展与领导力",
    short: "Career",
    pattern:
      /career|leadership|management|manager|hiring|interview|job |workplace|team |founder|startup|business|networking|职业|领导力|管理|招聘|面试|创业|商业|求职/i,
  },
  {
    name: "学习、写作与效率",
    short: "Learning",
    pattern:
      /learning|productivity|writing|book|reading|note.?taking|knowledge|habit|focus|education|student|course|teach|communication|学习|写作|阅读|笔记|知识|习惯|课程|教育|效率|英语/i,
  },
  {
    name: "社会观察与生活方式",
    short: "Life & Society",
    pattern:
      /society|culture|travel|relationship|family|fitness|sport|sleep|finance|invest|crypto|社会|文化|旅行|关系|家庭|装修|美食|健身|运动|睡眠|理财|投资/i,
  },
];

const fallbackTopic = "其他灵感";
const linkedInPosts: SavedPost[] = savedPosts.map((post) => ({
  ...post,
  platform: "LinkedIn",
}));
const socialPosts: SavedPost[] = [...xPosts, ...linkedInPosts];
const totalLibraryCount = socialPosts.length + githubStarsMeta.count;
const activityOptions = ["活跃", "近期维护", "低频维护", "已归档"] as const;

const breaststrokeLessons = [
  {
    title: "基本游泳动作",
    duration: "2:47",
    file: "videos/breaststroke/01-basic-movements.mp4",
  },
  {
    title: "如何改善手臂划水动作",
    duration: "1:51",
    file: "videos/breaststroke/02-arm-stroke.mp4",
  },
  {
    title: "如何改善腿部蹬水动作",
    duration: "2:23",
    file: "videos/breaststroke/03-leg-kick.mp4",
  },
  {
    title: "手臂和腿部的协调运动",
    duration: "1:49",
    file: "videos/breaststroke/04-arm-leg-coordination.mp4",
  },
  {
    title: "改善肩部和头部的入水动作",
    duration: "2:01",
    file: "videos/breaststroke/05-shoulder-head-entry.mp4",
  },
  {
    title: "转身",
    duration: "2:10",
    file: "videos/breaststroke/06-turn.mp4",
  },
  {
    title: "手臂划水动作练习 1",
    duration: "1:35",
    file: "videos/breaststroke/07-arm-drill-1.mp4",
  },
  {
    title: "腿部动作",
    duration: "1:58",
    file: "videos/breaststroke/08-leg-movements.mp4",
  },
  {
    title: "手臂划水动作练习 2",
    duration: "1:26",
    file: "videos/breaststroke/09-arm-drill-2.mp4",
  },
] as const;

type SortMode = "saved" | "author" | "stars" | "activity";

function topicFor(post: SavedPost) {
  const haystack = [
    post.title,
    post.text,
    post.source,
    post.language,
    post.topics?.join(" "),
  ].join(" ");
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
  if (post.platform === "GitHub" && !post.text) {
    const topicText = post.topics?.slice(0, 3).join("、");
    return `${post.author} 维护的 ${post.language ?? "开源"} 项目${
      topicText ? `，主要涉及 ${topicText}` : ""
    }。当前获得 ${(post.stars ?? 0).toLocaleString("zh-CN")} 个 Star。`;
  }
  if (!source)
    return `查看 ${post.author} 分享的 ${post.platform ?? "LinkedIn"} 原帖。`;
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
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(parsed);
    }
  }
  const first = value.trim().split(/\s+/)[0];
  return first || "已保存";
}

export default function Library() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedSecond = useRef(0);
  const [githubStars, setGithubStars] = useState<SavedPost[]>([]);
  const [githubStatus, setGithubStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("全部主题");
  const [selectedAuthor, setSelectedAuthor] = useState("全部作者");
  const [selectedPlatform, setSelectedPlatform] = useState("全部来源");
  const [selectedLanguage, setSelectedLanguage] = useState("全部语言");
  const [selectedActivity, setSelectedActivity] = useState("全部活跃度");
  const [sort, setSort] = useState<SortMode>("saved");
  const [visible, setVisible] = useState(24);
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("data/github-stars.json")
      .then((response) => {
        if (!response.ok) throw new Error(`GitHub index: ${response.status}`);
        return response.json() as Promise<SavedPost[]>;
      })
      .then((repositories) => {
        if (cancelled) return;
        setGithubStars(repositories);
        setGithubStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setGithubStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const savedLesson = Number(localStorage.getItem("breaststroke-current") ?? 0);
    let savedCompleted: number[] = [];

    try {
      const parsedCompleted = JSON.parse(
        localStorage.getItem("breaststroke-completed") ?? "[]",
      );
      if (Array.isArray(parsedCompleted)) savedCompleted = parsedCompleted;
    } catch {
      // Ignore malformed progress saved by an older browser session.
    }

    queueMicrotask(() => {
      if (Number.isInteger(savedLesson) && breaststrokeLessons[savedLesson]) {
        setSelectedLesson(savedLesson);
      }
      setCompletedLessons(savedCompleted);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("breaststroke-current", String(selectedLesson));
    lastSavedSecond.current = 0;
  }, [selectedLesson]);

  const currentLesson = breaststrokeLessons[selectedLesson];

  const finishLesson = () => {
    setCompletedLessons((lessons) => {
      const next = lessons.includes(selectedLesson)
        ? lessons
        : [...lessons, selectedLesson].sort((a, b) => a - b);
      localStorage.setItem("breaststroke-completed", JSON.stringify(next));
      return next;
    });
    localStorage.removeItem(`breaststroke-time-${selectedLesson}`);
    if (selectedLesson < breaststrokeLessons.length - 1) {
      setSelectedLesson((lesson) => lesson + 1);
    }
  };

  const enriched = useMemo(
    () =>
      [...githubStars, ...socialPosts].map((post) => ({
        ...post,
        topic: topicFor(post),
      })),
    [githubStars],
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

  const languages = useMemo(
    () =>
      [...new Set(githubStars.map((repository) => repository.language ?? "未标注"))]
        .sort((a, b) => a.localeCompare(b)),
    [githubStars],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const results = enriched.filter((post) => {
      const matchesQuery =
        !normalized ||
        [
          post.author,
          post.title,
          post.text,
          post.source,
          post.topic,
          post.language,
          post.topics?.join(" "),
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalized);
      const matchesTopic =
        selectedTopic === "全部主题" || post.topic === selectedTopic;
      const matchesAuthor =
        selectedAuthor === "全部作者" || post.author === selectedAuthor;
      const matchesPlatform =
        selectedPlatform === "全部来源" ||
        (post.platform ?? "LinkedIn") === selectedPlatform;
      const matchesLanguage =
        selectedLanguage === "全部语言" || post.language === selectedLanguage;
      const matchesActivity =
        selectedActivity === "全部活跃度" ||
        post.activity === selectedActivity;
      return (
        matchesQuery &&
        matchesTopic &&
        matchesAuthor &&
        matchesPlatform &&
        matchesLanguage &&
        matchesActivity
      );
    });
    if (sort === "author") {
      return [...results].sort((a, b) => a.author.localeCompare(b.author));
    }
    if (sort === "stars") {
      return [...results].sort((a, b) => (b.stars ?? -1) - (a.stars ?? -1));
    }
    if (sort === "activity") {
      return [...results].sort((a, b) =>
        (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""),
      );
    }
    return results;
  }, [
    enriched,
    query,
    selectedActivity,
    selectedAuthor,
    selectedLanguage,
    selectedPlatform,
    selectedTopic,
    sort,
  ]);

  const allTopicNames = [
    ...topics.map((topic) => topic.name),
    fallbackTopic,
  ].filter((topic) => topicCounts.has(topic));

  const resetFilters = () => {
    setQuery("");
    setSelectedTopic("全部主题");
    setSelectedAuthor("全部作者");
    setSelectedPlatform("全部来源");
    setSelectedLanguage("全部语言");
    setSelectedActivity("全部活跃度");
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
          <div className="top-links">
            <a className="top-link" href="#breaststroke">
              学蛙泳 <span aria-hidden="true">▶</span>
            </a>
            <a className="top-link" href="#library">
              浏览知识库 <span aria-hidden="true">↓</span>
            </a>
          </div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">LINKEDIN + X + GITHUB LIBRARY · 2026</p>
            <h1>
              把收藏变成
              <br />
              <em>随时可用的知识。</em>
            </h1>
            <p className="hero-intro">
              {totalLibraryCount.toLocaleString("zh-CN")} 条收藏，来自 LinkedIn、X
              与 GitHub，按主题、作者、语言和活跃度重新组织。搜索一个关键词，
              找回当时值得收藏的帖子、工具与开源项目。
            </p>
          </div>
          <div className="hero-stats" aria-label="知识库统计">
            <div className="stat stat-primary">
              <strong>{totalLibraryCount.toLocaleString("zh-CN")}</strong>
              <span>条收藏</span>
            </div>
            <div className="stat">
              <strong>{githubStarsMeta.count.toLocaleString("zh-CN")}</strong>
              <span>个 GitHub 项目</span>
            </div>
            <div className="stat">
              <strong>{authors.length}</strong>
              <span>位作者与 Owner</span>
            </div>
            <div className="stat">
              <strong>{allTopicNames.length}</strong>
              <span>个主题</span>
            </div>
            <p className="stat-note">
              GitHub {githubStarsMeta.count.toLocaleString("zh-CN")} 个 · X{" "}
              {xPosts.length.toLocaleString("zh-CN")} 篇 · LinkedIn{" "}
              {savedPosts.length.toLocaleString("zh-CN")} 篇。GitHub 摘要来自仓库
              描述，活跃度依据最近推送时间计算。
              {githubStatus === "loading" && " GitHub 索引正在载入…"}
              {githubStatus === "error" && " GitHub 索引暂时载入失败。"}
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

      <section className="course-shell" id="breaststroke">
        <header className="course-header">
          <div>
            <p className="section-kicker">SWIM COURSE · 9 LESSONS</p>
            <h2>从零开始学蛙泳</h2>
          </div>
          <p>
            中文讲解 · 共 18 分钟
            <br />
            视频已存入本站，无需打开 YouTube
          </p>
        </header>

        <div className="course-layout">
          <div className="course-player">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              key={currentLesson.file}
              ref={videoRef}
              controls
              playsInline
              preload="metadata"
              onLoadedMetadata={(event) => {
                const savedTime = Number(
                  localStorage.getItem(`breaststroke-time-${selectedLesson}`) ??
                    0,
                );
                if (savedTime > 0 && savedTime < event.currentTarget.duration - 5) {
                  event.currentTarget.currentTime = savedTime;
                }
              }}
              onTimeUpdate={(event) => {
                const second = Math.floor(event.currentTarget.currentTime);
                if (second - lastSavedSecond.current >= 5) {
                  localStorage.setItem(
                    `breaststroke-time-${selectedLesson}`,
                    String(second),
                  );
                  lastSavedSecond.current = second;
                }
              }}
              onEnded={finishLesson}
            >
              <source src={currentLesson.file} type="video/mp4" />
              你的浏览器暂不支持 HTML5 视频播放。
            </video>
            <div className="now-playing">
              <span>{String(selectedLesson + 1).padStart(2, "0")}</span>
              <div>
                <p>正在学习</p>
                <h3>{currentLesson.title}</h3>
              </div>
              <b>{currentLesson.duration}</b>
            </div>
          </div>

          <aside className="lesson-list" aria-label="蛙泳课程目录">
            <p>按顺序学习</p>
            {breaststrokeLessons.map((lesson, index) => (
              <button
                key={lesson.file}
                className={selectedLesson === index ? "active" : ""}
                onClick={() => setSelectedLesson(index)}
              >
                <span className="lesson-number">
                  {completedLessons.includes(index)
                    ? "✓"
                    : String(index + 1).padStart(2, "0")}
                </span>
                <span className="lesson-title">{lesson.title}</span>
                <span className="lesson-duration">{lesson.duration}</span>
              </button>
            ))}
          </aside>
        </div>

        <footer className="course-credit">
          <p>
            课程来源：Sikana 公益教育项目，与迪卡侬及游泳教练
            奥德利亚·布耶、皮耶里克·勒弗洛赫合作拍摄。
          </p>
          <a
            href="https://www.youtube.com/watch?v=FbGeBzFGsNA"
            target="_blank"
            rel="noreferrer"
          >
            查看原始课程 ↗
          </a>
        </footer>
      </section>

      <section className="library-shell" id="library">
        <header className="library-header">
          <div>
            <p className="section-kicker">THE COLLECTION</p>
            <h2>知识库</h2>
          </div>
          <p>
            当前显示 <strong>{filtered.length.toLocaleString("zh-CN")}</strong> /{" "}
            {totalLibraryCount.toLocaleString("zh-CN")} 条
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
            <span>来源</span>
            <select
              value={selectedPlatform}
              onChange={(event) => {
                setSelectedPlatform(event.target.value);
                setVisible(24);
              }}
            >
              <option>全部来源</option>
              <option>X</option>
              <option>LinkedIn</option>
              <option>GitHub</option>
            </select>
          </label>
          <label>
            <span>语言</span>
            <select
              value={selectedLanguage}
              onChange={(event) => {
                setSelectedLanguage(event.target.value);
                setVisible(24);
              }}
            >
              <option>全部语言</option>
              {languages.map((language) => (
                <option key={language}>{language}</option>
              ))}
            </select>
          </label>
          <label>
            <span>活跃度</span>
            <select
              value={selectedActivity}
              onChange={(event) => {
                setSelectedActivity(event.target.value);
                setVisible(24);
              }}
            >
              <option>全部活跃度</option>
              {activityOptions.map((activity) => (
                <option key={activity}>{activity}</option>
              ))}
            </select>
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
                setSort(event.target.value as SortMode)
              }
            >
              <option value="saved">收藏顺序</option>
              <option value="author">作者 A–Z</option>
              <option value="stars">GitHub Star 数</option>
              <option value="activity">最近维护</option>
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
              <b>{totalLibraryCount.toLocaleString("zh-CN")}</b>
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
              selectedAuthor !== "全部作者" ||
              selectedPlatform !== "全部来源" ||
              selectedLanguage !== "全部语言" ||
              selectedActivity !== "全部活跃度") && (
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
                          <span
                            className={`platform-label platform-${(
                              post.platform ?? "LinkedIn"
                            ).toLocaleLowerCase()}`}
                          >
                            {post.platform ?? "LinkedIn"}
                          </span>
                          <span className="topic-label">{post.topic}</span>
                          {post.language && (
                            <span className="language-label">{post.language}</span>
                          )}
                          {post.activity && (
                            <span className="activity-label">{post.activity}</span>
                          )}
                          <span>{displayTime(post.time)}</span>
                        </div>
                        <h3>{titleFor(post)}</h3>
                        <p className="summary">{summary}</p>
                        {post.platform === "GitHub" && (
                          <p className="repo-metrics">
                            <span>★ {(post.stars ?? 0).toLocaleString("zh-CN")}</span>
                            <span>⑂ {(post.forks ?? 0).toLocaleString("zh-CN")}</span>
                            {post.pushedAt && (
                              <span>更新于 {displayTime(post.pushedAt)}</span>
                            )}
                          </p>
                        )}
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
                            {post.platform === "GitHub" ? "查看项目" : "查看原帖"}{" "}
                            <span aria-hidden="true">↗</span>
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
            一个把“稍后阅读”和“先 Star”
            <br />
            变成“随时可用”的私人索引。
          </p>
        </div>
        <p>
          内容版权归原作者所有
          <br />
          最后整理：2026 年 8 月 11 日
        </p>
      </footer>
    </main>
  );
}
