interface StatCardProps {
  label: string;
  value: string;
  tone?: "default" | "warning";
}

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${tone === "warning" ? "text-amber-600" : "text-slate-950"}`}>{value}</p>
    </article>
  );
}
