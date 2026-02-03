"use client";
import ExpandableOrderRow from "@/components/admin/ExpandableOrderRow";
import TableSearch from "@/components/admin/TableSearch";
import Pagination from "@/components/ui/Pagination";
import { OrderStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
export default function OrdersTab() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("page", page.toString());
        queryParams.set("limit", pageSize.toString());
        if (status) queryParams.set("status", status);
        if (search) queryParams.set("search", search);
        const res = await fetch(`/api/admin/orders?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
          setTotalItems(data.total);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page, status, search]);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage customer orders and track their status
        </p>
      </div>
      <TableSearch
        placeholder="Search orders..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: Object.values(OrderStatus).map((s) => ({
              label: s,
              value: s,
            })),
          },
        ]}
      />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : (
                <>
                  {orders.map((order) => (
                    <ExpandableOrderRow
                      key={order.id}
                      order={order}
                      isAdmin={true}
                    />
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No orders found
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && (
        <Pagination
          totalItems={totalItems}
          pageSize={pageSize}
          currentPage={page}
        />
      )}
    </div>
  );
}
