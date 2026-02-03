"use client";
import { clsx } from "clsx";
import { LayoutDashboard, Package, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
const sidebarItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    id: "overview",
  },
  {
    label: "Products",
    icon: Package,
    id: "products",
  },
  {
    label: "Orders",
    icon: ShoppingBag,
    id: "orders",
  },
];
export default function AdminSidebar() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 md:min-h-[calc(100vh-64px)]">
      <div className="p-4 md:p-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 hidden md:block">
          Menu
        </h2>
        {}
        <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            const href =
              item.id === "overview" ? "/admin" : `/admin?tab=${item.id}`;
            return (
              <Link
                key={item.id}
                href={href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={clsx(
                    "w-5 h-5",
                    isActive ? "text-blue-600" : "text-gray-400",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-8 hidden md:block">
          System
        </h2>
        <nav className="space-y-1 hidden md:block">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Store className="w-5 h-5 text-gray-400" />
            Storefront
          </Link>
        </nav>
      </div>
    </aside>
  );
}
