"use client";
import React from "react";
import { InputField, DateField, DropdownField, TagList } from "../../patient-information/components/PatientInformation";
import { TextAreaField } from "./TextAreaField";

const OrderInformation = () => {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-10">

      {/* SERVICE ADDRESS */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <input type="checkbox" className="w-4 h-4 accent-green-600" />
          <span className="text-primaryText text-sm font-medium">
            Make This Address as Service Address
          </span>
        </div>

        <p className="text-sm text-gray-600 ml-6 mb-4">
          10610 SW Plaza CT, TRLR 21, Houston, taxes
        </p>

        <h2 className="text-[20px] font-semibold text-primaryText mb-4">
          Add New Address
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

      {/* SERVICES */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">
          Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DropdownField
            label="Services"
            options={["Venipuncture Home Draw", "UA Specimen Pickup"]}
          />
        </div>

        <TagList
          items={["Venipuncture Home Draw", "UA Specimen Pickup"]}
        />
      </div>

      {/* APPOINTMENT TIME */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">
          Appointment Time
        </h2>
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <DropdownField
          label="Appointment Time"
          options={["5:00 AM - 8:00 AM", "8:00 AM - 12:00 PM", "12:00 PM - 4:00 PM"]}
          />
          </div>
      </div>

      {/* DESTINATION LAB */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">
          Destination Laboratory
        </h2>
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <DropdownField
          label="Destination Lab"
          options={["Microgen Health Labs", "MGH Toxicology"]}
          />
          </div>
      </div>

      {/* DX CODES */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">
          DX Codes
        </h2>
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <DropdownField
          label="DX Codes"
          options={[
              "36415-Collection Of Venous Blood",
              "I10-Essential Hypertension",
            ]}
            />
            </div>

        <TagList
          items={[
            "36415-Collection Of Venous Blood By Venipuncture",
            "I10-Essential (primary) Hypertension",
          ]}
        />
      </div>

      {/* LAB TEST */}
      <div>
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">
          Lab Test
        </h2>
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <DropdownField
          label="Lab Test"
          options={[
              "Microgen Urinalysis Test",
              "MGH Toxicology toxicology",
            ]}
            />
            </div>

        <TagList
          items={[
            "Microgen Urinalysis Test",
            "MGH Toxicology toxicology",
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <DateField label="Date of Service" required />
          <DropdownField label="Fasting" options={["Yes", "No"]} />
          <DropdownField label="Urgency" options={["Low", "Normal", "High"]} />
        </div>

        <div className="grid grid-cols-1 gap-4 mt-6">
            <TextAreaField label="Warming Notes" colspan="md:col-span-4" />
            <TextAreaField label="Interface Order" colspan="md:col-span-4" />
            <TextAreaField label="Results CC Information" colspan="md:col-span-4" />
            <TextAreaField label="Notes" colspan="md:col-span-4" />
        </div>

      </div>

    </div>
  );
};

export default OrderInformation;
