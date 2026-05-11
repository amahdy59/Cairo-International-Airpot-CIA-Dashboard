import type { ReactNode } from "react";
import { DashboardProvider } from "@/lib/dashboard-context";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout({ section, sub, children }: { section: string; sub?: string; children: ReactNode }) {
  return (
    <DashboardProvider>
      <div className="min-h-screen flex bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar section={section} sub={sub} />
          <main className="flex-1 p-4 lg:p-6 grid-bg">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
