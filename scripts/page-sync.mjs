#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { loadEnv, requireEnv } from './lib/env.mjs';
import { ShopifyAdmin, buildPageInput } from './lib/shopify-admin.mjs';

loadEnv();

const args = parseArgs(process.argv.slice(2));
const pagesFile = path.resolve(process.cwd(), process.env.SHOPIFY_PAGES_FILE || 'content/pages/seo-pages.json');
const pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
const filtered = args.only
  ? pages.filter((page) => page.handle === args.only || page.title.toLowerCase().includes(args.only.toLowerCase()))
  : pages;

if (!filtered.length) {
  throw new Error(args.only ? `No page matched --only ${args.only}` : `No pages found in ${pagesFile}`);
}

if (args.check || args.dryRun) {
  for (const page of filtered) {
    validatePage(page);
    const prefix = args.dryRun ? '[dry-run]' : 'ok';
    console.log(`${prefix} ${page.handle} -> template page.${page.templateSuffix || ''}`);
    if (args.dryRun) {
      console.log(`  title: ${page.title}`);
      console.log(`  published: ${page.published}`);
      console.log(`  body bytes: ${Buffer.byteLength(page.body || '', 'utf8')}`);
    }
  }
  console.log(`${args.dryRun ? 'Dry run complete' : 'Validated'} for ${filtered.length} page(s).`);
  process.exit(0);
}

const admin = new ShopifyAdmin({
  storeDomain: requireEnv('SHOPIFY_STORE_DOMAIN'),
  accessToken: requireEnv('SHOPIFY_ADMIN_ACCESS_TOKEN'),
  apiVersion: process.env.SHOPIFY_API_VERSION || '2026-04',
});

for (const page of filtered) {
  validatePage(page);
  const input = buildPageInput(page);
  const existing = await admin.findPageByHandle(page.handle);
  if (existing) {
    const updated = await admin.updatePage(existing.id, input);
    console.log(`updated page ${updated.handle}`);
  } else {
    const created = await admin.createPage(input);
    console.log(`created page ${created.handle}`);
  }
}

function validatePage(page) {
  const errors = [];
  if (!page.title) errors.push('title is required');
  if (!page.handle) errors.push('handle is required');
  if (!page.templateSuffix) errors.push('templateSuffix is required');
  if (!page.body || page.body.length < 120) errors.push('body must include a unique summary');
  if (typeof page.published !== 'boolean') errors.push('published must be true or false');
  if (errors.length) throw new Error(`${page.handle || page.title}: ${errors.join('; ')}`);
}

function parseArgs(argv) {
  const result = { check: false, dryRun: false, only: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') result.check = true;
    else if (arg === '--dry-run') result.dryRun = true;
    else if (arg === '--only') result.only = argv[++index] || '';
    else if (arg.startsWith('--only=')) result.only = arg.slice('--only='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

