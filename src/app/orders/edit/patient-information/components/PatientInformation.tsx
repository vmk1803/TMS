"use client";
import React from "react";
import { X } from "lucide-react";

// -----------------------------------------------------------
// ⭐ Reusable Components (TypeScript Safe)
// -----------------------------------------------------------

interface BaseFieldProps {
  label: string;
  required?: boolean;
  colspan?: string;
}

export const InputField: React.FC<BaseFieldProps> = ({
  label,
  required,
  colspan = "",
}) => {
  return (
    <div className={colspan}>
      <label className="block text-sm text-primaryText mb-2 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type="text"
        placeholder={`Enter ${label}`}
        className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 
        text-sm text-primaryText focus:border-green-600"
      />
    </div>
  );
};

export const DateField: React.FC<BaseFieldProps> = ({
  label,
  required,
  colspan = "",
}) => {
  return (
    <div className={colspan}>
      <label className="block text-sm text-primaryText mb-2 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type="date"
        className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 
        text-sm text-primaryText focus:border-green-600"
      />
    </div>
  );
};

interface DropdownProps extends BaseFieldProps {
  options: string[];
}

export const DropdownField: React.FC<DropdownProps> = ({
  label,
  required,
  options,
  colspan = "",
}) => {
  return (
    <div className={colspan}>
      <label className="block text-sm text-primaryText mb-2 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          className="w-full rounded-2xl border border-formBorder bg-formBg px-3 py-2 
          text-sm text-primaryText appearance-none focus:border-green-600"
        >
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>

        {/* Dropdown Icon */}
        <svg
          className="absolute right-3 top-3 w-4 h-4 text-green-600 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

interface TagListProps {
  items: string[];
}

export const TagList: React.FC<TagListProps> = ({ items }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 
          rounded-full text-sm"
        >
          {item}
          <button>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

const PatientInformation = () => {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-10">

      {/* PERSONAL DETAILS */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">
          Personal Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputField label="First Name" required />
          <InputField label="Middle Name" required />
          <InputField label="Last Name" required />
          <DropdownField label="Gender" required options={["Male", "Female"]} />

          <DateField label="Date of Birth" required />
          <InputField label="Mobile Number 1" required />
          <InputField label="Mobile Number 2" />
          <InputField label="Email ID" />
        </div>
      </div>

      {/* ADDRESS */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">
          Address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputField label="Address Line 1" required />
          <InputField label="Address Line 2" />
          <InputField label="City" required />
          <InputField label="State" required />
          <InputField label="Zip" required />
          <InputField label="Country" />
        </div>
      </div>

      {/* OTHER INFO */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">
          Other Info
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DropdownField label="Homebound Status Indicated?" options={["Yes", "No"]} />
          <InputField label="SSN" />
          <DropdownField label="Service Hub" options={["Hub 1", "Hub 2"]} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 mt-4 ">
              <input type="checkbox" className="w-4 h-4 accent-green-600" />
              <span className="text-primaryText text-sm">Patient has Expired</span>
            </div>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4  mb-4">
          <InputField label="DX Code" />
        </div>
      </div>

      {/* PROVIDERS */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">Providers</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DropdownField label="Select Provider" options={["Provider 1", "Provider 2"]} />
          </div>
          <TagList items={["Rina Sarkar", "Rina Sarkar"]} />
      </div>

      {/* CLIENTS */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">Clients</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
            <DropdownField label="Select Client" options={["Texas Physician House Calls"]} />
            </div>
            <TagList items={["Texas Physician House Calls", "Texas Physician House Calls"]} />
          
      </div>

      {/* BILLING & RESIDENCE */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">
          Billing & Residence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DropdownField label="Billing Responsibility" options={["Self", "Insurance"]} />
          <DropdownField label="Residence" options={["Home", "Nursing Facility"]} />
        </div>
      </div>

      {/* INSURANCE */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">
          Billing & Insurance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <DropdownField label="Primary Insurance" options={["Aetna", "BCBS"]} />
          <InputField label="Primary Insurance Group Number" />
          <InputField label="Primary Insurance Number" />

          <DropdownField label="Secondary Insurance" options={["Medicaid", "UHC"]} />
          <InputField label="Secondary Insurance Group Number" />
          <InputField label="Secondary Insurance Number" />

          <DropdownField label="Relationship" options={["Self", "Child", "Spouse"]} />

          <InputField label="Patient Notes" colspan="md:col-span-4" />
        </div>
      </div>

    </div>
  );
};

export default PatientInformation;
