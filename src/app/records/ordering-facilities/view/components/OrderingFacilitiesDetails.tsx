"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getPartnerByGuid } from "../../services/partnersService";
import Toast from "../../../../../components/common/Toast";
import { canEdit } from "../../../../../utils/rbac";

interface Contact {
  name?: string;
  phone?: string;
  email?: string;
}

interface PartnerData {
  account_number: string;
  name?: string;
  phone?: string;
  code?: string;
  fax?: string;
  email?: string;
  sales_reps?: string;
  account_manager?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  collection_contact?: Contact[] | Contact | null;
  critical_contact?: Contact[] | Contact | null;
}

interface OrderingFacilitiesDetailsProps {
  guid: string;
}

const OrderingFacilitiesDetails = ({ guid }: OrderingFacilitiesDetailsProps) => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("error");

  // ---------------- Fetch Partner Details ----------------
  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        setLoading(true);

        // API expected to return: { data: {...} }
        const response = await getPartnerByGuid(guid);
        const data = response?.data ?? response;

        if (!data) {
          throw new Error("No facility details found");
        }

        setPartnerData(data);
        setError(null);
      } catch (err: any) {
        const message = err?.message || "Failed to load facility details";
        setError(message);
        setToastType("error");
        setToastMessage(message);
        setToastOpen(true);
      } finally {
        setLoading(false);
      }
    };

    if (guid) fetchPartnerData();
  }, [guid]);

  // ---------------- Loading State ----------------
  if (loading) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading facility details...</p>
      </div>
    );
  }

  // ---------------- Error State ----------------
  if (error || !partnerData) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error || "Facility not found"}</p>
      </div>
    );
  }

  // ---------------- Personal Details ----------------
  const personalDetails = {
    "Facility Name": partnerData.name || "--",
    "Mobile Number": partnerData.phone || "--",
    "Account Number": partnerData.account_number || "--",
    Fax: partnerData.fax || "--",
    Email: partnerData.email || "--",
    "Sales Rep":  "--", //partnerData.sales_reps ||
    "Account Manager":  "--", //partnerData.account_manager ||
    Address:
      [partnerData.address_line1, partnerData.address_line2].filter(Boolean).join(" ") || "--",
    City: partnerData.city || "--",
    State: partnerData.state || "--",
    Zipcode: partnerData.zipcode || "--",
    Country: partnerData.country || "--",
  };

  // ---------------- Contact Parsing ----------------
  const normalizeContacts = (contact: PartnerData["collection_contact"]) => {
    if (Array.isArray(contact)) return contact;
    if (contact && typeof contact === "object") return [contact];
    return [];
  };

  const rejectionContacts = normalizeContacts(partnerData.collection_contact);
  const criticalContacts = normalizeContacts(partnerData.critical_contact);

  const contactPoints = [
    {
      title: "Rejections And Recollections Point Contact",
      contacts: rejectionContacts.map((c) => ({
        Name: c.name || "--",
        "Phone Number": c.phone || "--",
        Email: c.email || "--",
      })),
    },
    {
      title: "Critical Reporting Point Of Contact",
      contacts: criticalContacts.map((c) => ({
        Name: c.name || "--",
        "Phone Number": c.phone || "--",
        Email: c.email || "--",
      })),
    },
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-700 flex items-center gap-1 hover:text-green-600 transition-all"
        >
          ← Ordering Facility Details
        </button>

        {canEdit() && (
          <button
            onClick={() => router.push(`/records/ordering-facilities/edit?guid=${guid}`)}
            className="px-6 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow hover:bg-green-700 transition"
          >
            Edit
          </button>
        )}
      </div>

      {/* Personal Details */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm mb-6">
        <div className="bg-[#F6F9FB] rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-primaryText mb-4">
            Personal Details
          </h3>

          <div className="grid grid-cols-12 gap-x-6">
            {/* Labels */}
            <div className="col-span-5 md:col-span-4">
              <div className="flex flex-col space-y-3">
                {Object.keys(personalDetails).map((key) => (
                  <p key={key} className="text-sm font-medium text-gray-600">
                    {key}
                  </p>
                ))}
              </div>
            </div>

            {/* Values */}
            <div className="col-span-7 md:col-span-8">
              <div className="flex flex-col space-y-3">
                {Object.entries(personalDetails).map(([key, value]) => (
                  <p
                    key={key}
                    className={`text-sm font-semibold ${key === "Email" ? "text-green-700" : "text-gray-800"
                      }`}
                  >
                    {value}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Sections */}
        {contactPoints.map((section) => (
          <div key={section.title} className="mt-8">
            <h3 className="text-lg font-semibold text-primaryText mb-4">
              {section.title}
            </h3>

            {section.contacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {section.contacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F6F9FB] rounded-2xl p-5 shadow-sm border border-gray-100"
                  >
                    <div className="space-y-2">
                      {Object.entries(contact).map(([label, value]) => (
                        <div
                          key={label}
                          className="flex justify-between items-center text-sm"
                        >
                          <p className="text-gray-600 font-medium">{label}</p>
                          <p
                            className={`font-semibold ${label === "Email" ? "text-green-700" : "text-gray-800"
                              }`}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No contacts available</p>
            )}
          </div>
        ))}
      </div>

      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

export default OrderingFacilitiesDetails;
