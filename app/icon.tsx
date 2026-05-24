import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          background: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 5, left: -3, width: 26, height: 11, border: '1.5px solid rgba(45,212,191,0.16)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -2, right: -5, width: 28, height: 14, border: '1.5px solid rgba(45,212,191,0.14)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: 18, left: 6, width: 20, height: 10, borderBottom: '3px solid #FDF8EA', borderRadius: '0 0 18px 18px' }} />
        <div style={{ position: 'absolute', top: 21, left: 5, width: 22, height: 10, borderBottom: '3px solid #10B981', borderRadius: '0 0 18px 18px' }} />
        <div style={{ position: 'absolute', top: 12, left: 15, width: 7, height: 11, background: '#10B981', borderRadius: '7px 7px 1px 7px', transform: 'rotate(26deg)' }} />
        <div style={{ position: 'absolute', top: 8, left: 10, width: 4, height: 8, background: '#F59E0B', borderRadius: '99px', transform: 'rotate(-36deg)' }} />
        <div style={{ position: 'absolute', top: 6, left: 15, width: 4, height: 9, background: '#F59E0B', borderRadius: '99px' }} />
        <div style={{ position: 'absolute', top: 8, right: 9, width: 4, height: 8, background: '#F59E0B', borderRadius: '99px', transform: 'rotate(36deg)' }} />
      </div>
    ),
    { ...size },
  )
}
