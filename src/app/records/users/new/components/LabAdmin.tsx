import "react-datepicker/dist/react-datepicker.css";
import React, { useEffect, useState } from "react";
import { getAllLabs } from "../../services/createUserService";
import UploadProfilePicture from "./UploadProfilePicture";
import { LabAdminProps } from "../../../../../types/user";
import { useUserValidation } from "../../hooks/useUserValidation";
import DateOfBirthPicker from '@/components/common/DateOfBirthPicker';
import CustomSelect from '../../../../../components/common/CustomSelect';

const LabAdmin: React.FC<LabAdminProps> = ({ onDataChange, initialData, mode = "create", validateRequest = 0, apiErrors = {} }) => {
  const [formData, setFormData] = useState<any>({
    lab_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    user_name: "",
    date_of_birth: "",
    profile_pic: null as File | null,
    gender: "",
    address_line: "",
    zip_code: "",
    state: "",
    city: "",
  });

  const [existingPicUrl, setExistingPicUrl] = useState<string | undefined>();
  const [labs, setLabs] = useState<any[]>([]);

  const {
    errors: validationErrors,
    validate,
    clearError,
  } = useUserValidation();

  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    getAllLabs().then((res) => setLabs(res || []));
  }, []);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const updated = { ...formData };

      const fields = [
        "lab_id",
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "user_name",
        "date_of_birth",
        "gender",
        "profile_pic",
        "address_line",
        "zip_code",
        "state",
        "city",
      ];

      fields.forEach((key) => {
        if (initialData[key] !== undefined && initialData[key] !== null) {
          updated[key] = initialData[key];
        }
      });

      if (typeof updated.profile_pic === "string") {
        setExistingPicUrl(updated.profile_pic);
      }

      setFormData(updated);
      onDataChange(updated);
    }
  }, [initialData, mode]);

  useEffect(() => {
    if (mode !== "edit" || !initialData || labs.length === 0) return;

    const currentVal = formData.lab_id;
    const matchesGuid = labs.some((l) => l.guid === currentVal);
    if (matchesGuid) return;

    let match: any = null;
    if (initialData.lab_name) {
      match = labs.find((l) => l.lab_name === initialData.lab_name);
    }
    if (!match && typeof initialData.lab_id === "number") {
      match = labs.find((l) => l.id === initialData.lab_id);
    }

    if (match) {
      updateField("lab_id", match.guid);
    }
  }, [labs, initialData, mode, formData.lab_id]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value: rawValue } = e.target;
    let value = rawValue;

    // Restrict name fields to letters and spaces only
    if (name === 'first_name' || name === 'last_name' || name === 'middle_name') {
      value = String(value).replace(/[^A-Za-z\s]/g, '');
    }

    // Restrict phone to digits only, max 10
    if (name === 'phone_number') {
      value = String(value).replace(/\D/g, '').slice(0, 10);
    }

    const map: Record<string, string> = {
      lab_id: "lab",
      first_name: "firstName",
      last_name: "lastName",
      email: "email",
      phone_number: "phoneNumber",
      user_name: "userName",
      date_of_birth: "dateOfBirth",
      gender: "gender",
    };

    clearError(map[name]);

    // Clear API error for this field when user starts typing
    if (apiErrors[name]) {
      const newApiErrors = { ...apiErrors };
      delete newApiErrors[name];
      // Note: We can't update parent state directly, but the error will be cleared on next submit
    }

    updateField(name, value);
  };
  const updateField = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onDataChange(updated);
  };

  useEffect(() => {
    if (validateRequest === 0) return;

    setShowErrors(true);

    const dataToValidate = {
      firstName: formData.first_name,
      lastName: formData.last_name,
      lab: formData.lab_id,
      email: formData.email,
      phoneNumber: formData.phone_number,
      userName: formData.user_name,
      dateOfBirth: formData.date_of_birth,
      gender: formData.gender,
    };

    const errs = validate(dataToValidate);
    const hasErrors = Object.values(errs).some((v) => v);

    onDataChange({
      ...formData,
      __valid: !hasErrors,
    });
  }, [validateRequest]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl mb-4">
        {/* Labs Dropdown */}
        <CustomSelect
          label="Labs"
          value={formData.lab_id}
          required
          options={labs.map((lab) => ({
            label: lab.lab_name,
            value: lab.guid
          }))}
          onChange={(value) => {
            clearError('lab')
            updateField("lab_id", value)
          }}
        />
        {showErrors && validationErrors.lab && (
          <p className="text-red-600 text-xs mt-1">{validationErrors.lab}</p>
        )}

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-primaryText">
            First Name<span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={`w-full rounded-2xl border px-3 py-2 bg-formBg ${
              (showErrors && validationErrors.firstName) || apiErrors.first_name
                ? "border-red-500"
                : "border-formBorder"
            }`}
          />

          {showErrors && validationErrors.firstName && (
            <p className="text-red-600 text-xs mt-1">
              {validationErrors.firstName}
            </p>
          )}
          {apiErrors.first_name && apiErrors.first_name.length > 0 && (
            <p className="text-red-600 text-xs mt-1">
              {apiErrors.first_name[0]}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-primaryText">
            Last Name<span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={`w-full rounded-2xl border px-3 py-2 bg-formBg ${
              showErrors && validationErrors.lastName
                ? "border-red-500"
                : "border-formBorder"
            }`}
          />

          {showErrors && validationErrors.lastName && (
            <p className="text-red-600 text-xs mt-1">
              {validationErrors.lastName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-primaryText">
            Email<span className="text-red-500">*</span>
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-2xl border px-3 py-2 bg-formBg ${
              (showErrors && validationErrors.email) || apiErrors.email
                ? "border-red-500"
                : "border-formBorder"
            }`}
          />

          {showErrors && validationErrors.email && (
            <p className="text-red-600 text-xs mt-1">
              {validationErrors.email}
            </p>
          )}
          {apiErrors.email && apiErrors.email.length > 0 && (
            <p className="text-red-600 text-xs mt-1">{apiErrors.email[0]}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-primaryText">
            Mobile  Number<span className="text-red-500">*</span>
          </label>

          <input
            type="tel"
            name="phone_number"
            maxLength={10}
            value={formData.phone_number}
            onChange={handleChange}
            className={`w-full rounded-2xl border px-3 py-2 bg-formBg ${
              (showErrors && validationErrors.phoneNumber) ||
              apiErrors.phone_number
                ? "border-red-500"
                : "border-formBorder"
            }`}
          />

          {showErrors && validationErrors.phoneNumber && (
            <p className="text-red-600 text-xs mt-1">
              {validationErrors.phoneNumber}
            </p>
          )}
          {apiErrors.phone_number && apiErrors.phone_number.length > 0 && (
            <p className="text-red-600 text-xs mt-1">
              {apiErrors.phone_number[0]}
            </p>
          )}
        </div>

        {/* Username */}
        {/* <div>
          <label className="block text-sm font-medium text-primaryText">
            User Name<span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            className={`w-full rounded-2xl border px-3 py-2 bg-formBg ${
              showErrors && validationErrors.userName
                ? "border-red-500"
                : "border-formBorder"
            }`}
          />
        </div> */}

        {/* DOB */}
        <div>
          <label className="block text-sm font-medium text-primaryText">
            Date of Birth <span className="text-red-500">*</span>
          </label>

          <DateOfBirthPicker
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={(dob) =>
              handleChange({
                target: {
                  name: "date_of_birth",
                  value: dob || "",
                },
              } as any)
            }
            error={showErrors && !!validationErrors.dateOfBirth}
            placeholder="MM-DD-YYYY"
            className="w-full"
          />

          {showErrors && validationErrors.dateOfBirth && (
            <p className="text-red-600 text-xs mt-1">
              {validationErrors.dateOfBirth}
            </p>
          )}
        </div>

        {/* Gender */}
        <CustomSelect
          label="Gender"
          value={formData.gender}
          required
          options={[
            { label: "Male", value: "MALE" },
            { label: "Female", value: "FEMALE" }
          ]}
          onChange={(value) => {
            clearError('gender')
            updateField("gender", value)
          }}
        />
        {showErrors && validationErrors.gender && (
          <p className="text-red-600 text-xs mt-1">
            {validationErrors.gender}
          </p>
        )}
      </div>

      {/* Profile Picture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl mb-4">
        <UploadProfilePicture
          initialUrl={existingPicUrl}
          onSelect={(file) => {
            updateField("profile_pic", file);
            if (!file) setExistingPicUrl(undefined);
          }}
        />
      </div>
    </>
  );
};

export default LabAdmin;
