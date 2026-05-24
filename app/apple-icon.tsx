import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 16, left: -18, width: 150, height: 64, border: '7px solid rgba(45,212,191,0.16)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: 56, right: -28, width: 160, height: 76, border: '6px solid rgba(45,212,191,0.13)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -8, left: 14, width: 156, height: 74, border: '6px solid rgba(45,212,191,0.12)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: 96, left: 35, width: 110, height: 44, borderBottom: '17px solid #FDF8EA', borderRadius: '0 0 88px 88px' }} />
        <div style={{ position: 'absolute', top: 114, left: 29, width: 122, height: 44, borderBottom: '18px solid #10B981', borderRadius: '0 0 94px 94px' }} />
        <div style={{ position: 'absolute', top: 132, left: 48, width: 84, height: 25, borderBottom: '10px solid #34D399', borderRadius: '0 0 80px 80px' }} />
        <div style={{ position: 'absolute', top: 66, left: 82, width: 38, height: 62, background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)', borderRadius: '36px 36px 4px 36px', transform: 'rotate(26deg)' }} />
        <div style={{ position: 'absolute', top: 45, left: 57, width: 18, height: 42, background: '#F59E0B', borderRadius: 99, transform: 'rotate(-38deg)' }} />
        <div style={{ position: 'absolute', top: 35, left: 84, width: 20, height: 48, background: '#F59E0B', borderRadius: 99 }} />
        <div style={{ position: 'absolute', top: 45, right: 56, width: 18, height: 42, background: '#F59E0B', borderRadius: 99, transform: 'rotate(38deg)' }} />
      </div>
    ),
    { ...size },
  )
}
