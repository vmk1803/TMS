"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";

const MileageEditView = ({ data, onBack }) => {
  return (
    <div className="bg-[#f7f9fb]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ArrowLeft
            className="w-5 h-5 cursor-pointer text-gray-600 hover:text-green-600 transition"
            onClick={onBack}
          />
          <span className="text-sm font-semibold text-gray-700">
            {data.order}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-5 py-2 text-sm font-medium rounded-[24px] border border-[#ACB5BD] text-[#495057] hover:bg-gray-100"
          >
            Cancel
          </button>
          <button className="px-5 py-2 font-medium rounded-[24px] bg-[#009728] text-white text-sm shadow-[0_4px_24px_0_rgba(47,170,80,0.30)] hover:bg-green-700">
            Update
          </button>
        </div>
      </div>
    <div className="bg-[#ffffff] rounded-[24px]  p-6">
      {/* Form */}
      <div className="grid md:grid-cols-5 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#344256] mb-1">
            Technician Name
          </label>
          <select
            defaultValue={data.technician}
            className="w-full border border-[#ACB5BD] rounded-2xl px-3 py-2 text-sm text-gray-700 bg-[#F8FAFC] focus:outline-none"
          >
            <option>Select</option>
            <option>John Smith</option>
            <option>Jane Doe</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#344256] mb-1">
            Order ID
          </label>
          <input
            type="text"
            defaultValue={data.order}
            className="w-full border border-[#ACB5BD] rounded-2xl px-3 py-2 text-sm text-gray-700 bg-[#F8FAFC] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#344256] mb-1">
            En-Route to Arrived Miles
          </label>
          <input
            type="text"
            defaultValue={data.arrived}
            className="w-full border border-[#ACB5BD] rounded-2xl px-3 py-2 text-sm text-[#344256] bg-[#F8FAFC] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#344256] mb-1">
            Arrived to Performed Miles
          </label>
          <input
            type="text"
            defaultValue={data.performed}
            className="w-full border border-[#ACB5BD] rounded-2xl px-3 py-2 text-sm text-[#344256] bg-[#F8FAFC] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#344256] mb-1">
            Performed to Delivered to Lab Miles
          </label>
          <input
            type="text"
            defaultValue={data.delivered}
            className="w-full border border-[#ACB5BD] rounded-2xl px-3 py-2 text-sm text-gray-700 bg-[#F8FAFC] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#344256] mb-1">
            Total Miles
          </label>
          <input
            type="text"
            defaultValue={data.totalMiles}
            className="w-full border border-[#ACB5BD] rounded-2xl px-3 py-2 text-sm text-gray-700 bg-[#F8FAFC] focus:outline-none"
          />
        </div>
      </div>
    </div>
    </div>
  );
};

export default MileageEditView;
