# Saved Knowledge

A searchable personal library built from 207 saved LinkedIn posts. The site
organizes posts by topic and author, generates concise excerpts, and keeps a
direct link to every original post.

## Features

- Full-text search across authors, titles, excerpts, sources, and topics
- Topic and author filters
- Responsive card layout for desktop and mobile
- Expandable source excerpts and direct LinkedIn links
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

Summaries are generated from text visible in LinkedIn's saved-post list. Some
long posts are truncated by LinkedIn; the original post link remains the source
of truth. Content copyright belongs to the original authors.
