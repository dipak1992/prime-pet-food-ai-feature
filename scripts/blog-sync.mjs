#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { loadEnv, requireEnv } from './lib/env.mjs';
import { parseFrontmatter } from './lib/frontmatter.mjs';
import { markdownToHtml } from './lib/markdown.mjs';
import { ShopifyAdmin, buildArticleInput } from './lib/shopify-admin.mjs';

loadEnv();

const args = parseArgs(process.argv.slice(2));
const cwd = process.cwd();
const contentDir = path.resolve(cwd, process.env.SHOPIFY_CONTENT_DIR || 'content/blogs');
const articles = loadArticles(contentDir);

const filtered = args.only
  ? articles.filter((article) => article.handle === args.only || article.filePath.includes(args.only))
  : articles;

if (!filtered.length) {
  throw new Error(args.only ? `No article matched --only ${args.only}` : `No articles found in ${contentDir}`);
}

if (args.check) {
  for (const article of filtered) {
    validateArticle(article);
    console.log(`ok ${article.blog}/${article.handle}`);
  }
  console.log(`Validated ${filtered.length} article(s).`);
  process.exit(0);
}

if (args.dryRun) {
  for (const article of filtered) {
    validateArticle(article);
    console.log(`[dry-run] ${article.blog}/${article.handle}`);
    console.log(`  title: ${article.title}`);
    console.log(`  published: ${article.published}`);
    console.log(`  tags: ${article.tags.join(', ') || '(none)'}`);
    console.log(`  html bytes: ${Buffer.byteLength(article.bodyHtml, 'utf8')}`);
  }
  console.log(`Dry run complete for ${filtered.length} article(s).`);
  process.exit(0);
}

const admin = new ShopifyAdmin({
  storeDomain: requireEnv('SHOPIFY_STORE_DOMAIN'),
  accessToken: requireEnv('SHOPIFY_ADMIN_ACCESS_TOKEN'),
  apiVersion: process.env.SHOPIFY_API_VERSION || '2026-04',
});

for (const article of filtered) {
  validateArticle(article);
  await syncArticle(admin, article, {
    createBlogs: args.createBlogs,
  });
}

async function syncArticle(admin, article, options) {
  let blog = await admin.findBlogByHandle(article.blog);
  if (!blog) {
    if (!options.createBlogs) {
      throw new Error(`${article.filePath}: blog "${article.blog}" does not exist. Re-run with --create-blogs.`);
    }
    blog = await admin.createBlog({
      title: article.blogTitle || titleFromHandle(article.blog),
      handle: article.blog,
      templateSuffix: article.blogTemplateSuffix,
      commentPolicy: article.blogCommentPolicy || 'MODERATED',
    });
    console.log(`created blog ${blog.handle}`);
  }

  const input = buildArticleInput(article, blog.id);
  const existing = await admin.findArticleByHandle({ blogHandle: blog.handle, handle: article.handle });

  if (existing) {
    const updated = await admin.updateArticle(existing.id, input);
    console.log(`updated ${updated.blog.handle}/${updated.handle}`);
  } else {
    const created = await admin.createArticle(input);
    console.log(`created ${created.blog.handle}/${created.handle}`);
  }
}

function loadArticles(dir) {
  const files = walk(dir).filter((file) => file.endsWith('.md'));
  return files.map((filePath) => {
    const source = fs.readFileSync(filePath, 'utf8');
    const { data, body } = parseFrontmatter(source, path.relative(process.cwd(), filePath));
    const summarySource = data.summary || data.excerpt || '';

    return {
      filePath: path.relative(process.cwd(), filePath),
      blog: requiredString(data.blog, 'blog', filePath),
      blogTitle: data.blog_title,
      blogTemplateSuffix: normalizeTemplateSuffix(data.blog_template_suffix),
      blogCommentPolicy: data.blog_comment_policy,
      title: requiredString(data.title, 'title', filePath),
      handle: data.handle || slugify(data.title),
      author: data.author || 'Prime Pet Food',
      tags: normalizeTags(data.tags),
      published: Boolean(data.published),
      publishDate: data.publish_date || data.publishDate,
      templateSuffix: normalizeTemplateSuffix(data.template_suffix),
      imageUrl: data.image,
      imageAlt: data.image_alt,
      summaryHtml: summarySource ? markdownToHtml(summarySource) : '',
      bodyHtml: markdownToHtml(body),
    };
  });
}

function validateArticle(article) {
  const errors = [];
  if (!article.blog) errors.push('blog is required');
  if (!article.title) errors.push('title is required');
  if (!article.handle) errors.push('handle is required');
  if (!article.bodyHtml || article.bodyHtml.length < 400) errors.push('body is too short for SEO-safe publishing');
  if (article.published && article.bodyHtml.length < 1200) {
    errors.push('published articles should be at least 1200 HTML characters to avoid thin content');
  }
  if (article.publishDate && Number.isNaN(Date.parse(article.publishDate))) {
    errors.push('publish_date must be an ISO-compatible date');
  }
  if (errors.length) throw new Error(`${article.filePath}: ${errors.join('; ')}`);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function parseArgs(argv) {
  const result = {
    check: false,
    dryRun: false,
    only: '',
    createBlogs: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') result.check = true;
    else if (arg === '--dry-run') result.dryRun = true;
    else if (arg === '--no-create-blogs') result.createBlogs = false;
    else if (arg === '--create-blogs') result.createBlogs = true;
    else if (arg === '--only') result.only = argv[++index] || '';
    else if (arg.startsWith('--only=')) result.only = arg.slice('--only='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return result;
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean);
  return String(tags)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeTemplateSuffix(value) {
  if (value === undefined || value === null) return undefined;
  return value;
}

function requiredString(value, key, filePath) {
  if (!value || typeof value !== 'string') {
    throw new Error(`${path.relative(process.cwd(), filePath)}: ${key} is required`);
  }
  return value;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleFromHandle(handle) {
  return handle
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

