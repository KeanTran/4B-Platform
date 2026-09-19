import { ImageResponse } from 'next/og';

export const alt = '4B Platform — For Better Balance';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #fffdea 0%, #eef7d5 62%, #ffe8cd 100%)',
          color: '#754827',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          padding: '72px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '980px' }}>
          <div style={{ color: '#3f7f12', display: 'flex', fontSize: 30, fontWeight: 700, letterSpacing: 2 }}>
            4B · FOR BETTER BALANCE
          </div>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, lineHeight: 1.12, marginTop: 28 }}>
            Quản lý chuyện ở ghép rõ ràng và cân bằng hơn.
          </div>
          <div style={{ color: '#826653', display: 'flex', fontSize: 30, lineHeight: 1.4, marginTop: 30 }}>
            Chia chi phí · Lịch việc nhà · Tìm bạn ở ghép · AI hỗ trợ
          </div>
        </div>
      </div>
    ),
    size,
  );
}
