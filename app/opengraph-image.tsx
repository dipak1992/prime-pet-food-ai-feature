import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'MealEase – Make family meals easy'

const MEALS = ['🍝', '🌮', '🥗', '🍜', '🫕', '🥘']
const PILLS = ['👶 Baby-safe', '🧒 Kid-friendly', '⚡ Under 30 min']

export default function OGImage() {
  const font = readFileSync(
    join(process.cwd(), 'node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf'),
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          background: 'linear-gradient(140deg, #0d2211 0%, #1b4a24 55%, #0f2817 100%)',
          overflow: 'hidden',
          fontFamily: 'Geist, sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow top-right */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,175,80,0.18) 0%, transparent 70%)' }} />
        {/* Glow bottom-left */}
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,175,80,0.12) 0%, transparent 70%)' }} />

        {/* ── Left panel ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: 620,
            height: '100%',
            paddingLeft: 80,
            paddingRight: 60,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Topographic nest icon */}
          <div style={{ width: 72, height: 72, borderRadius: 16, background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 6, left: -6, width: 58, height: 24, border: '3px solid rgba(45,212,191,0.16)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -2, right: -10, width: 60, height: 28, border: '3px solid rgba(45,212,191,0.14)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: 39, left: 14, width: 44, height: 17, borderBottom: '7px solid #FDF8EA', borderRadius: '0 0 36px 36px' }} />
            <div style={{ position: 'absolute', top: 46, left: 11, width: 50, height: 17, borderBottom: '7px solid #10B981', borderRadius: '0 0 40px 40px' }} />
            <div style={{ position: 'absolute', top: 27, left: 33, width: 15, height: 25, background: '#10B981', borderRadius: '15px 15px 2px 15px', transform: 'rotate(26deg)' }} />
            <div style={{ position: 'absolute', top: 18, left: 23, width: 8, height: 18, background: '#F59E0B', borderRadius: 99, transform: 'rotate(-38deg)' }} />
            <div style={{ position: 'absolute', top: 14, left: 34, width: 8, height: 20, background: '#F59E0B', borderRadius: 99 }} />
            <div style={{ position: 'absolute', top: 18, right: 23, width: 8, height: 18, background: '#F59E0B', borderRadius: 99, transform: 'rotate(38deg)' }} />
          </div>

          {/* Wordmark */}
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1, marginBottom: 20 }}>
            <span style={{ color: 'white' }}>Meal</span>
            <span style={{ color: '#34D399' }}>Ease</span>
          </div>

          {/* Tagline line 1 */}
          <div style={{ display: 'flex', fontSize: 28, color: 'rgba(255,255,255,0.78)', fontWeight: 400, lineHeight: 1.35, marginBottom: 4 }}>
            Make family meals easy.
          </div>
          {/* Tagline line 2 */}
          <div style={{ display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.55)', fontWeight: 400, marginBottom: 36 }}>
            AI-powered plans for your whole household.
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 44 }}>
            {PILLS.map((label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  background: 'rgba(16,185,129,0.18)',
                  border: '1px solid rgba(16,185,129,0.35)',
                  borderRadius: 100,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 16,
                  paddingRight: 16,
                  fontSize: 15,
                  color: '#A7F3D0',
                  fontWeight: 500,
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Domain */}
          <div style={{ display: 'flex', fontSize: 18, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.5px' }}>
            mealeaseai.com
          </div>
        </div>

        {/* ── Right panel — emoji grid ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            height: '100%',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Divider */}
          <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 1, background: 'rgba(255,255,255,0.08)' }} />

          {/* Emoji grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingLeft: 40 }}>
            <div style={{ display: 'flex', gap: 14 }}>
              {MEALS.slice(0, 3).map((emoji) => (
                <div key={emoji} style={{ width: 130, height: 130, borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>
                  {emoji}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              {MEALS.slice(3, 6).map((emoji) => (
                <div key={emoji} style={{ width: 130, height: 130, borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Geist', data: font, weight: 400, style: 'normal' }],
    },
  )
}
