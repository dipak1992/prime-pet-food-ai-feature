export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Offline Mode</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">You are offline right now</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          MealEase keeps key screens ready. Reconnect to sync pantry scans, AI responses, and delivery recommendations.
        </p>
      </div>
    </main>
  )
}
