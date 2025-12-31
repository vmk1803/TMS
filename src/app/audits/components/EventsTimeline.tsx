"use client";
import React from "react";

const timelineData = [
  {
    time: "20:00",
    title: "Order assigned to Maria Rodriguez",
    details: {
      entity: "Order",
      action: "Assigned",
      actor: "Maria Rodriguez",
      orderId: "ORD-2024-201",
    },
  },
  {
    time: "19:50",
    title: "Patient Record Created",
    details: {
      entity: "Order",
      action: "Assigned",
      actor: "Maria Rodriguez",
      orderId: "ORD-2024-201",
    },
  },
];

const EventsTimeline = () => {
  return (
    <div className="">
      <h4 className="text-green-600 font-semibold mb-6">
        Monday, October 26th, 2025
      </h4>

      <div className="relative">
        {timelineData.map((item, index) => (
          <div key={index} className="mb-10 relative">
            {/* Timeline Dot */}
            <div
              className={`absolute z-20 left-16 top-1 w-4 h-4 rounded-full ${
                index === 0 ? "bg-green-600" : "bg-blue-500"
              } border-4 border-white shadow`}
            ></div>
            <div className="flex gap-16 items-center">
                {/* Time */}
                <p className="text-sm w-16 font-semibold text-gray-600">{item.time}</p>

                {/* Title */}
                <p className="text-base font-semibold text-gray-800">
                {item.title}
                </p>
            </div>

            {/* Detail Card */}
            <div className="bg-[#F8FAFC] ml-28 mt-4 p-4 rounded-xl shadow-sm border border-gray-100 w-full max-w-md">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                  {item.details.entity}
                </span>
                <span className="px-3 py-1 bg-green-100 rounded-full text-xs font-medium text-green-700">
                  {item.details.action}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                    👤 {item.details.actor}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                    {item.details.orderId}
                </p>
                </div>
            </div>
          </div>
        ))}
        <div className="bg-[#F8FAFC] z-10 absolute w-1 h-[55%] top-4 left-[70px]"></div>
      </div>
    </div>
  );
};

export default EventsTimeline;
