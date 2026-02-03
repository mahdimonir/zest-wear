"use client";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
const OverviewTab = dynamic(() => import("./OverviewTab"), {
  loading: () => <TabLoader />,
});
const OrdersTab = dynamic(() => import("./OrdersTab"), {
  loading: () => <TabLoader />,
});
const ProductsTab = dynamic(() => import("./ProductsTab"), {
  loading: () => <TabLoader />,
});
function TabLoader() {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
    </div>
  );
}
export default function AdminTabs() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  return (
    <div className="h-full">
      {tab === "overview" && <OverviewTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "products" && <ProductsTab />}
    </div>
  );
}
