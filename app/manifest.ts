import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MealEase – Make family meals easy',
    short_name: 'MealEase',
    id: '/',
    description:
      'MealEase helps you decide what to cook with simple, smart meal plans for your whole family.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    orientation: 'portrait',
    lang: 'en-US',
    dir: 'ltr',
    background_color: '#ffffff',
    theme_color: '#064E3B',
    categories: ['food', 'lifestyle', 'productivity'],
    shortcuts: [
      {
        name: 'Plan This Week',
        short_name: 'Planner',
        description: 'Open your weekly meal planner.',
        url: '/planner',
      },
      {
        name: 'Snap Pantry',
        short_name: 'Pantry',
        description: 'Scan pantry ingredients with your camera.',
        url: '/pantry',
      },
      {
        name: 'Open Dashboard',
        short_name: 'Dashboard',
        description: 'Jump straight to your home dashboard.',
        url: '/dashboard',
      },
    ],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/apple-touch-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
