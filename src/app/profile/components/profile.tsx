"use client";
import React, { useState, useEffect, useRef } from "react";
import { updateUserByGuid } from "../../records/users/services/viewUserService";
import SendOtpModal from "./SendOtpModal";
import OtpVerificationModal from "./OtpVerificationModal";
import CreateNewPasswordModal from "./CreateNewPasswordModal";
import PasswordSuccessModal from "./PasswordSuccessModal";
import Title from "@/components/common/Title";

interface ProfileProps {
  userData?: any;
  loading?: boolean;
  error?: string | null;
}

function formatToMMDDYYYY(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}-${day}-${year}`;
}


export default function ProfileScreen({ userData, loading, error }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [optimisticUserData, setOptimisticUserData] = useState<any | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  // const [department, setDepartment] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeProfilePic, setRemoveProfilePic] = useState(false);
  const [profilePicError, setProfilePicError] = useState<string>('');

  //popup models
  const [showSendOtp, setShowSendOtp] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showCreatePass, setShowCreatePass] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState<string>("");


  const [role, setRole] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [cityValue, setCityValue] = useState("");
  useEffect(() => {
    const source = optimisticUserData || userData;
    if (source && !isEditing) {
      setFirstName(source.first_name || "");
      setLastName(source.last_name || "");
      setDateOfBirth(formatToMMDDYYYY(source.date_of_birth) || "");
      setGender(source.gender || "");
      setPhoneNumber(source.phone_number || "");
      setEmail(source.email || "");
      // setDepartment(source.department || "");
      setRole(source.user_type || "");
      setAddressLine(source.address_line || "");
      setZipCode(source.zip_code || "");
      setStateValue(source.state || "");
      setCityValue(source.city || "");
    }
  }, [userData, optimisticUserData, isEditing]);

  const userGuid = userData?.guid || userData?.user_guid || userData?.id || userData?.user_id;

  const handleEdit = () => {
    setUpdateError(null);
    setUpdateSuccess(false);
    setIsEditing(true);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setUpdateError(null);
    setUpdateSuccess(false);
  };
  async function handleUpdate() {
    if (!userGuid) {
      setUpdateError("Missing user GUID");
      return;
    }
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      const formData = new FormData();

      if (firstName !== userData.first_name) formData.append("first_name", firstName);
      if (lastName !== userData.last_name) formData.append("last_name", lastName);
      if (dateOfBirth !== userData.date_of_birth) formData.append("date_of_birth", dateOfBirth);
      if (gender !== userData.gender) formData.append("gender", gender);
      if (phoneNumber !== userData.phone_number) formData.append("phone_number", phoneNumber);
      if (email !== userData.email) formData.append("email", email);
      // if (department !== userData.department) formData.append("department", department);
      if (role !== userData.user_type) formData.append("user_type", role);
      if (addressLine !== userData.address_line) formData.append("address_line", addressLine);
      if (zipCode !== userData.zip_code) formData.append("zip_code", zipCode);
      if (stateValue !== userData.state) formData.append("state", stateValue);
      if (cityValue !== userData.city) formData.append("city", cityValue);

      if (selectedFile) {
        formData.append("profile_pic", selectedFile);
      }
      if (removeProfilePic) {
        formData.append("remove_profile_pic", "1");
      }

      if (formData.keys().next().done) {
        setUpdateError("No changes detected");
        return;
      }

      const updated = await updateUserByGuid(userGuid, formData);

      const updatedUserFromApi = (() => {
        if (!updated) return {};
        if (updated.data && typeof updated.data === 'object') return updated.data;
        return updated;
      })();

      const mergedUser = {
        ...(optimisticUserData || userData || {}),
        ...updatedUserFromApi,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        gender,
        phone_number: phoneNumber,
        email,
        user_type: role,
        address_line: addressLine,
        zip_code: zipCode,
        state: stateValue,
        city: cityValue,
        ...(removeProfilePic ? { profile_pic: null } : {}),
      };

      try {
        const raw = localStorage.getItem('user');
        let session: any = {};
        if (raw) {
          try { session = JSON.parse(raw); } catch { session = {}; }
        }
        if (!session || typeof session !== 'object' || (!session.user && !('accessToken' in session))) {
          session = { user: mergedUser };
        } else if (session.user && typeof session.user === 'object') {
          session.user = { ...session.user, ...mergedUser };
        } else {
          session = { user: mergedUser };
        }
        localStorage.setItem('user', JSON.stringify(session));
        window.dispatchEvent(new CustomEvent('user-updated', { detail: session.user }));
      } catch { }

      setOptimisticUserData(mergedUser);
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (e: any) {
      setUpdateError(e?.message || "Update failed");
    } finally {
      setUpdateLoading(false);
    }

  }

  if (loading) { // need to replace by shimmer
    return <div className="p-6">Loading profile...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }
  if (!userData) { //need to replace by, no data found UI
    return <div className="p-6">No user data found....</div>;
  }
  function getProfilePic(pic?: string): string {
    if (!pic) return "https://via.placeholder.com/120";

    if (pic.startsWith("http") || pic.startsWith("https") || pic.startsWith("data:")) {
      return pic;
    }

    return pic;
  }

  function formatLastLogin(raw?: string): string {
    const date = new Date(raw);
    if (isNaN(date.getTime())) return "Last Updated: Unknown";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Last Updated: Today";
    if (diffDays === 1) return "Last Updated: 1 day ago";
    return `Last Updated: ${diffDays} days ago`;
  }


  return (
    <div className="w-full min-h-screen bg-gray-50">

      <div className="flex justify-between items-center mb-6">
        <Title
          heading="Profile"
          subheading="Update personal information, set preferences, and manage account settings"
        />

        {isEditing ? (
          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateLoading}
              className="px-5 py-2 rounded-full border border-[#ACB5BD] text-[#495057] text-sm disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={updateLoading}
              className="px-5 py-2 rounded-full bg-[#009728] text-white text-sm shadow-[0_4px_24px_0_rgba(47,170,80,0.30)] disabled:opacity-60"
            >
              {updateLoading ? 'Saving...' : 'Update'}
            </button>
            {updateError && <span className="text-red-600 text-sm">{updateError}</span>}
            {/* {updateSuccess && <span className="text-green-600 text-sm">Saved</span>} */}
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <button
              onClick={handleEdit}
              disabled={loading}
              className="px-5 py-2 rounded-full bg-[#009728] text-white shadow-[0_4px_24px_0_rgba(47,170,80,0.30)] disabled:opacity-60"
            >
              Edit
            </button>
            {updateError && <span className="text-red-600 text-sm">{updateError}</span>}
            {updateSuccess && <span className="text-green-600 text-sm">Saved</span>}
          </div>
        )}
      </div>

      {/* Layout Wrapper */}
      <div className="bg-white rounded-[24px] border border-[#E5F3E9] shadow flex flex-col md:flex-row gap-6">
        {/* LEFT CARD */}
        <div className="w-full md:w-1/4 border-r-2 border-[#E5F3E9] p-6 flex flex-col items-center text-center bg-[#ffffff] rounded-tl-[24px] rounded-bl-[24px] rounded-br-0 rounded-tr-0 after:content-[''] after:block after:w-full  after:h-[130px] relative after:absolute after:bg-[linear-gradient(90deg,rgba(0,151,40,0.20)_0%,rgba(156,205,172,0.20)_100%)] after:top-0 after:rounded-tl-[24px] after:rounded-tr-none after:rounded-br-none after:rounded-bl-none after:border-l">
          {/* ---- PROFILE PHOTO UPLOAD + REMOVE ---- */}
          <div className="mt-10 relative z-[9]">

            {/* ========================  
      SHOW ADD ICON  
      only when NO preview, NO uploaded image, NO API image  
     ======================== */}
            {!previewUrl &&
              !selectedFile &&
              !optimisticUserData?.profile_pic &&
              !userData.profile_pic &&
              !removeProfilePic && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-full bg-gray-200 border flex items-center justify-center cursor-pointer hover:bg-gray-300 transition"
                >
                  <span className="text-4xl text-gray-600">+</span>
                </div>
              )}

            {/* ========================  
      SHOW IMAGE (preview OR API image)
     ======================== */}
            {(previewUrl ||
              optimisticUserData?.profile_pic ||
              userData.profile_pic) &&
              !removeProfilePic && (
                <img
                  src={
                    previewUrl ||
                    getProfilePic(
                      optimisticUserData?.profile_pic || userData.profile_pic
                    )
                  }
                  alt="profile"
                  className="w-28 h-28 rounded-full bg-slate-400 object-cover border"
                />
              )}

            {/* ========================  
      EDIT BUTTON — Visible ONLY in editing mode  
     ======================== */}
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-green-600 text-white p-2 rounded-full text-xs shadow"
              >
                ✎
              </button>
            )}

  {/* ========================  
      REMOVE BUTTON — shows ONLY when an image exists & editing
     ======================== */}
  {/* {(previewUrl ||
    optimisticUserData?.profile_pic ||
    userData.profile_pic) &&
    isEditing &&
    !removeProfilePic && (
      <button
        onClick={() => {
          setPreviewUrl(null);
          setSelectedFile(null);
          setRemoveProfilePic(true);
        }}
        className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow"
      >
        ×
      </button>
    )} */}

            {/* ========================  
      Hidden File Input  
     ======================== */}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setProfilePicError('');

                if (!file) return;

                const allowed = [
                  "image/png",
                  "image/jpeg",
                  "image/jpg",
                  "image/webp",
                ];
                if (!allowed.includes(file.type)) {
                  setProfilePicError("Unsupported file format. Only PNG, JPG, JPEG, WEBP are allowed.");
                  setTimeout(() => setProfilePicError(''), 5000);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  return;
                }

                if (file.size > 10 * 1024 * 1024) {
                  setProfilePicError("File size must be less than 10MB.");
                  setTimeout(() => setProfilePicError(''), 5000);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  return;
                }

                setSelectedFile(file);
                setRemoveProfilePic(false); // since user selected new pic

                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
              }}
            />
          </div>

          {/* Profile Picture Error Message */}
          {profilePicError && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 text-center">{profilePicError}</p>
            </div>
          )}


          <h3 className="mt-4 text-2xl text-[#344256] font-semibold">
            {(optimisticUserData?.first_name ?? firstName)} {(optimisticUserData?.last_name ?? lastName)}
          </h3>
          <p className="text-[#495057] text-base">{optimisticUserData?.email ?? email}</p>

          <div className="mt-6 text-left w-full">
            <p className="text-sm font-medium text-[#344256]">Role</p>
            <p className="mb-3 text-[#495057] text-lg font-semibold">{(optimisticUserData?.user_type ?? role) || 'N/A'}</p>

            {/* <p className="text-sm font-medium text-[#344256]">Department</p>
            <p className="mb-3 text-[#495057] text-lg font-semibold">Laboratory</p> */}

            <p className="text-sm font-medium text-[#344256]">Joining Date</p>
            <p className="text-[#495057] text-lg font-semibold">
              {userData.created_at ? formatToMMDDYYYY(userData.created_at.split("T")[0]) : "N/A"}
            </p>

          </div>
        </div>

        {/* RIGHT FORM SECTION */}
        <div className="flex-1 bg-white p-6 pl-0 rounded-tr-[24px] rounded-br-[24px] rounded-tl-0 rounded-bl-0">
          <h3 className="text-xl font-semibold text-[#344256] text-center mb-4">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#344256]">First Name</label>
              <input
                value={firstName}
                readOnly
                className={`mt-1 w-full text-sm text-[#495057] p-3 rounded-2xl 
  ${isEditing ? "border border-[#ACB5BD] bg-white" : "border-none bg-[#F1F5F9]"}
`}              />
            </div>

            <div>
              <label className="text-sm text-[#344256]">Last Name</label>
              <input
                value={lastName}
                readOnly
                className={`mt-1 w-full text-sm text-[#495057] p-3 rounded-2xl 
  ${isEditing ? "border border-[#ACB5BD] bg-white" : "border-none bg-[#F1F5F9]"}
`}              />
            </div>

            <div>
              <label className="text-sm text-[#344256]">Date of Birth</label>
              <input
                value={dateOfBirth}
                readOnly
                placeholder="YYYY-MM-DD"
                className={`mt-1 w-full text-sm text-[#495057] p-3 rounded-2xl 
  ${isEditing ? "border border-[#ACB5BD] bg-white" : "border-none bg-[#F1F5F9]"}
`}              />
            </div>

            <div>
              <label className="text-sm text-[#344256]">Gender</label>
              <input
                value={gender}
                readOnly
                className={`mt-1 w-full text-sm text-[#495057] p-3 rounded-2xl 
  ${isEditing ? "border border-[#ACB5BD] bg-white" : "border-none bg-[#F1F5F9]"}
`}              />
            </div>
            <div>
              <label className="block text-sm text-primaryText mb-2 font-medium">
                Mobile  Number
              </label>
              <input
                name="phone_number"
                value={phoneNumber}
                onChange={(e) => isEditing && setPhoneNumber(e.target.value)}
                type="text"
                readOnly={!isEditing}
                maxLength={10}
                placeholder="Enter Mobile  Number"
                className={`w-full rounded-2xl p-3 text-sm text-primaryText
  ${isEditing ? "border border-formBorder bg-white" : "border-none bg-[#F1F5F9]"}
`}
              />

            </div>

            <div>
              <label className="text-sm text-[#344256]">Email ID</label>
              <input
                value={email}
                readOnly
                className={`mt-1 w-full text-sm text-[#495057] p-3 rounded-2xl 
  ${isEditing ? "border border-[#ACB5BD] bg-white" : "border-none bg-[#F1F5F9]"}
`}              />
            </div>
          </div>

          <h3 className="text-xl text-[#344256] font-semibold mt-8">Professional Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pb-10">
            {/* <div>
              <label className="text-sm text-[#344256]">Department</label>
              <input
                value={department}
                onChange={(e) => isEditing && setDepartment(e.target.value)}
                readOnly={!isEditing}
                className="mt-1 w-full text-sm text-[#495057] bg-[#F8FAFC] p-3 rounded-2xl border border-[#ACB5BD]"
              />
            </div> */}

            <div>
              <label className="text-sm text-[#344256]">Role</label>
              <input
                value={role}
                readOnly
                className={`mt-1 w-full text-sm text-[#495057] p-3 rounded-2xl 
  ${isEditing ? "border border-[#ACB5BD] bg-white" : "border-none bg-[#F1F5F9]"}
`}              />
            </div>
          </div>
          {/* Address Details always visible & editable in edit mode */}
          {
            (userData.user_type === "TECHNICIAN" || userData.user_type === "TECHNICIAN LEAD") && (
              <>
                <h2 className="text-[20px] font-semibold text-primaryText mb-4">
                  Address Details
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm text-primaryText mb-2 font-medium">
                      Street Address
                    </label>
                    <input
                      name="address_line"
                      value={addressLine}
                      onChange={(e) => isEditing && setAddressLine(e.target.value)}
                      type="text"
                      readOnly={!isEditing}
                      placeholder="Enter Street Address"
                      className="w-full rounded-2xl border border-formBorder bg-white px-3 py-2 text-sm text-primaryText"
                    />

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-primaryText mb-2 font-medium">
                        Zip
                      </label>
                      <input
                        name="zip"
                        value={zipCode}
                        onChange={(e) => isEditing && setZipCode(e.target.value)}
                        type="text"
                        readOnly={!isEditing}
                        placeholder="Enter Zip"
                        className="w-full rounded-2xl border border-formBorder bg-white px-3 py-2 text-sm text-primaryText"
                      />

                    </div>

                    <div>
                      <label className="block text-sm text-primaryText mb-2 font-medium">
                        State
                      </label>
                      <input
                        name="state"
                        value={stateValue}
                        onChange={(e) => isEditing && setStateValue(e.target.value)}
                        type="text"
                        readOnly={!isEditing}
                        placeholder="Enter State"
                        className="w-full rounded-2xl border border-formBorder bg-white px-3 py-2 text-sm text-primaryText"
                      />

                    </div>

                    <div>
                      <label className="block text-sm text-primaryText mb-2 font-medium">
                        City
                      </label>
                      <input
                        name="city"
                        value={cityValue}
                        onChange={(e) => isEditing && setCityValue(e.target.value)}
                        type="text"
                        readOnly={!isEditing}
                        className="w-full rounded-2xl border border-formBorder bg-white px-3 py-2 text-sm text-primaryText"
                      />

                    </div>
                  </div>
                </div>
              </>
            )
          }

          <h3 className="text-xl text-[#344256] font-semibold pt-6 mb-3">Account Security</h3>
          <div className="bg-[#F8FAFC] p-4 rounded-[24px] flex justify-between items-center">
            <div>
              <p className="font-medium text-xl text-[#495057]">Password</p>
              <p className="text-[#495057] text-sm">{formatLastLogin(userData.last_login)}</p>
            </div>
            <button
              className="bg-secondary text-white px-4 py-2 rounded-full text-sm"
              onClick={() => setShowSendOtp(true)}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* POPUPS */}
      <SendOtpModal
        isOpen={showSendOtp}
        onClose={() => setShowSendOtp(false)}
        onNext={(enteredEmail?: string) => {
          // clearing the localstorage once the user otp verified by email
          const finalEmail = enteredEmail || email;
          setPasswordResetEmail(finalEmail);
          try { localStorage.setItem('password_reset_email', finalEmail); } catch { }
          setShowSendOtp(false);
          setShowOtp(true);
        }}
      />

      <OtpVerificationModal
        isOpen={showOtp}
        email={passwordResetEmail || email}
        onClose={() => setShowOtp(false)}
        onNext={(verifiedEmail?: string) => {
          const finalEmail = verifiedEmail || passwordResetEmail || email;
          setPasswordResetEmail(finalEmail);
          setShowOtp(false);
          setShowCreatePass(true);
        }}
      />

      <CreateNewPasswordModal
        isOpen={showCreatePass}
        email={passwordResetEmail || email}
        onClose={() => setShowCreatePass(false)}
        onSuccess={() => {
          setShowCreatePass(false);
          setShowSuccess(true);
        }}
      />

      <PasswordSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}