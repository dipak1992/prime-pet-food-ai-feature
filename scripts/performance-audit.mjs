import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const nextDir = join(root, '.next')
const chunksDir = join(nextDir, 'static', 'chunks')
const outputPath = join(root, 'docs', 'performance-audit-current.json')

function walkFiles(dir) {
  if (!existsSync(dir)) return []

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) return walkFiles(fullPath)
    return [fullPath]
  })
}

function sizeKb(file) {
  return Math.round((statSync(file).size / 1024) * 10) / 10
}

function readJsonIfExists(path) {
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf8'))
}

const chunks = walkFiles(chunksDir)
  .filter((file) => file.endsWith('.js') || file.endsWith('.css'))
  .map((file) => ({
    file: relative(root, file),
    sizeKb: sizeKb(file),
  }))
  .sort((a, b) => b.sizeKb - a.sizeKb)

const buildManifest = readJsonIfExists(join(nextDir, 'build-manifest.json'))
const appBuildManifest = readJsonIfExists(join(nextDir, 'app-build-manifest.json'))
const appPathRoutesManifest = readJsonIfExists(join(nextDir, 'app-path-routes-manifest.json'))

const appRouteAssets = appBuildManifest?.pages
  ? Object.entries(appBuildManifest.pages)
      .map(([route, assets]) => ({
        route,
        assetCount: Array.isArray(assets) ? assets.length : 0,
        assets: Array.isArray(assets) ? assets : [],
      }))
      .sort((a, b) => a.route.localeCompare(b.route))
  : []

const appRoutes = appRouteAssets.length > 0
  ? appRouteAssets
  : appPathRoutesManifest
    ? Object.entries(appPathRoutesManifest)
        .filter(([, route]) => typeof route === 'string' && !route.startsWith('/api/'))
        .map(([entry, route]) => ({
          route,
          entry,
          assetCount: 0,
          assets: [],
        }))
        .sort((a, b) => a.route.localeCompare(b.route))
    : []

const report = {
  generatedAt: new Date().toISOString(),
  requiresFreshBuild: 'Run npm run build before this script for accurate production chunks.',
  totals: {
    jsAndCssChunkCount: chunks.length,
    jsAndCssKb: Math.round(chunks.reduce((sum, chunk) => sum + chunk.sizeKb, 0) * 10) / 10,
    appRouteCount: appRoutes.length,
  },
  largestChunks: chunks.slice(0, 30),
  appRoutes,
  legacyPages: buildManifest?.pages ? Object.keys(buildManifest.pages).sort() : [],
}

writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`Wrote ${relative(root, outputPath)}`)
console.log(`Total JS/CSS chunks: ${report.totals.jsAndCssKb} KB across ${report.totals.jsAndCssChunkCount} files`)
console.log('Largest chunks:')
for (const chunk of report.largestChunks.slice(0, 10)) {
  console.log(`- ${chunk.sizeKb} KB ${chunk.file}`)
}
