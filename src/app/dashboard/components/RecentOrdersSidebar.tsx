"use client";
import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAllOrders } from "../../orders/manageAllOrders/services/getAllOrderService";
import { canCreateOrder } from "../../../utils/rbac";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "text-yellow-500";
    case "Rejected":
      return "text-red-500";
    case "Assigned":
      return "text-blue-600";
    case "Completed":
      return "text-green-600";
    default:
      return "text-gray-500";
  }
};

const RecentOrdersSidebar = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await getAllOrders(1, 10);
        const items = Array.isArray(res) ? res : res?.data || [];
        if (!active) return;
        setOrders(items.slice(0, 10));
      } catch (e) {
        if (!active) return;
        setOrders([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const handleCreateNewOrder = () => {
    router.push("/orders/patientLookUp");
  };

  const handleViewOrder = (order: any) => {
    if (!order?.order_guid) return;
    router.push(`/orders/view?orderGuid=${encodeURIComponent(order.order_guid)}`);
  };

  const handleViewAll = () => {
    router.push("/orders");
  };
  const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "text-[#F4A21A]";
    case "rejected":
      return "text-[#EA4335]";
    case "assigned":
      return "text-[#4285F4]";
    case "completed":
      return "text-[#0F9D58]";
    default:
      return "text-gray-500";
  }
};
const formatStatus = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "-";

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col gap-5 w-full">
      {/* --- Create New Order Section --- */}
      {canCreateOrder() && (
        <div className="bg-[#E8F8EE] rounded-2xl w-85 h-40  pr-5 flex items-center text-center relative overflow-hidden">
          <div className="flex-1">
            <Image
              src="/images/create-new-order.png"
              alt="Lab Illustration"
              className="w-[150px] h-auto"
              width={80}
              height={90}
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 text-lg mb-1">
              Create New Order
            </h4>
            <p className="text-gray-500 text-sm mb-4 max-w-[200px] leading-snug">
              Create and assign diagnostic order instantly.
            </p>
            <button onClick={handleCreateNewOrder} className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition">
              + Create New Order
            </button>
          </div>
        </div>
      )}

      {/* --- Recent Orders Table --- */}
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-800 text-[16px]">
            Recent Orders
          </h4>
          <button
            onClick={handleViewAll}
            className="text-green-600 text-sm font-medium hover:underline"
          >
            View All Orders
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-100">
          <table className="w-full text-sm text-gray-700">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left text-[13px] font-medium">
                <th className="py-2 px-4 rounded-tl-2xl">Order ID</th>
                <th className="py-2 px-4">Urgency</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4 rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center">
                      <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
                      </div>
                  </td>   
                </tr>
              )}

              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-center text-xs text-gray-400">
                    No recent orders
                  </td>
                </tr>
              )}

              {!loading && orders.map((o, i) => (
                <tr
                  key={o.order_guid || i}
                  className="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-3 text-xs text-gray-800 font-medium">
                    {o.phlebio_order_id || "-"}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">{o.urgency || "-"}</td>
                  <td className={`py-2 px-2 text-xs font-medium ${getStatusColor(o.status)}`}>
                    {formatStatus(o.status)}
                  </td>
                  <td className="py-2 px-3">
                    <button
                      type="button"
                      onClick={() => handleViewOrder(o)}
                      className="p-0.5 rounded hover:bg-green-50"
                    >
                      <Eye className="w-4 h-4 text-[#0F9D58]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentOrdersSidebar;
