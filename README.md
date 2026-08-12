# Saved Knowledge

A searchable personal library built from 5,868 saved items: 217 LinkedIn posts,
2,385 X posts, and 3,266 public GitHub starred repositories. The site organizes
them by source, topic, author or owner, programming language, and activity, and
keeps a direct link to every original item.

## Features

- Full-text search across authors, titles, excerpts, sources, languages, and topics
- Source, topic, author, programming-language, and repository-activity filters
- GitHub repository summaries, star and fork counts, and last-push dates
- Responsive card layout for desktop and mobile
- Expandable source excerpts and direct links to LinkedIn, X, and GitHub
- Automatic GitHub Pages deployment from `main`

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Validate both supported builds:

```bash
npm run build
npm run build:pages
```

Refresh the GitHub Star export with the currently authenticated GitHub account:

```bash
npm run sync:github-stars
```

The sync writes public repository data to `public/data/github-stars.json` and
updates the lightweight count metadata used during server rendering. Private
repositories are excluded from the public export.

## Deployment

The GitHub Actions workflow in `.github/workflows/pages.yml` builds the static
site and publishes it to GitHub Pages after every push to `main`.

For a custom domain, add the domain in **Repository Settings → Pages**, then
configure the DNS records described in the official
[GitHub Pages custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

Verified students can redeem domain offers through the
[GitHub Student Developer Pack](https://education.github.com/pack), including
eligible domains from Namecheap, Name.com, and .TECH. Offer availability and
renewal pricing can change, so check the current terms before choosing a domain.

## Content note

Post summaries are generated from text visible in LinkedIn and X saved-post
lists. GitHub summaries use each repository description, topics, language, and
public activity metadata. The original post or repository remains the source of
truth. Content copyright belongs to the original authors and maintainers.
