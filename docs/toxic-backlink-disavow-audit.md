# Toxic Backlink Disavow — Technical SEO Audit

## Overview

This document outlines the toxic backlink disavow process for primepetfood.com. Spammy blog comments and low-quality directory links have been identified pointing to the domain, which risk triggering Google's link spam algorithms and eroding domain authority.

## What Was Found

### Spammy Blog Comments
External blogs with auto-generated comment sections contain keyword-stuffed links pointing to primepetfood.com. These appear to be from automated link-building tools and provide zero referral value.

**Characteristics:**
- Generic comments ("Great post! Visit my site...")
- Keyword-stuffed anchor text ("best yak chews for dogs cheap buy now")
- Posted on irrelevant blogs (tech, finance, gambling sites)
- Multiple comments from the same IP ranges

### Low-Quality Directories
Free web directories with no editorial review process have listings for primepetfood.com. These directories exist solely to sell links and are frequently penalized by Google.

### Link Farms / PBN Networks
Private blog networks (PBNs) with thin, auto-generated content linking to primepetfood.com. These are the highest-risk links and should be disavowed immediately.

## Action Taken

1. **Created disavow file**: `docs/google-disavow-links.txt`
2. **Format**: Uses Google's `domain:` directive to disavow all links from entire domains (more thorough than individual URL disavows)
3. **Scope**: 25+ domains identified for disavow

## How to Submit

1. Navigate to [Google Search Console Disavow Tool](https://search.google.com/search-console/disavow-links)
2. Select the `primepetfood.com` property
3. Upload `docs/google-disavow-links.txt`
4. Confirm submission
5. Google processes disavow requests within 2–4 weeks

## Ongoing Monitoring

### Quarterly Audit Process
1. Export backlinks from Google Search Console → Links → External Links
2. Cross-reference with Ahrefs or SEMrush toxic link reports
3. Flag any new domains with:
   - Spam Score > 60%
   - Irrelevant anchor text
   - Auto-generated content
   - No organic traffic
4. Add flagged domains to `docs/google-disavow-links.txt`
5. Re-upload to Google Search Console

### Preventive Measures
- **Do NOT** purchase backlinks or use link-building services
- **Do NOT** participate in link exchanges or guest post networks
- **DO** build links organically through:
  - Genuinely useful content that earns citations
  - Founder PR and podcast appearances
  - Veterinary and trainer partnerships
  - Local business directories (legitimate ones only)

## Tools Recommended
- **Google Search Console** (free) — Primary link monitoring
- **Ahrefs** — Comprehensive backlink audit, toxic link detection
- **SEMrush** — Backlink audit tool with automatic toxic scoring
- **Moz Link Explorer** — Spam Score metric for quick assessment

## Timeline
- **Week 1**: Submit disavow file to Google Search Console
- **Week 2–4**: Google processes the disavow
- **Week 4+**: Monitor Search Console for ranking recovery signals
- **Quarterly**: Re-audit and update disavow file
