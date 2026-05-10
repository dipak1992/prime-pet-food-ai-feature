# Shopify Blog Content Sync

This repo now has a code-managed content layer for Shopify Admin blogs and articles.

## What It Does

- Reads Markdown files from `content/blogs`.
- Parses frontmatter for Shopify article metadata.
- Converts Markdown to Shopify article HTML.
- Finds or creates the target Shopify blog by handle.
- Finds articles by handle and updates them, or creates them when missing.
- Supports safe validation and dry runs before publishing.

The implementation uses Shopify GraphQL Admin API. Shopify's current docs list `articleCreate`, `articleUpdate`, and `blogCreate` under GraphQL Admin, while REST Admin is legacy for new public apps.

Required Shopify custom app scopes:

- `read_content`
- `write_content`

Shopify also accepts `read_online_store_pages` / `write_online_store_pages` for these mutations in current GraphQL docs.

## Setup

Create `.env.local`:

```env
SHOPIFY_STORE_DOMAIN=theprimepetfood.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_replace_me
SHOPIFY_API_VERSION=2026-04
SHOPIFY_CONTENT_DIR=content/blogs
```

Do not commit `.env.local`.

## Commands

Validate local article files:

```bash
npm run blog:check
```

Preview what would sync:

```bash
npm run blog:dry-run
```

Publish or update all articles:

```bash
npm run blog:push
```

Publish or update one article:

```bash
node scripts/blog-sync.mjs --only how-long-do-yak-chews-last
```

Disable automatic blog creation:

```bash
node scripts/blog-sync.mjs --no-create-blogs
```

## Article Format

```md
---
blog: dog-behavior
blog_title: Dog Behavior
title: How Long Do Yak Chews Last?
handle: how-long-do-yak-chews-last
author: Prime Pet Food
tags:
  - yak chews
  - chew duration
summary: Short article summary.
published: false
template_suffix: ""
---

# Article H1

Article body in Markdown.
```

Use `published: false` while drafting. Set `published: true` only after the article is final and SEO-safe.

Optional fields:

- `publish_date`: ISO date string for scheduled publishing.
- `image`: public image URL Shopify can fetch.
- `image_alt`: image alt text.
- `blog_template_suffix`: alternate blog template suffix.
- `blog_comment_policy`: `MODERATED`, `CLOSED`, or another Shopify-supported enum value.

## Publishing Workflow

1. Write or edit Markdown in `content/blogs/<blog-handle>/<article-handle>.md`.
2. Run `npm run blog:check`.
3. Run `npm run blog:dry-run`.
4. Set `published: true` when ready.
5. Run `npm run blog:push`.
6. Review the live Shopify article.

## Notes

The sync script intentionally does not delete Shopify articles. Deleting content should stay manual until there is a reviewed deletion workflow.

The Markdown converter supports headings, paragraphs, ordered and unordered lists, blockquotes, links, images, inline bold/italic/code, and fenced code blocks. Raw one-line HTML is passed through.
