import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { safeSearchParam } from '@/lib/validation/input'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const title = safeSearchParam(req.nextUrl.searchParams.get('title'), 'Cheap weekly meal plan', 90)
  const subtitle = safeSearchParam(req.nextUrl.searchParams.get('subtitle'), 'Plan tonight, shop smarter, waste less', 120)
  const total = safeSearchParam(req.nextUrl.searchParams.get('total'), '$82', 24)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#123C35',
          color: 'white',
          padding: 64,
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', color: '#F3B18E' }}>
            MealEase
          </div>
          <div
            style={{
              display: 'flex',
              borderRadius: 999,
              background: '#FDF6F1',
              color: '#123C35',
              padding: '12px 22px',
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            {total}
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 72, lineHeight: 1.02, fontWeight: 900, maxWidth: 860 }}>
            {title}
          </div>
          <div style={{ marginTop: 28, fontSize: 34, lineHeight: 1.35, color: '#F8D8C8', maxWidth: 760 }}>
            {subtitle}
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 46 }}>
            {['Dinner ideas', 'Grocery list', 'Leftovers'].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.12)',
                  padding: '18px 24px',
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid rgba(255,255,255,0.18)',
            paddingTop: 28,
            fontSize: 26,
            color: '#FDF6F1',
          }}
        >
          <span>Generate your plan free</span>
          <span>mealease.ai</span>
        </div>
      </div>
    ),
    {
      width: 1000,
      height: 1500,
    },
  )
}
