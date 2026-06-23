import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";

interface DashboardShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function DashboardShell({ title, description, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8 lg:px-10">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
