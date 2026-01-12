import { Dashboard } from "@/components";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary,#0f172a)] text-[var(--text-primary,rgba(255,255,255,0.95))] p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Unified Analytics Dashboard</h1>
        <p className="text-[var(--text-secondary,rgba(255,255,255,0.6))] mt-1 text-sm sm:text-base">
          Multi-platform analytics for GoHighLevel
        </p>
      </header>

      <Dashboard timeRange="30d" />
    </main>
  );
}
