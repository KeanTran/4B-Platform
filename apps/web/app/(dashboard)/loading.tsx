export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1320px] space-y-5" aria-label="Đang tải nội dung" aria-busy="true">
      <div className="glass-surface-strong rounded-[var(--radius-xl)] p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-[var(--color-bg-soft-primary)]" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-32 animate-pulse rounded-full bg-[var(--color-bg-soft-primary)]" />
            <div className="h-7 w-64 max-w-full animate-pulse rounded-full bg-[var(--border)]" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-[var(--border)]" />
          </div>
        </div>
      </div>
      <div className="glass-surface min-h-[360px] rounded-[var(--radius-xl)] p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-[var(--glass-highlight)]" />
          ))}
        </div>
      </div>
      <span className="sr-only">Đang chuẩn bị không gian của bạn...</span>
    </div>
  );
}
