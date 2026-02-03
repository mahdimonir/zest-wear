"use client";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import { getStatusColor } from "@/lib/utils";
import { ChevronDown, ChevronUp, MapPin, Package, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  selectedSize: string | null;
  selectedColor: string | null;
  imageUrl?: string | null;
  product: {
    id: number;
    name: string;
    imageUrl: string;
  };
}
interface Order {
  id: string;
  createdAt: Date;
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: any;
  user: {
    name: string | null;
    email: string | null;
  } | null;
  _count?: {
    items: number;
  };
  items?: OrderItem[];
}
interface Props {
  order: Order;
  isAdmin?: boolean;
}
export default function ExpandableOrderRow({ order, isAdmin = false }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const items = order.items || [];
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  const shippingAddr = order.shippingAddress || {};
  const addressLine =
    shippingAddr.address || shippingAddr.addressLine1 || "N/A";
  const region = shippingAddr.thana ? `${shippingAddr.thana}, ` : "";
  const cityOrDistrict = shippingAddr.district || shippingAddr.city || "";
  const postalCode = shippingAddr.postalCode
    ? ` - ${shippingAddr.postalCode}`
    : "";
  const fullLocality = `${region}${cityOrDistrict}${postalCode}`;
  const phoneNumber = shippingAddr.phoneNumber || shippingAddr.phone || "N/A";
  return (
    <>
      <tr
        className="hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={handleExpand}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleExpand();
              }}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            <span className="text-sm font-medium text-gray-900">
              #{order.id.slice(-6)}
            </span>
          </div>
        </td>
        {isAdmin && (
          <td className="px-6 py-4">
            <div className="text-sm text-gray-900">
              {order.user?.name || "Guest"}
            </div>
            <div className="text-xs text-gray-500">{order.user?.email}</div>
          </td>
        )}
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
        <td className="px-6 py-4 text-sm text-gray-600">
          {order._count?.items ?? order.items?.length ?? 0}
        </td>
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          ৳{order.total.toFixed(2)}
        </td>
        {isAdmin && (
          <td className="px-6 py-4 text-right">
            {}
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </td>
        )}
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={isAdmin ? 7 : 5} className="px-6 py-4">
            <div className="flex flex-col gap-6">
              {}
              {isAdmin && (
                <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div>
                    <span className="font-bold text-gray-900 block">
                      Manage Order
                    </span>
                    <span className="text-xs text-gray-500">
                      Update status and view details
                    </span>
                  </div>
                  <OrderStatusUpdater
                    orderId={order.id}
                    currentStatus={order.status}
                  />
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {}
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-gray-600" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Order Items ({items?.length || 0})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {items?.map((item) => {
                      const displayImage =
                        item.imageUrl || item.product.imageUrl;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {displayImage ? (
                              <Image
                                src={displayImage}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                No Img
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product.name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </span>
                              {item.selectedSize && (
                                <span className="text-xs text-gray-500">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              {item.selectedColor && (
                                <span className="text-xs text-gray-500">
                                  Color: {item.selectedColor}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ৳{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {}
                <div className="space-y-4">
                  {}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <h4 className="text-sm font-semibold text-gray-900">
                        Customer Details
                      </h4>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {shippingAddr.fullName || order.user?.name || "Guest"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">
                          {shippingAddr.email || order.user?.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                  {}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <h4 className="text-sm font-semibold text-gray-900">
                        Shipping Address
                      </h4>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-900 leading-relaxed">
                        {addressLine}
                        <br />
                        {fullLocality}
                      </p>
                    </div>
                  </div>
                  {}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
