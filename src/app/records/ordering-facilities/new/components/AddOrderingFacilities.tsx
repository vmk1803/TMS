"use client";
import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, ChevronDown, Plus, Trash2 } from "lucide-react";
import { X } from "../../../../../components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import SuccessUpdateModal from "../../../../../components/common/SuccessUpdateModal";
import { useCreatePartner } from "../../hooks/useCreatePartner";
import { usePartnerValidation } from "../../hooks/usePartnerValidation";
import {getPartnerByGuid} from "../../services/partnersService";
import { getStateByZipCode } from "../../../users/services/createUserService";
import { useUpdatePartner } from "../../hooks/useUpdatePartner";
import Toast from "../../../../../components/common/Toast";

const MANAGERS = [];
const SALES_REPS = [];

interface AddOrderingFacilitiesProps {
  guid?: string;
}

const AddOrderingFacilities = ({ guid }: AddOrderingFacilitiesProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    facilityName: "",
    accountNumber: "",
    mobileNumber: "",
    fax: "",
    email: "",
    salesRep: "",
    accountManager: "",
    address1: "",
    address2: "",
    city: "",
    zip: "",
    state: "",
    country: "",
    emailNotification: false,
  });

  const { errors, validate, clearError } = usePartnerValidation();
  const [successOpen, setSuccessOpen] = useState(false);
  const { save, loading: createLoading } = useCreatePartner();
  const { update, loading: updateLoading } = useUpdatePartner();
  const loading = createLoading || updateLoading;

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "error"
  );

  // Dynamic contact arrays - Start with one empty row by default
  const [rejectionContacts, setRejectionContacts] = useState<
    { name: string; phone: string; email: string }[]
  >([{ name: "", phone: "", email: "" }]);
  const [criticalContacts, setCriticalContacts] = useState<
    { name: string; phone: string; email: string }[]
  >([{ name: "", phone: "", email: "" }]);

  // Zip / city lookup states (mirror Technician behavior)
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [lastZipFetched, setLastZipFetched] = useState("");

  useEffect(() => {
    if (guid) {
      const fetchData = async () => {
        try {
          const response = await getPartnerByGuid(guid);
          const data = response?.data ?? response;
          setFormData({
            facilityName: data.name || "",
            accountNumber: data.code || "",
            mobileNumber: data.phone || "",
            fax: data.fax || "",
            email: data.email || "",
            salesRep: data.sales_reps || "",
            accountManager: data.account_manager || "",
            address1: data.address_line1 || "",
            address2: data.address_line2 || "",
            city: data.city || "",
            zip: data.zipcode || "",
            state: data.state || "",
            country: data.country || "",
            emailNotification: data.email_notifications || false,
          });

          if (data.collection_contact) {
            const contacts = Array.isArray(data.collection_contact)
              ? data.collection_contact
              : [data.collection_contact];
            setRejectionContacts(
              contacts.length > 0
                ? contacts
                : [{ name: "", phone: "", email: "" }]
            );
          }

          if (data.critical_contact) {
            const contacts = Array.isArray(data.critical_contact)
              ? data.critical_contact
              : [data.critical_contact];
            setCriticalContacts(
              contacts.length > 0
                ? contacts
                : [{ name: "", phone: "", email: "" }]
            );
          }
        } catch (e: any) {
          setToastType("error");
          setToastMessage(e.message || "Failed to load facility details");
          setToastOpen(true);
        }
      };
      fetchData();
    }
  }, [guid]);

  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({
    state: null,
    country: null,
    accountManager: null,
    salesRep: null,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRefs.current &&
        !Object.values(dropdownRefs.current).some((ref) =>
          ref?.contains(e.target as Node)
        )
      ) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) clearError(field);
    setDropdownOpen(null);
  };

  const handleChange = (key: string, value: any) => {
    // sanitize zip input to digits only, max length 5 (same behavior as Technician)
    if (key === "zip") {
      value = String(value).replace(/\D/g, "").slice(0, 5);
      if ((value || "").length < 5) {
        setCityOptions([]);
        setZipError(null);
        if (lastZipFetched) setLastZipFetched("");
      }
    }

    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) clearError(key);
  };

  const handleBack = () => router.back();
  const handleCancel = () => router.push("/records/ordering-facilities");
  const handleCreate = async () => {
    const reqErrors = validate(formData as any);
    if (Object.keys(reqErrors).length) return;

    const payload = {
      code: formData.accountNumber,
      name: formData.facilityName,
      sales_rep: formData.salesRep,
      account_manager: formData.accountManager,
      email: formData.email,
      phone: formData.mobileNumber,
      fax: formData.fax,
      address_line1: formData.address1,
      address_line2: formData.address2,
      zipcode: formData.zip,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      collection_contact: rejectionContacts.map((c) => ({
        name: c.name,
        phone: c.phone,
        email: c.email,
      })),
      critical_contact: criticalContacts.map((c) => ({
        name: c.name,
        phone: c.phone,
        email: c.email,
      })),
      email_notifications: formData.emailNotification,
    };
    try {
      if (guid) {
        await update(guid, payload);
        setSuccessOpen(true);
      } else {
        await save(payload);
        setSuccessOpen(true);
      }
    } catch (e: any) {
      setToastType("error");
      setToastMessage(e.message || "Failed to save facility");
      setToastOpen(true);
    }
  };

  // Add new contact
  const addRejectionContact = () =>
    setRejectionContacts([
      ...rejectionContacts,
      { name: "", phone: "", email: "" },
    ]);
  const addCriticalContact = () =>
    setCriticalContacts([
      ...criticalContacts,
      { name: "", phone: "", email: "" },
    ]);

  // Remove contact
  const removeRejectionContact = (index: number) =>
    setRejectionContacts(rejectionContacts.filter((_, i) => i !== index));
  const removeCriticalContact = (index: number) =>
    setCriticalContacts(criticalContacts.filter((_, i) => i !== index));

  // Zip lookup effect (mirror Technician implementation)
  useEffect(() => {
    const zip = (formData.zip || "").trim();
    if (zip.length === 5 && /^[0-9]{5}$/.test(zip) && zip !== lastZipFetched) {
      setZipLoading(true);
      setZipError(null);
      setLastZipFetched(zip);
      getStateByZipCode(zip)
        .then((res) => {
          const apiCity = res?.city || res?.data?.city || res?.data?.City || "";
          const stateVal =
            res?.state ||
            res?.data?.state ||
            res?.data?.State ||
            res?.state_name ||
            res?.data?.state_name ||
            "";
          let citiesArr: string[] = res?.cities || res?.data?.cities || [];

          if (apiCity && !citiesArr.includes(apiCity)) {
            citiesArr = [apiCity, ...citiesArr];
          }

          setCityOptions(citiesArr);

          setFormData((prev) => {
            const updates: any = {};
            if (stateVal) updates.state = stateVal;

            if (apiCity) updates.city = apiCity;
            else if (citiesArr.length === 1) updates.city = citiesArr[0];
            else if (
              citiesArr.length > 0 &&
              prev.city &&
              !citiesArr.includes(prev.city)
            )
              updates.city = "";

            return Object.keys(updates).length ? { ...prev, ...updates } : prev;
          });
        })
        .catch((e) => {
          setZipError(e?.message || "Zip lookup failed");
          setCityOptions([]);
        })
        .finally(() => setZipLoading(false));
    } else if (zip.length !== 5) {
      setCityOptions([]);
      setZipError(null);
      if (lastZipFetched && zip.length < 5) setLastZipFetched("");
    }
  }, [formData.zip, lastZipFetched, formData.city]);

  return (
    <div className="w-full bg-[#F8FAF9] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-800 hover:text-green-700 transition"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">
            {guid ? "Edit Ordering Facility" : "Add New Ordering Facility"}
          </span>
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-10 h-[calc(100vh-250px)] overflow-y-auto scrollbar-custom">
        {/* Personal Details */}
        <Section title="Personal Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Facility Name"
              required
              value={formData.facilityName}
              onChange={(e) => {
                // strip digits from facility name while typing
                const sanitized = String(e.target.value).replace(/\d/g, '');
                handleChange("facilityName", sanitized);
              }}
              error={errors.facilityName}
            />

            <Input
              label="Account Number"
              required
              value={formData.accountNumber}
              onChange={(e) => {
                // allow numbers only for account number
                const digits = String(e.target.value).replace(/\D/g, '');
                handleChange("accountNumber", digits);
              }}
              error={errors.accountNumber}
            />

            <Input
              label="Mobile Number"
              value={formData.mobileNumber}
              onChange={(e) => {
                // sanitize to digits only while typing and limit to 10 digits
                const digits = String(e.target.value).replace(/\D/g, '').slice(0, 10);
                handleChange("mobileNumber", digits);
              }}
            />

            <Input
              label="Fax"
              value={formData.fax}
              onChange={(e) => handleChange("fax", e.target.value)}
            />

            <Input
              label="Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <DropdownField
              label="Sales Rep"
              field="salesRep"
              options={SALES_REPS}
              selected={formData.salesRep}
              open={dropdownOpen}
              setOpen={setDropdownOpen}
              onSelect={handleSelect}
              refObj={dropdownRefs}
            />

            <DropdownField
              label="Account Manager"
              field="accountManager"
              options={MANAGERS}
              selected={formData.accountManager}
              open={dropdownOpen}
              setOpen={setDropdownOpen}
              onSelect={handleSelect}
              refObj={dropdownRefs}
            />
          </div>
        </Section>

        {/* Address Section */}
        <Section title="Address*">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Address Line 1"
              required
              value={formData.address1}
              onChange={(e) => handleChange("address1", e.target.value)}
              error={errors.address1}
            />

            <Input
              label="Address Line 2"
              value={formData.address2}
              onChange={(e) => handleChange("address2", e.target.value)}
            />

            <Input
              label="Zip"
              required
              value={formData.zip}
              onChange={(e) => handleChange("zip", e.target.value)}
              error={errors.zip}
            />

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                readOnly={cityOptions.length > 0}
                className={`w-full rounded-2xl border bg-gray-50 px-3 py-2 text-sm ${
                  errors.state
                    ? "border-red-500"
                    : "border-gray-300 focus:border-green-600"
                } ${cityOptions.length > 0 ? "bg-gray-50" : ""}`}
              />
              {errors.state && (
                <p className="mt-1 text-xs text-red-600">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              {cityOptions.length > 0 ? (
                <div className="relative">
                  <select
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                      className={`w-full rounded-2xl border bg-gray-50 px-3 pr-14 py-2 text-sm ${
                      errors.city
                        ? "border-red-500"
                        : "border-gray-300 focus:border-green-600"
                    }`}
                  >
                    <option value="" disabled>
                      Select City
                    </option>
                    {cityOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {formData.city && (
                    <button
                      type="button"
                      onClick={() => handleChange("city", "")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4 mr-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className={`w-full rounded-2xl border bg-gray-50 px-3 pr-14 py-2 text-sm ${
                      errors.city
                        ? "border-red-500"
                        : "border-gray-300 focus:border-green-600"
                    }`}
                  />
                  {formData.city && (
                    <button
                      type="button"
                      onClick={() => handleChange("city", "")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              {errors.city && (
                <p className="mt-1 text-xs text-red-600">{errors.city}</p>
              )}
              {!errors.zip && zipLoading && (
                <p className="text-xs text-gray-500 mt-1">
                  Looking up city & state…
                </p>
              )}
              {zipError && (
                <p className="text-xs text-red-600 mt-1">{zipError}</p>
              )}
            </div>
          </div>
        </Section>

        {/* Rejections Contact */}
        <Section title="Rejections and Recollections Point Contact">
            <ContactBlock
            contacts={rejectionContacts}
            onAdd={addRejectionContact}
            onRemove={removeRejectionContact}
            onChange={(index, key, value) => {
              const updated = [...rejectionContacts];
              // sanitize phone for contacts to digits only and limit to 10 when updating phone
              if (key === 'phone') value = String(value).replace(/\D/g, '').slice(0, 10);
              updated[index][key] = value;
              setRejectionContacts(updated);
            }}
          />
        </Section>

        {/* Critical Reporting Contact */}
        <Section title="Critical Reporting Point of Contact">
            <ContactBlock
            contacts={criticalContacts}
            onAdd={addCriticalContact}
            onRemove={removeCriticalContact}
            onChange={(index, key, value) => {
              const updated = [...criticalContacts];
              if (key === 'phone') value = String(value).replace(/\D/g, '').slice(0, 10);
              updated[index][key] = value;
              setCriticalContacts(updated);
            }}
          />
        </Section>

        {/* Settings */}
        <Section title="Ordering Facilities Settings">
          <ToggleSwitch
            label="Email Notifications"
            value={formData.emailNotification}
            onToggle={() =>
              handleChange("emailNotification", !formData.emailNotification)
            }
          />
        </Section>
      </div>

      <div className="flex justify-end gap-2 p-4 mt-4 sticky bottom-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] rounded-2xl bg-[#ffffff]">
        <button
          onClick={handleCancel}
          className="border border-gray-300 text-gray-700 rounded-full px-5 py-2 text-sm font-medium hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 text-sm font-medium transition disabled:opacity-60"
          disabled={loading}
        >
          {loading
            ? guid
              ? "Updating..."
              : "Creating..."
            : guid
            ? "Update"
            : "Create"}
        </button>
      </div>

      <SuccessUpdateModal
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          router.back();
        }}
        title="Ordering facilities"
        heading={
          guid
            ? "Ordering Facilities Updated Successfully"
            : "New Ordering Facilities Created Successfully"
        }
        description={
          guid
            ? "Ordering Facilities Has Been Updated Successfully."
            : "Ordering Facilities Has Been Created Successfully."
        }
      />

      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

const Input = ({ label, value, onChange, error, required }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-800 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>

    <input
      type="text"
      value={value}
      onChange={onChange}
      className={`w-full rounded-2xl border bg-gray-50 px-3 py-2 text-sm focus:outline-none ${
        error ? "border-red-500" : "border-gray-300 focus:border-green-600"
      }`}
    />

    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const DropdownField = ({
  label,
  field,
  options,
  selected,
  open,
  setOpen,
  onSelect,
  refObj,
  error,
}: any) => {
  const handleToggle = () => setOpen(open === field ? null : field);
  return (
    <div
      className="relative"
      ref={(el) => {
        refObj.current[field] = el;
      }}
    >
      <label className="block text-sm font-medium text-gray-800 mb-2">
        {label}
      </label>
      <div
        onClick={handleToggle}
        className={`w-full rounded-2xl border px-3 py-2 text-sm flex justify-between items-center cursor-pointer transition-all ${
          error
            ? "border-red-500 bg-gray-50"
            : "border-gray-300 bg-gray-50 hover:border-green-500"
        }`}
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected || "Select"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-green-600 transition-transform ${
            open === field ? "rotate-180" : ""
          }`}
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <AnimatePresence>
        {open === field && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-50"
          >
            {options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => onSelect(field, opt)}
                className={`block w-full text-left px-4 py-2 text-sm transition-all ${
                  selected === opt
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ToggleSwitch = ({ label, value, onToggle }: any) => (
  <div className="flex items-center gap-3">
    <label className="text-sm font-medium text-gray-800">{label}</label>
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
        value ? "bg-green-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          value ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const ContactBlock = ({ contacts, onAdd, onRemove, onChange }: any) => (
  <div className="space-y-4">
    <div className="flex justify-end">
      <button
        onClick={onAdd}
        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2 text-sm font-medium transition"
      >
        <Plus size={16} /> Add
      </button>
    </div>

    {contacts.map((contact: any, i: number) => (
      <div
        key={i}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center"
      >
        <Input
          label="Name"
          value={contact.name}
          onChange={(e: any) => onChange(i, "name", e.target.value)}
        />

        <Input
          label="Mobile Number"
          value={contact.phone}
          onChange={(e: any) => onChange(i, "phone", e.target.value)}
        />

        <Input
          label="Email"
          value={contact.email}
          onChange={(e: any) => onChange(i, "email", e.target.value)}
        />

        {/* Show remove button only for rows after the first one */}
        {i > 0 ? (
          <button
            onClick={() => onRemove(i)}
            className="flex justify-center items-center text-green-600 hover:text-red-500 transition"
          >
            <Trash2 size={18} />
          </button>
        ) : (
          <div className="flex justify-center items-center">
            {/* Empty space to maintain grid alignment */}
          </div>
        )}
      </div>
    ))}
  </div>
);

export default AddOrderingFacilities;
