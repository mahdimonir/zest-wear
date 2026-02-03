"use client";
import { getStatusColor } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
interface Order {
  id: string;
  createdAt: Date;
  total: number;
  status: string;
  user: {
    name: string | null;
  } | null;
}
interface Props {
  order: Order;
}
export default function DashboardOrderRow({ order }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <>
      <tr
        className="hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <span className="text-sm font-medium text-gray-900">
              #{order.id.slice(-6)}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {order.user?.name || "Guest"}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {new Date(order.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
              order.status,
            )}`}
          >
            {order.status}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900 text-right">
          ৳{order.total.toFixed(2)}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="px-6 py-3">
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Order ID:</span> {order.id}
              </p>
              <p className="mt-1">
                Click "View All" to see full order details in the Orders page.
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
