import React, { useEffect, useState } from 'react'
import UploadProfilePicture from './UploadProfilePicture';
import { TechnicianProps } from '../../../../../types/user';
import { useUserValidation } from "../../hooks/useUserValidation";
import { getStateByZipCode } from '../../services/createUserService';
import DateOfBirthPicker from '@/components/common/DateOfBirthPicker';
import CustomSelect from '../../../../../components/common/CustomSelect';

const Technician: React.FC<TechnicianProps> = ({
  onDataChange,
  initialData,
  mode = 'create',
  validateRequest = 0,
  apiErrors = {}
}) => {

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    user_name: '',
    user_email: '',
    date_of_birth: '',
    employee_id: '',
    address_line: '',
    city: '',
    state: '',
    zip_code: '',
    available_days: [] as string[],
    gender: '',
    profile_pic: null as File | null
  });

  const [existingPicUrl, setExistingPicUrl] = useState<string | undefined>();
  const [showErrors, setShowErrors] = useState(false);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [lastZipFetched, setLastZipFetched] = useState('');

  const { errors: validationErrors, validate, clearError } = useUserValidation();

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const updated = { ...formData };

      const map: Record<string, string[]> = {
        first_name: ['first_name'],
        last_name: ['last_name'],
        email: ['email'],
        user_email: ['user_email', 'email'],
        phone_number: ['phone_number'],
        user_name: ['user_name'],
        date_of_birth: ['date_of_birth'],
        employee_id: ['employee_id'],
        address_line: ['address_line'],
        city: ['city'],
        state: ['state'],
        zip_code: ['zip_code', 'postal_code'],
        available_days: ['available_days'],
        gender: ['gender']
      };

      Object.entries(map).forEach(([key, options]) => {
        for (const opt of options) {
          if (initialData[opt] !== undefined && initialData[opt] !== null) {
            // Handle available_days conversion from string to array
            if (key === 'available_days' && typeof initialData[opt] === 'string') {
              updated[key] = initialData[opt].split(',').map((day: string) => day.trim()).filter((day: string) => day);
            } else {
              updated[key] = initialData[opt];
            }
            break;
          }
        }
      });

      if (initialData.profile_pic && typeof initialData.profile_pic === "string") {
        setExistingPicUrl(initialData.profile_pic);
      }

      setTimeout(() => {
        setFormData(updated);
        onDataChange(updated);
      }, 0);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // Restrict name fields to letters and spaces only
    if (name === 'first_name' || name === 'last_name' || name === 'middle_name') {
      value = String(value).replace(/[^A-Za-z\s]/g, '');
    }

    // Restrict phone to digits only, max 10
    if (name === 'phone_number') {
      value = String(value).replace(/\D/g, '').slice(0, 10);
    }

    if (name === 'zip_code') {
      value = value.replace(/\D/g, '').slice(0, 5);
      if (value.length < 5) {
        setCityOptions([]);
        setZipError(null);
        if (lastZipFetched) setLastZipFetched('');
      }
    }

    const validationMap: Record<string, string> = {
      first_name: "firstName",
      last_name: "lastName",
      email: "email",
      user_email: "email",
      phone_number: "phoneNumber",
      user_name: "userName",
      date_of_birth: "dateOfBirth",
      employee_id: "employeeId",
      gender: "gender",
      address_line: "address",
      city: "city",
      state: "state",
      zip_code: "zip",
    };

    clearError(validationMap[name]);

    // Clear API error for this field when user starts typing
    if (apiErrors[name]) {
      const newApiErrors = { ...apiErrors };
      delete newApiErrors[name];
      // Note: We can't update parent state directly, but the error will be cleared on next submit
    }

    const newData = { ...formData, [name]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  const toggleDay = (day: string) => {
    const updated =
      formData.available_days.includes(day)
        ? formData.available_days.filter(d => d !== day)
        : [...formData.available_days, day];

    const newData = { ...formData, available_days: updated };
    setFormData(newData);
    onDataChange(newData);
  };


  useEffect(() => {
    if (validateRequest === 0) return;

    setShowErrors(true);

    const dataForValidation = {
      firstName: formData.first_name,
      lastName: formData.last_name,
      email: formData.email,
      userEmail: formData.user_email,
      phoneNumber: formData.phone_number,
      userName: formData.user_name,
      dateOfBirth: formData.date_of_birth,
      employeeId: formData.employee_id,
      gender: formData.gender,
      address: formData.address_line,
      city: formData.city,
      state: formData.state,
      zip: formData.zip_code,
    };

    const errs = validate(dataForValidation);
    const hasErrors = Object.values(errs).some(v => v);

    onDataChange({ ...formData, __valid: !hasErrors });

  }, [validateRequest]);

  useEffect(() => {
    const zip = formData.zip_code.trim();
    if (zip.length === 5 && /^[0-9]{5}$/.test(zip) && zip !== lastZipFetched) {
      setZipLoading(true);
      setZipError(null);
      setLastZipFetched(zip);
      getStateByZipCode(zip)
        .then(res => {
          const apiCity = res?.city || res?.data?.city || res?.data?.City || '';
          const stateVal = res?.state || res?.data?.state || res?.data?.State || res?.state_name || res?.data?.state_name || '';
          let citiesArr: string[] = res?.cities || res?.data?.cities || [];

          if (apiCity && !citiesArr.includes(apiCity)) {
            citiesArr = [apiCity, ...citiesArr];
          }

          setCityOptions(citiesArr);

          const updates: Partial<typeof formData> = {};
          if (stateVal) updates.state = stateVal;

          if (apiCity) {
            updates.city = apiCity;
          } else if (citiesArr.length === 1) {
            updates.city = citiesArr[0];
          } else if (citiesArr.length > 0 && formData.city && !citiesArr.includes(formData.city)) {
            updates.city = '';
          }

          if (Object.keys(updates).length > 0) {
            setFormData(prev => {
              const merged = { ...prev, ...updates };
              onDataChange(merged);
              return merged;
            });
          }
        })
        .catch(e => {
          setZipError(e?.message || 'Zip lookup failed');
          setCityOptions([]);
        })
        .finally(() => {
          setZipLoading(false);
        });
    } else if (zip.length !== 5) {
      setCityOptions([]);
      setZipError(null);
      if (lastZipFetched && zip.length < 5) setLastZipFetched('');
    }
  }, [formData.zip_code, formData.city, lastZipFetched, onDataChange, formData, setFormData]);

  return (
    <div className='rounded-b-xl'>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 bg-white pb-6 rounded-b-xl">

        {/* FIRST NAME */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            type="text"
            placeholder="Enter First Name"
            className={`w-full rounded-2xl border bg-formBg px-3 py-2 text-sm 
              ${(showErrors && validationErrors.firstName) || apiErrors.first_name ? "border-red-500" : "border-formBorder"}`}
          />
          {showErrors && validationErrors.firstName && (
            <span className="text-red-600 text-xs">{validationErrors.firstName}</span>
          )}
          {apiErrors.first_name && apiErrors.first_name.length > 0 && (
            <span className="text-red-600 text-xs">{apiErrors.first_name[0]}</span>
          )}
        </div>

        {/* LAST NAME */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            type="text"
            placeholder="Enter Last Name"
            className={`w-full rounded-2xl border bg-formBg px-3 py-2 text-sm 
              ${showErrors && validationErrors.lastName ? "border-red-500" : "border-formBorder"}`}
          />
          {showErrors && validationErrors.lastName && (
            <span className="text-red-600 text-xs">{validationErrors.lastName}</span>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Enter Email"
            className={`w-full rounded-2xl border bg-formBg px-3 py-2 text-sm 
              ${(showErrors && validationErrors.email) || apiErrors.email ? "border-red-500" : "border-formBorder"}`}
          />
          {showErrors && validationErrors.email && (
            <span className="text-red-600 text-xs">{validationErrors.email}</span>
          )}
          {apiErrors.email && apiErrors.email.length > 0 && (
            <span className="text-red-600 text-xs">{apiErrors.email[0]}</span>
          )}
        </div>

        {/* PHONE */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Mobile  Number <span className="text-red-500">*</span>
          </label>
          <input
            name="phone_number"
            value={formData.phone_number}
            maxLength={10}
            onChange={handleChange}
            type="tel"
            placeholder="Enter Mobile  Number"
            className={`w-full rounded-2xl border bg-formBg px-3 py-2 text-sm 
              ${(showErrors && validationErrors.phoneNumber) || apiErrors.phone_number ? "border-red-500" : "border-formBorder"}`}
          />
          {showErrors && validationErrors.phoneNumber && (
            <span className="text-red-600 text-xs">{validationErrors.phoneNumber}</span>
          )}
          {apiErrors.phone_number && apiErrors.phone_number.length > 0 && (
            <span className="text-red-600 text-xs">{apiErrors.phone_number[0]}</span>
          )}
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <DateOfBirthPicker
            name="date_of_birth"
            value={formData.date_of_birth || ''}
            onChange={(d) => {
              clearError('dateOfBirth')
              const newData = { ...formData, date_of_birth: d || '' }
              setFormData(newData)
              onDataChange(newData)
            }}
            error={!!(showErrors && validationErrors.dateOfBirth)}
            placeholder="MM-DD-YYYY"
            className="w-full"
          />
          {showErrors && validationErrors.dateOfBirth && (
            <span className="text-red-600 text-xs">{validationErrors.dateOfBirth}</span>
          )}
        </div>

        {/* GENDER */}
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
            const newData = { ...formData, gender: value }
            setFormData(newData)
            onDataChange(newData)
          }}
        />
        {showErrors && validationErrors.gender && (
          <span className="text-red-600 text-xs">{validationErrors.gender}</span>
        )}
      </div>




      <div className="py-6 px-4 pb-6 mb-4 bg-white rounded-xl">
        <h3 className="text-[18px] font-semibold text-primaryText mb-3">Availability</h3>

        <div className="flex flex-wrap gap-4">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
            <label key={day} className="flex items-center gap-2 text-primaryText text-sm">
              <input
                type="checkbox"
                checked={formData.available_days.includes(day)}
                onChange={() => toggleDay(day)}
                className="accent-green-600 w-4 h-4 rounded"
              />
              {day}
            </label>
          ))}
        </div>
      </div>

      {/* <div className="bg-white rounded-2xl p-6 mb-4">
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">Login Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}

          {/* USER NAME */}
          {/* <div>
            <label className="block text-sm text-primaryText mb-2 font-medium">
              User Name <span className="text-red-500">*</span>
            </label>
            <input
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              type="text"
              placeholder="Enter User Name"
              className={`w-full rounded-2xl border bg-formBg px-3 py-2 text-sm 
                ${showErrors && validationErrors.userName ? "border-red-500" : "border-formBorder"}`}
            />
            {showErrors && validationErrors.userName && (
              <span className="text-red-600 text-xs">{validationErrors.userName}</span>
            )}
          </div> */}

          {/* USER EMAIL */}
          {/* <div>
            <label className="block text-sm text-primaryText mb-2 font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="user_email"
              value={formData.user_email}
              onChange={handleChange}
              type="email"
              placeholder="Enter User Email"
              className={`w-full rounded-2xl border bg-formBg px-3 py-2 text-sm 
                ${showErrors && validationErrors.email ? "border-red-500" : "border-formBorder"}`}
            />
            {showErrors && validationErrors.email && (
              <span className="text-red-600 text-xs">{validationErrors.email}</span>
            )}
          </div>
        </div>
      </div> */}

      <div className="bg-white rounded-2xl p-6 mb-4">
        <h2 className="text-[20px] font-semibold text-primaryText mb-4">Address Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* STREET */}
          <div>
            <label className="block text-sm text-primaryText mb-2 font-medium">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              name="address_line"
              value={formData.address_line}
              onChange={handleChange}
              type="text"
              placeholder="Enter Street Address"
              className={`w-full rounded-2xl border bg-formBg px-3 py-2 text-sm 
                ${showErrors && validationErrors.address ? "border-red-500" : "border-formBorder"}`}
            />
            {showErrors && validationErrors.address && (
              <span className="text-red-600 text-xs">{validationErrors.address}</span>
            )}
          </div>
          
            <div>
              <label className="block text-sm text-primaryText mb-2 font-medium">
                Zip Code <span className="text-red-500">*</span>
              </label>
              <input
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                type="text"
                placeholder="Enter Zip Code"
                maxLength={5}
                className={`w-full rounded-2xl border bg-formBg px-3 py-2 text-sm 
                  ${showErrors && validationErrors.zip ? "border-red-500" : "border-formBorder"}`}
              />
              {showErrors && validationErrors.zip && (
                <span className="text-red-600 text-xs">{validationErrors.zip}</span>
              )}
              {!validationErrors.zip && zipLoading && (
                <span className="text-xs text-gray-500">Looking up city & state…</span>
              )}
              {zipError && (
                <span className="text-xs text-red-600">{zipError}</span>
              )}
            </div>

            <div>
              <label className="block text-sm text-primaryText mb-2 font-medium">
                State <span className="text-red-500">*</span>
              </label>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                type="text"
                placeholder="Enter State"
                readOnly={cityOptions.length > 0}
                className={`w-full rounded-2xl border bg-formBg px-3 py-2 text-sm 
                  ${showErrors && validationErrors.state ? "border-red-500" : "border-formBorder"} ${cityOptions.length > 0 ? 'bg-gray-50' : ''}`}
              />
              {showErrors && validationErrors.state && (
                <span className="text-red-600 text-xs">{validationErrors.state}</span>
              )}
            </div>

            <div>
              <label className="block text-sm text-primaryText mb-2 font-medium">
                City <span className="text-red-500">*</span>
              </label>
              {cityOptions.length > 0 ? (
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full rounded-2xl border bg-formBg px-3 py-2 text-sm 
                    ${showErrors && validationErrors.city ? "border-red-500" : "border-formBorder"}`}
                >
                  <option value="" disabled>Select City</option>
                  {cityOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  type="text"
                  placeholder="Enter City"
                  className={`w-full rounded-2xl border bg-formBg px-3 py-2 text-sm 
                    ${showErrors && validationErrors.city ? "border-red-500" : "border-formBorder"}`}
                />
              )}
              {showErrors && validationErrors.city && (
                <span className="text-red-600 text-xs">{validationErrors.city}</span>
              )}
            </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl mb-4">
        <UploadProfilePicture
          initialUrl={existingPicUrl}
          onSelect={(file) => {
            const updated = { ...formData, profile_pic: file };
            setFormData(updated);
            onDataChange(updated);
          }}
        />
      </div>

    </div>
  );
}

export default Technician;
