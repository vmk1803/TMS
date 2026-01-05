"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import LabAdmin from "./LabAdmin";
import Technician from "./Technician";
import { saveUser } from "../../services/createUserService";
import { CreateUserFormProps, UserTypeEnum } from "../../../../../types/user";
import { USER_TYPE_OPTIONS } from "../../../../../lib/userEnum";
import CustomSelect from "../../../../../components/common/CustomSelect";
import { updateUserByGuid } from "../../services/viewUserService";
import UpdateUserReasonModal from "../../components/UpdateUserReasonModal";
import Toast from "../../../../../components/common/Toast";


const CreateUserForm: React.FC<CreateUserFormProps> = ({ mode = 'create', initialUser, onCancel }) => {
  const router = useRouter();
  const [userType, setUserType] = useState<UserTypeEnum | "">(initialUser?.user_type || "");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userFormData, setUserFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [validateTick, setValidateTick] = useState(0);
  const [awaitingValidation, setAwaitingValidation] = useState(false);
  const isEdit = mode === "edit";
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const validationTriggeredRef = useRef(false);

  // Update reason modal state
  const [showUpdateReasonModal, setShowUpdateReasonModal] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (isEdit && initialUser) {
      setUserFormData(initialUser);
      setUserType(initialUser.user_type);
    }
  }, [isEdit, initialUser]);

  const getModalContent = () => {
    const isUpdate = isEdit;
    switch (userType) {
      case UserTypeEnum.LAB_ADMIN:
        return { title: isUpdate ? "Update Lab Admin" : "Add Lab Admin", message: isUpdate ? "Lab Admin Updated Successfully" : "Lab Admin Created Successfully" };
      case UserTypeEnum.ORDERING_ADMIN:
        return { title: isUpdate ? "Update Ordering Facility Admin" : "Add Ordering Facility Admin", message: isUpdate ? "Ordering Facility Admin Updated Successfully" : "Ordering Facility Admin Created Successfully" };
      case UserTypeEnum.TECHNICIAN:
        return { title: isUpdate ? "Update Technician" : "Add New Technician", message: isUpdate ? "Technician Updated Successfully" : "Technician Created Successfully" };
      case UserTypeEnum.LAB_SUPER_ADMIN:
        return { title: isUpdate ? "Update Lab Super Admin" : "Add Lab Super Admin", message: isUpdate ? "Lab Super Admin Updated Successfully" : "Lab Super Admin Created Successfully" };
      case UserTypeEnum.TECHNICIAN_LEAD:
        return { title: isUpdate ? "Update Technician Lead" : "Add Technician Lead", message: isUpdate ? "Technician Lead Updated Successfully" : "Technician Lead Created Successfully" };
      default:
        return { title: isUpdate ? "Update User" : "Add User", message: isUpdate ? "User Updated Successfully" : "User Created Successfully" };
    }
  };
  const doSave = async () => {
    // For edit mode, show the update reason modal
    if (isEdit && initialUser?.guid) {
      setShowUpdateReasonModal(true);
      return;
    }

    try {
      setSaving(true);
      setApiErrors({}); // Clear previous API errors

      await saveUser({ user_type: userType, ...userFormData });

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("User save failed", error);

      const responseData = error?.response?.data;
      const errorData = responseData?.error_data;

      // Store field-level errors for form display
      if (errorData && typeof errorData === "object") {
        setApiErrors(errorData);

        // Extract and format error_data messages for toast
        const toastErrorMessage = Object.entries(errorData)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field.replace(/_/g, " ")}: ${messages.join(", ")}`;
            }
            return "";
          })
          .filter(Boolean)
          .join("\n");

        setToastMessage(toastErrorMessage);
      } else {
        setToastMessage(
          responseData?.message || error?.message || "Failed to create user"
        );
      }

      setToastType("error");
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  }

  const handleSubmit = async () => {
    if (!userType) return;

    const requiresValidation = [
      UserTypeEnum.LAB_ADMIN,
      UserTypeEnum.LAB_SUPER_ADMIN,
      UserTypeEnum.ORDERING_ADMIN,
      UserTypeEnum.TECHNICIAN,
      UserTypeEnum.TECHNICIAN_LEAD,
    ].includes(userType as UserTypeEnum);

    if (requiresValidation) {
      // Trigger child components to validate
      setValidateTick((v) => v + 1);
      validationTriggeredRef.current = true;

      // If already valid, continue; otherwise wait for child validation to update `userFormData.__valid`
      if (!userFormData.__valid) {
        setAwaitingValidation(true);
        return;
      }
    }

    // If validation not required or already valid, proceed to save
    await doSave();
  };

  // When awaiting validation, submit automatically once children set `userFormData.__valid`
  useEffect(() => {
    if (awaitingValidation && userFormData && validationTriggeredRef.current) {
      if (userFormData.__valid === true) {
        // Validation passed, proceed to save
        validationTriggeredRef.current = false;
        setAwaitingValidation(false);
        doSave();
      } else if (userFormData.__valid === false) {
        // Validation completed but failed, reset awaitingValidation to stop "Validating..." state
        validationTriggeredRef.current = false;
        setAwaitingValidation(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaitingValidation, userFormData?.__valid, validateTick]);

  const handleConfirmUpdate = async (reason: string) => {
    if (!initialUser?.guid) return;

    try {
      setSaving(true);
      setApiErrors({});
      const form = new FormData();

      for (const key of Object.keys(userFormData)) {
        const incoming = userFormData[key];
        const original = initialUser[key];

        if (incoming !== undefined && incoming !== original) {
          if (key === "available_days" && Array.isArray(incoming)) {
            incoming.forEach(day => {
              form.append("available_days", day);
            });
            continue;
          }

          form.append(key, incoming);
        }
      }

      if (!form.keys().next().done) {
        await updateUserByGuid(initialUser.guid, form, reason);
      }

      setShowUpdateReasonModal(false);
      setToastType('success');
      setToastMessage('User updated successfully');
      setShowToast(true);

      setTimeout(() => {
        setShowSuccessModal(true);
      }, 1500);

    } catch (error: any) {
      setShowUpdateReasonModal(false);

      const errorData = error?.response?.data?.error_data;
      if (errorData) setApiErrors(errorData);

      setToastType('error');
      setToastMessage(error?.response?.data?.message || 'Failed to update user');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setTimeout(() => router.back(), 400);
  };

  const { title, message } = getModalContent();

  return (
    <div className="rounded-xl relative h-[calc(100vh-110px)] overflow-y-auto scrollbar-custom">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.back())}
          className="text-primaryText text-sm font-medium hover:underline"
        >
          ← Back
        </button>

      </div>

      <div className="bg-white p-4 rounded-t-xl mt-6 ">
        <h2 className="text-[20px] font-semibold text-primaryText">
          {isEdit ? "Edit User" : "Personal Details"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <CustomSelect
            label="User Type"
            value={userType}
            required
            options={USER_TYPE_OPTIONS}
            disabled={isEdit}
            onChange={(val) => !isEdit && setUserType(val as UserTypeEnum)}
          />
        </div>
      </div>

      {(userType === UserTypeEnum.LAB_ADMIN ||
        userType === UserTypeEnum.LAB_SUPER_ADMIN) && (
          <LabAdmin
            validateRequest={validateTick}
            onDataChange={setUserFormData}
            initialData={isEdit ? initialUser : undefined}
            mode={mode}
            apiErrors={apiErrors}
          />
        )}

      {(userType === UserTypeEnum.TECHNICIAN ||
        userType === UserTypeEnum.TECHNICIAN_LEAD) && (
          <Technician
            validateRequest={validateTick}
            onDataChange={setUserFormData}
            initialData={isEdit ? initialUser : undefined}
            mode={mode}
            apiErrors={apiErrors}
          />
        )}

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white w-[95%] md:w-[550px] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center px-6 py-4 bg-[#E8F5E9] border-b border-[#DDE2E5] rounded-t-2xl">
                <h2 className="text-lg font-semibold text-primaryText">{title}</h2>
                <button type="button" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 text-center">
                <div className="relative flex justify-center items-center mb-5">
                  <div className="absolute w-14 h-14 rounded-full bg-completed animate-ping opacity-60"></div>
                  <div className="relative bg-completed rounded-full w-14 h-14 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="14">
                      <path
                        d="M18 2L7.7 12L2 6.47"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="text-lg lg:text-2xl font-semibold text-primaryText">{message}</h3>
                <p className="text-sm text-primaryText mt-2">
                  {isEdit ? 'User has been updated successfully.' : 'User has been created successfully.'}
                </p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-6 px-6 py-2 bg-secondary hover:bg-primary text-white rounded-full"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UpdateUserReasonModal
        isOpen={showUpdateReasonModal}
        onClose={() => setShowUpdateReasonModal(false)}
        onConfirm={handleConfirmUpdate}
        isSubmitting={saving}
      />

      <Toast
        open={showToast}
        type={toastType}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />

      {userType && (
        <div className="flex justify-end gap-2 p-4 mt-4 sticky bottom-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] rounded-2xl bg-[#ffffff]">
          <button
            type="button"
            onClick={() => (onCancel ? onCancel() : router.back())}
            className="px-6 py-2 rounded-full border border-gray-300 text-primaryText font-medium hover:bg-gray-50"
          >
            {isEdit ? "Close" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || awaitingValidation}
            className="px-6 py-2 rounded-full bg-green-600 text-white font-medium shadow hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? (isEdit ? "Updating..." : "Creating...") : awaitingValidation ? 'Validating...' : isEdit ? "Update" : "Create"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateUserForm;
