'use client';

const STATS = [
  {
    value: '10,000+',
    label: 'Phòng trọ tin dùng',
    icon: 'fa-house-user',
    color: 'var(--primary)',
  },
  {
    value: '100%',
    label: 'Độ chính xác VietQR',
    icon: 'fa-check-circle',
    color: 'var(--accent)',
  },
  {
    value: '0',
    label: 'Tranh chấp tiền bạn cùng phòng',
    icon: 'fa-heart',
    color: 'var(--danger)',
  },
];

export function StatsBar() {
  return (
    <section
      className="border-y"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div
        className="mx-auto grid max-w-[1240px] grid-cols-1 gap-6 px-[5%] py-10 md:grid-cols-3"
      >
        {STATS.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div
              className="flex h-[56px] w-[56px] items-center justify-center rounded-full"
              style={{ background: 'var(--color-bg-soft-primary)' }}
            >
              <i
                className={`fa-solid ${stat.icon} text-2xl`}
                style={{ color: stat.color }}
              />
            </div>
            <div
              className="brand-font text-3xl font-extrabold"
              style={{ color: 'var(--dark)' }}
            >
              {stat.value}
            </div>
            <div
              className="text-sm font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
