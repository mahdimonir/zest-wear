"use client";
import { DollarSign, Loader2, Package, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardOrderRow from "./DashboardOrderRow";
export default function OverviewTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }
  if (!data) return null;
  const { totalProducts, totalOrders, totalSales, orders, pendingOrders } =
    data;
  const stats = [
    {
      name: "Total Sales",
      value: `৳${totalSales.toFixed(2)}`,
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "+12.5%",
      changeType: "increase",
    },
    {
      name: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      subtitle: `${pendingOrders} pending`,
    },
    {
      name: "Total Products",
      value: totalProducts,
      icon: Package,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your store performance
        </p>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div className={`${stat.iconBg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Latest 5 customer orders
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order: any) => (
                <DashboardOrderRow key={order.id} order={order} />
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
