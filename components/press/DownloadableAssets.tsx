'use client'

import Image from 'next/image'
import { Download } from 'lucide-react'

type Asset = {
  id: string
  name: string
  description: string
  format: string
  preview: string
  downloadUrl: string
  bg: 'light' | 'dark' | 'color'
}

const LOGOS: Asset[] = [
  {
    id: 'logo-color',
    name: 'Full logo — color',
    description: 'Primary brand mark on light backgrounds',
    format: 'SVG · PNG',
    preview: '/press/mealease-logo-color.svg',
    downloadUrl: '/press/mealease-logo-color.svg',
    bg: 'light',
  },
  {
    id: 'logo-white',
    name: 'Full logo — white',
    description: 'For dark and photographic backgrounds',
    format: 'SVG · PNG',
    preview: '/press/mealease-logo-white.svg',
    downloadUrl: '/press/mealease-logo-white.svg',
    bg: 'color',
  },
  {
    id: 'logo-dark',
    name: 'Full logo — dark',
    description: 'Single-color dark version',
    format: 'SVG · PNG',
    preview: '/press/mealease-logo-dark.svg',
    downloadUrl: '/press/mealease-logo-dark.svg',
    bg: 'light',
  },
  {
    id: 'wordmark',
    name: 'Wordmark only',
    description: 'No icon — pure typography',
    format: 'SVG',
    preview: '/press/mealease-wordmark.svg',
    downloadUrl: '/press/mealease-wordmark.svg',
    bg: 'light',
  },
]

const PRODUCT: Asset[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Main app view showing all 5 pillars',
    format: 'PNG · 2880×1800',
    preview: '/press/product-dashboard.png',
    downloadUrl: '/press/product-dashboard.png',
    bg: 'color',
  },
  {
    id: 'scan',
    name: 'Snap & Cook',
    description: 'Camera scan flow for the fridge',
    format: 'PNG · 1170×2532',
    preview: '/press/product-scan.png',
    downloadUrl: '/press/product-scan.png',
    bg: 'color',
  },
]

const COLORS = [
  { name: 'Terracotta', hex: '#D97757', use: 'Primary brand' },
  { name: 'Deep terracotta', hex: '#C86646', use: 'Hover / pressed' },
  { name: 'Gold', hex: '#B8935A', use: 'Premium accent' },
  { name: 'Cream', hex: '#FDF6F1', use: 'Soft background' },
  { name: 'Ink', hex: '#0A0A0A', use: 'Primary text' },
]

export function DownloadableAssets() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Brand assets
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Free to use for editorial coverage of MealEase. Please don&apos;t modify the logo or
            use it to imply partnership.
          </p>
        </div>

        {/* Logos */}
        <div className="mb-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
            Logos
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LOGOS.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>

        {/* Product */}
        <div className="mb-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
            Product screenshots
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {PRODUCT.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="mb-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
            Brand colors
          </h3>
          <div className="flex flex-wrap gap-4">
            {COLORS.map((c) => (
              <ColorSwatch key={c.hex} {...c} />
            ))}
          </div>
        </div>

        {/* Typography */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
            Typography
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-1">
                Serif
              </p>
              <p className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                Fraunces
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Used for headlines, logos, and emotional moments.
              </p>
              <a
                href="https://fonts.google.com/specimen/Fraunces"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs text-[#D97757] hover:text-[#C86646]"
              >
                Google Fonts →
              </a>
            </div>
            <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-800 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-1">
                Sans
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Inter</p>
              <p className="text-sm text-neutral-500 mt-1">
                Used for body copy, UI, and captions.
              </p>
              <a
                href="https://fonts.google.com/specimen/Inter"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs text-[#D97757] hover:text-[#C86646]"
              >
                Google Fonts →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AssetCard({ asset }: { asset: Asset }) {
  const bgClass =
    asset.bg === 'color'
      ? 'bg-gradient-to-br from-[#D97757] to-[#B8935A]'
      : asset.bg === 'dark'
      ? 'bg-neutral-900'
      : 'bg-neutral-100 dark:bg-neutral-800'

  return (
    <div className="rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 overflow-hidden">
      <div className={`${bgClass} h-32 flex items-center justify-center p-4`}>
        <Image
          src={asset.preview}
          alt={asset.name}
          width={120}
          height={60}
          className="max-h-16 w-auto object-contain"
          onError={() => {}}
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {asset.name}
            </p>
            <p className="text-xs text-neutral-500">{asset.description}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-neutral-400">{asset.format}</span>
          <a
            href={asset.downloadUrl}
            download
            className="inline-flex items-center gap-1 text-xs font-medium text-[#D97757] hover:text-[#C86646]"
          >
            <Download className="w-3 h-3" />
            Download
          </a>
        </div>
      </div>
    </div>
  )
}

function ColorSwatch({ name, hex, use }: { name: string; hex: string; use: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(hex)}
      className="text-left group"
      aria-label={`Copy ${hex}`}
    >
      <div
        className="w-16 h-16 rounded-2xl ring-1 ring-black/10 mb-2"
        style={{ backgroundColor: hex }}
      />
      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-50">{name}</p>
      <p className="text-xs text-neutral-500 group-hover:text-[#D97757]">{hex}</p>
      <p className="text-xs text-neutral-400">{use}</p>
    </button>
  )
}
