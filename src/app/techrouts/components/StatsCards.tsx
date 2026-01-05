"use client";
import { TotalUserIcon,CompletedIcon, PendingIcon,RejectIcon } from "@/components/Icons";
// import { CompletedIcon, PendingIcon,  TotalIcon } from "../../../components/Icons";
import type { StatusCount } from "../services/techRoutesService";

interface StatsCardsProps {
  statusCount?: StatusCount
}

const StatsCards: React.FC<StatsCardsProps> = ({ statusCount }) => {
  const counts = {
    completed: (statusCount?.completed ?? 0) + (statusCount?.performed ?? 0) + (statusCount?.delivered_to_lab ?? 0),
    pending: (statusCount?.pending ?? 0) + (statusCount?.assigned ?? 0) + (statusCount?.partially_collected ?? 0) + (statusCount?.confirmed ?? 0) + (statusCount?.en_route ?? 0) + (statusCount?.arrived ?? 0),
    rejected: statusCount?.rejected ?? 0,
    onHoldCancelled: (statusCount?.on_hold ?? 0) + (statusCount?.cancelled ?? 0),
    total: statusCount?.total ?? 0
  }

  const orders = [
    { label: "Total", value: counts.total, color: "bg-blue-50", icon: <TotalUserIcon /> }, 
    { label: "Completed", value: counts.completed, color: "bg-green-50", icon: <CompletedIcon /> },
    { label: "Pending", value: counts.pending, color: "bg-yellow-50", icon: <PendingIcon /> },
    { label: "Rejected", value: counts.rejected, color: "bg-red-50", icon: <RejectIcon /> },
    { label: "On Hold", value: counts.onHoldCancelled, color: "bg-orange-50", icon: <RejectIcon /> },
    { label: "Cancelled", value: counts.onHoldCancelled, color: "bg-orange-50", icon: <RejectIcon /> },
  ];
  return (
    <div className="bg-white mb-3">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {orders.map((item, index) => (
          <div
            key={index}
            className={`flex gap-2 items-center p-2 rounded-2xl ${item.color}`}
          >
            <div className="mb-2 w-[20px] h-[20px]">{item.icon}</div>
            <div>
               <p className="text-xs text-gray-500">{item.label}</p>
                <p className="font-semibold text-lg">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;

