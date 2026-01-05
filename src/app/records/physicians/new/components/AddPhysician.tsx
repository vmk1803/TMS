"use client";
import React, { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, Check } from "lucide-react";
import { X } from '../../../../../components/Icons';
import { motion, AnimatePresence } from "framer-motion";
import SuccessUpdateModal from "../../../../../components/common/SuccessUpdateModal";
import Toast from "../../../../../components/common/Toast";
import { useSearchParams } from "next/navigation";
import { useAddPhysicianForm } from "../../hooks/useAddPhysicianForm";
import { useNpiVerification } from "../hooks/physician";

const AddPhysician = () => {
  const params = useSearchParams();
  const guid = params.get("guid");

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("error");
  const [errorQueue, setErrorQueue] = useState<Array<{message: string, delay: number}>>([]);

  const {
    formData,
    partners,
    filteredPartners,
    loadingPartners,
    saving,
    errors,
    isEdit,
    cityOptions,
    zipLoading,
    zipError,
    dropdownOpen,
    setDropdownOpen,
    facilitySearchTerm,
    setFacilitySearchTerm,
    dropdownRefs,
    handleSelect,
    handleChange,
    handleBack,
    handleCancel,
    handleCreate,
    handleUpdate,
    showSuccess,
    handleCloseSuccess,
    removeFacility,
    handleDropdownToggle,
  } = useAddPhysicianForm(guid);

  const {
    loading: verifying,
    error: verifyError,
    res,
    fields,
    verifyNpi,
    resetVerification,
  } = useNpiVerification();

  /* Auto-fill on NPI verification */
  React.useEffect(() => {
    if (!res) return;
    try {
      Object.keys(fields).forEach((k) => {
        const val = (fields as any)[k];
        if (val !== undefined && val !== null && val !== "") {
          handleChange(k as any, val);
        }
      });
      if ((res as any).npi) handleChange("npiNumber", (res as any).npi);
    } catch (e) {
      console.error('Error binding NPI verification fields to form:', e)
    }
  }, [res]);

  /* Handle error queue for multiple toasts */
  React.useEffect(() => {
    if (errorQueue.length === 0) return;
    
    const nextError = errorQueue[0];
    // const timer = setTimeout(() => {
      setToastType("error");
      setToastMessage(nextError.message);
      setToastOpen(true);
      setErrorQueue(prev => prev.slice(1));
    // }, nextError.delay);

    // return () => clearTimeout(timer);
  }, [errorQueue]);

  /* Reset verification on invalid NPI */
  React.useEffect(() => {
    const v = formData.npiNumber || "";
    const valid = v.length === 10 && /^\d{10}$/.test(v);

    if (!valid) {
      resetVerification();
      [
        "firstName",
        "middleName",
        "lastName",
        "phone_number",
        "address1",
        "address2",
        "city",
        "state",
        "country",
        "zip",
        "specialization",
        "email",
        "fax",
      ].forEach((k) => handleChange(k as any, ""));
    }
  }, [formData.npiNumber]);

  return (
    <div className="w-full bg-[#F8FAF9] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-800 hover:text-green-700 transition"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Physicians</span>
        </button>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-10 h-[calc(100vh-250px)] overflow-y-auto scrollbar-custom">
        {/* Top Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* NPI */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              NPI Number <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={formData.npiNumber}
              maxLength={10}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, ""); // only digits
                if (v.length > 10) v = v.slice(0, 10);     // restrict to 10 digits
                handleChange("npiNumber", v);
              }}
              className={`w-full rounded-2xl border ${
                errors.npiNumber ? "border-red-500" : "border-gray-300"
              } bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none`}
            />

            {formData.npiNumber &&
              /^\d{10}$/.test(formData.npiNumber) && (
                <button
                  type="button"
                  className="absolute right-3 top-8 -translate-y-1/2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded border border-green-300"
                  style={{ top: "50%" }}
                  onClick={() => verifyNpi(formData.npiNumber)}
                  disabled={verifying}
                >
                  {verifying ? "Verifying…" : "Verify"}
                </button>
              )}

            {verifyError && (
              <p className="mt-1 text-xs text-red-600">{verifyError}</p>
            )}
            {errors.npiNumber && <p className="mt-1 text-xs text-red-600">{errors.npiNumber}</p>}
          </div>

          {/* Other Fields */}
          <InputField
            label={
              <>
                Physician First Name <span className="text-red-500">*</span>
              </>
            }
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            error={errors.firstName}
          />

          <InputField
            label="Physician Middle Name"
            value={formData.middleName}
            onChange={(e) => handleChange("middleName", e.target.value)}
          />

          <InputField
            label={
              <>
                Physician Last Name <span className="text-red-500">*</span>
              </>
            }
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            error={errors.lastName}
          />

          <InputField
            label="Phone Number"
            value={formData.phone_number}
            maxLength={10}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, "");
              handleChange("phone_number", numericValue);
            }}
          />

          <InputField
            label="Email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <InputField
            label="Fax"
            value={formData.fax}
            maxLength={10}
            onChange={(e) => handleChange("fax", e.target.value)}
          />

          <InputField
              label={
                <>
                  Specialization <span className="text-red-500">*</span>
                </>
              }
              value={formData.specialization}
              onChange={(e) => handleChange("specialization", e.target.value)}
              error={errors.specialization}
            />
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Address</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <InputField
              label={
                <>
                  Address Line 1 <span className="text-red-500">*</span>
                </>
              }
              value={formData.address1}
              onChange={(e) => handleChange("address1", e.target.value)}
              error={errors.address1}
            />

            <InputField
              label="Address Line 2"
              value={formData.address2}
              onChange={(e) => handleChange("address2", e.target.value)}
            />

            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Zip <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => handleChange("zip", e.target.value)}
                maxLength={5}
                className={`w-full rounded-2xl border ${
                  errors.zip ? "border-red-500" : "border-gray-300"
                } bg-gray-50 px-3 py-2 text-sm text-gray-800`}
              />
              { !errors.zip && zipLoading && (
                <p className="mt-1 text-xs text-gray-500">Looking up city & state…</p>
              ) }
              {errors.zip && <p className="mt-1 text-xs text-red-600">{errors.zip}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                readOnly={cityOptions && cityOptions.length > 0}
                className={`w-full rounded-2xl border ${
                  errors.state ? "border-red-500" : "border-gray-300"
                } bg-gray-50 px-3 py-2 text-sm text-gray-800 ${
                  cityOptions && cityOptions.length > 0 ? 'bg-gray-50' : ''
                }`}
              />
              {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              {cityOptions && cityOptions.length > 0 ? (
                <div className="relative">
                  <select
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className={`w-full rounded-2xl border ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    } bg-gray-50 px-3 pr-14 py-2 text-sm text-gray-800`}
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
                    className={`w-full rounded-2xl border ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    } bg-gray-50 px-3 pr-14 py-2 text-sm text-gray-800`}
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
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
            </div>
          </div>
        </div>

        {/* ---------- Settings (SIDE BY SIDE FIX APPLIED) ---------- */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ordering Facilities Settings
          </h3>

          {/* SIDE-BY-SIDE Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8 pb-10">
            
            {/* Ordering Facilities and Selected Facilities Container */}
            <div className="space-y-4">
              {/* Ordering Facilities Field */}
              <div
                className="relative"
                ref={(el) => {
                  dropdownRefs.current.orderingFacility = el;
                }}
              >
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Ordering Facilities <span className="text-red-500">*</span>
                </label>

                <div
                  onClick={() => handleDropdownToggle("orderingFacility")}
                  className={`w-full lg:w-80 rounded-2xl border ${
                    errors.partnerGuids ? "border-red-500" : "border-gray-300"
                  } bg-gray-50 px-3 py-2 text-sm flex justify-between items-center cursor-pointer`}
                >
                  <span
                    className={
                      (formData.orderingFacilities?.length || 0) > 0
                        ? "text-gray-800"
                        : "text-gray-400"
                    }
                  >
                    {loadingPartners
                      ? "Loading…"
                      : (formData.orderingFacilities?.length || 0) === 0
                      ? "Select"
                      : `${formData.orderingFacilities!.length} selected`}
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 text-green-600 transition-transform ${
                      dropdownOpen === "orderingFacility" ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {dropdownOpen === "orderingFacility" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-full lg:w-80 bg-white border shadow-lg rounded-xl z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Search Input */}
                      <div className="p-3 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search facilities..."
                          value={facilitySearchTerm}
                          onChange={(e) => setFacilitySearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
                        />
                      </div>

                      {/* Dropdown Options */}
                      <div className="max-h-64 overflow-y-auto">
                        {filteredPartners.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 !text-left ">
                            {facilitySearchTerm ? 'No facilities found' : 'No facilities available'}
                          </div>
                        ) : (
                          filteredPartners.map((p: any) => {
                            const guid = p.guid || p.partner_guid || p.id;
                            const name = p.name;
                            const selected = (formData.partnerGuids || []).includes(guid);

                            return (
                              <button
                                key={guid}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextGuids = selected
                                    ? (formData.partnerGuids || []).filter(
                                        (g) => g !== guid
                                      )
                                    : [...(formData.partnerGuids || []), guid];

                                  const nextNames = selected
                                    ? (formData.orderingFacilities || []).filter(
                                        (n) => n !== name
                                      )
                                    : [...(formData.orderingFacilities || []), name];

                                  handleChange("partnerGuids", nextGuids);
                                  handleChange("orderingFacilities", nextNames);
                                }}
                                className={`flex items-left !text-left justify-between w-full px-4 py-2 text-sm ${
                                  selected
                                    ? "bg-green-50 text-green-700 font-medium"
                                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                                }`}
                              >
                                <span>{name}</span>
                                {selected && <Check className="w-4 h-4" />}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.partnerGuids && (
                  <p className="mt-1 text-xs text-red-600">{errors.partnerGuids}</p>
                )}
              </div>

              {/* Selected Facilities Display */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Selected Facilities
                </label>
                {(formData.orderingFacilities?.length || 0) > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.orderingFacilities?.map((facilityName, index) => {
                      const guid = formData.partnerGuids?.[index];
                      return (
                        <div
                          key={guid}
                          className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{facilityName}</span>
                          <button
                            type="button"
                            onClick={() => removeFacility(guid, facilityName)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">
                    No facilities selected
                  </div>
                )}
              </div>
            </div>

            {/* Email Notification */}
            <div className="flex items-center">
              <ToggleSwitch
                label="Email Notifications"
                value={formData.emailNotification}
                onToggle={() =>
                  handleChange("emailNotification", !formData.emailNotification)
                }
              />
            </div>


          </div>

          <SuccessUpdateModal
            isOpen={showSuccess}
            onClose={handleCloseSuccess}
            title="Physician"
            heading={
              isEdit
                ? "Physician Details Updated Successfully"
                : "New Physician Created Successfully"
            }
            // description={
            //   isEdit
            //     ? "Physician Details Has Been Updated Successfully."
            //     : "Physician Details Has Been Created Successfully."
            // }
          />
        </div>
      </div>

      <div className="Ordering Facilities Settings flex justify-end gap-2 p-4 mt-4 sticky bottom-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] rounded-2xl bg-[#ffffff]">
        <button
          onClick={handleCancel}
          className="border border-gray-300 text-gray-700 rounded-full px-5 py-2 text-sm font-medium hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            try {
              if (isEdit) {
                await handleUpdate();
              } else {
                await handleCreate();
              }
            } catch (error: any) {
              // Check if error has error_data for individual field errors
              if (error?.error_data && typeof error.error_data === 'object') {
                // Queue individual toasts for each field error
                const errors: Array<{message: string, delay: number}> = [];
                let delay = 0;
                
                Object.entries(error.error_data).forEach(([field, messages]) => {
                  const errorMessages = Array.isArray(messages) ? messages : [messages];
                  errorMessages.forEach((message: string) => {
                    errors.push({
                      message: `${field}: ${message}`,
                      delay: delay
                    });
                    delay += 3500; // 3.5 seconds between each toast
                  });
                });
                
                setErrorQueue(errors);
              } else {
                // Show generic error toast if no error_data
                setToastType("error");
                setToastMessage(error?.message || "Failed to save physician");
                setToastOpen(true);
              }
            }
          }}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 text-sm font-medium transition"
          disabled={saving}
        >
          {saving ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
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

/* ---------- Reusable Components ---------- */

interface InputFieldProps {
  label: ReactNode;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  error,
  maxLength,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-800 mb-2">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className={`w-full rounded-2xl border ${
        error ? "border-red-500" : "border-gray-300"
      } bg-gray-50 px-3 py-2 text-sm text-gray-800`}
      maxLength={maxLength}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const ToggleSwitch = ({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) => (
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

export default AddPhysician;
