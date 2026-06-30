import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getAuditLogs, type AuditAction } from "@/lib/audit-logs";
import { isCurrentUserAdmin } from "@/lib/profiles";

const actionStyles = {
  create: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  update: "bg-sky-50 text-sky-700 ring-sky-200",
  delete: "bg-red-50 text-red-900 ring-red-200",
  import: "bg-violet-50 text-violet-700 ring-violet-200",
} satisfies Record<AuditAction, string>;

function formatAction(action: AuditAction) {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AuditLogPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return (
      <DashboardShell title="Audit log" description="Track product changes by user and action.">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          You need an admin role to view the audit log.
        </p>
      </DashboardShell>
    );
  }

  const { logs, error } = await getAuditLogs();

  return (
    <DashboardShell title="Audit log" description="Track product changes by user and action.">
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Unable to load audit logs: {error}
        </p>
      ) : logs.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          No audit events recorded yet.
        </p>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-4xl text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Item</th>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Details</th>
                  <th className="px-5 py-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${actionStyles[log.action]}`}
                      >
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">{log.entityName}</p>
                      <p className="text-xs text-slate-500">{log.entityType}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {log.createdByEmail ?? "Unknown user"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {log.details ? (
                        <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs">
                          {JSON.stringify(log.details)}
                        </code>
                      ) : (
                        <span className="text-slate-400">No details</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      <time>{formatDateTime(log.createdAt)}</time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}
