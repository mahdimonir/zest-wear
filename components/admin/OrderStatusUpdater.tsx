"use client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}
export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const statuses = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      toast.success(`Order status updated to ${newStatus}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <div className="flex items-center gap-3">
      {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className={`px-3 py-1.5 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          currentStatus === "DELIVERED"
            ? "bg-green-50 border-green-200 text-green-800"
            : currentStatus === "CANCELLED"
              ? "bg-red-50 border-red-200 text-red-800"
              : currentStatus === "SHIPPED"
                ? "bg-blue-50 border-blue-200 text-blue-800"
                : "bg-white border-gray-300 text-gray-700"
        }`}
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
