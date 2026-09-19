export default function BlogLoading() {
  return (
    <div className="mx-auto min-h-[70vh] max-w-[1240px] animate-pulse px-[5%] pb-16 pt-28">
      <div className="h-64 rounded-[32px]" style={{ background: 'var(--color-bg-soft-primary)' }} />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-80 rounded-3xl" style={{ background: 'var(--surface)' }} />)}
      </div>
    </div>
  );
}
