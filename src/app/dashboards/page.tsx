"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardList } from "@/components/dashboards";
import type { SavedDashboard } from "@/types/custom-dashboards";

const STORAGE_KEY = "unified-analytics-dashboards";
const DEPLOYED_KEY = "unified-analytics-deployed-dashboards";

function loadDashboards(): SavedDashboard[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDashboards(dashboards: SavedDashboard[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
}

function loadDeployedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(DEPLOYED_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

function saveDeployedIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEPLOYED_KEY, JSON.stringify([...ids]));
}

export default function DashboardsPage() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<SavedDashboard[]>([]);
  const [deployedIds, setDeployedIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load dashboards and deployed IDs on mount
  useEffect(() => {
    setDashboards(loadDashboards());
    setDeployedIds(loadDeployedIds());
  }, []);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleView = useCallback((dashboard: SavedDashboard) => {
    router.push(`/dashboards/${dashboard.id}`);
  }, [router]);

  const handleEdit = useCallback((dashboard: SavedDashboard) => {
    router.push(`/dashboards/${dashboard.id}/edit`);
  }, [router]);

  const handleDeploy = useCallback((dashboardId: string) => {
    const newDeployed = new Set(deployedIds);
    newDeployed.add(dashboardId);
    setDeployedIds(newDeployed);
    saveDeployedIds(newDeployed);
    const dashboard = dashboards.find(d => d.id === dashboardId);
    showNotification("success", `"${dashboard?.name}" deployed to main page`);
  }, [deployedIds, dashboards, showNotification]);

  const handleUndeploy = useCallback((dashboardId: string) => {
    const newDeployed = new Set(deployedIds);
    newDeployed.delete(dashboardId);
    setDeployedIds(newDeployed);
    saveDeployedIds(newDeployed);
    const dashboard = dashboards.find(d => d.id === dashboardId);
    showNotification("success", `"${dashboard?.name}" removed from main page`);
  }, [deployedIds, dashboards, showNotification]);

  const handleDelete = useCallback((dashboardId: string) => {
    const newDashboards = dashboards.filter(d => d.id !== dashboardId);
    saveDashboards(newDashboards);
    setDashboards(newDashboards);
    // Also remove from deployed if it was deployed
    if (deployedIds.has(dashboardId)) {
      const newDeployed = new Set(deployedIds);
      newDeployed.delete(dashboardId);
      setDeployedIds(newDeployed);
      saveDeployedIds(newDeployed);
    }
    showNotification("success", "Dashboard deleted");
  }, [dashboards, deployedIds, showNotification]);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Notification toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color,rgba(255,255,255,0.1))]">
        <div>
          <h1 className="text-xl font-semibold">Custom Dashboards</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {dashboards.length} dashboard{dashboards.length !== 1 ? "s" : ""} • {deployedIds.size} deployed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboards/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Dashboard
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            &larr; Back
          </Link>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <DashboardList
          dashboards={dashboards}
          deployedIds={deployedIds}
          onView={handleView}
          onEdit={handleEdit}
          onDeploy={handleDeploy}
          onUndeploy={handleUndeploy}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
