import Link from "next/link";
import { logout } from "@/app/login/actions";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/stock-movements", label: "Stock movements" },
  { href: "/audit-log", label: "Audit log" },
];

export function Sidebar() {
  return (
    <aside className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
      <div>
        <Link href="/" className="text-xl font-bold tracking-tight">Stockroom</Link>
        <p className="mt-1 text-xs text-slate-400">Inventory management</p>
        <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <form action={logout} className="mt-4 lg:mt-auto">
        <button
          type="submit"
          className="cursor-pointer w-full rounded-lg border border-slate-700 px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}
