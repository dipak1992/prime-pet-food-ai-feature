# Performance Measurement

Run these before launch performance sign-off:

1. `npm run build`
2. `npm run perf:audit`
3. Lighthouse mobile against the production deployment for `/`, `/pricing`, `/planner`, `/dashboard`, and `/grocery-list`.
4. WebPageTest mobile 4G for `/` and `/start`.

The repo-generated bundle snapshot is written to `docs/performance-audit-current.json`.

Current Lighthouse/WebPageTest numbers still need to be captured from production after deployment. The target remains:

- Homepage Lighthouse Performance: 90+
- Fast FCP on mobile
- No large mobile-only image downloads above the fold
- Lower JS transferred on landing pages than app pages
- No third-party script execution before idle unless required for auth or checkout
