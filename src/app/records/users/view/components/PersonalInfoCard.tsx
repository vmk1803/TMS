"use client";

import { MapPin, Pencil } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { hasFullAccess } from "../../../../../utils/rbac";

const PersonalInfoCard = ({ userData }: { userData: any }) => {
  const router = useRouter();
  
  const formatAddress = (user: any) => {
    return [
      user.address_line,
      user.city,
      user.state,
      user.zip_code
    ].filter(Boolean).join(" ");
  }
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm mb-5">
      <div className="flex justify-between items-start">
        <h3 className="text-xl lg:text-2xl font-semibold text-primaryText">
          Personal Info
        </h3>
        {hasFullAccess() && (
          <button
            type="button"
            disabled={!userData?.guid && !userData?.user_guid && !userData?.id}
            onClick={(e) => {
              e.stopPropagation();
              const guid = userData?.guid || userData?.user_guid || userData?.id;
              if (!guid) return;
              router.push(`/records/users/edit/${encodeURIComponent(guid)}`);
            }}
            className="text-green-600 hover:text-green-700"
            aria-label="Edit user"
          >
            <Pencil className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">

        {/* NAME */}
        <div>
          <p className="text-sm text-text70">Name</p>
          <p className="font-medium text-sm text-primaryText">
            {userData?.first_name && userData?.last_name
              ? `${userData.first_name} ${userData.last_name}`
              : "NA"}
          </p>
        </div>

        {/* GENDER */}
        <div>
          <p className="text-sm text-text70">Gender</p>
          <p className="font-medium text-sm text-primaryText">
            {userData?.gender || "NA"}
          </p>
        </div>

        {/* MOBILE */}
        <div>
          <p className="text-sm text-text70">Mobile Number</p>
          <p className="font-medium text-sm text-primaryText">
            {userData?.phone_number || "NA"}
          </p>
        </div>

        {/* EMAIL */}
        <div>
          <p className="text-sm text-text70">Email ID</p>
          <p className="font-medium text-sm text-primaryText break-all">
            {userData?.user_email ? userData.user_email : userData.email}
          </p>
        </div>

        {/* DOB */}
        <div>
          <p className="text-sm text-text70">Date Of Birth</p>
          <p className="font-medium text-sm text-primaryText">
            {userData?.date_of_birth ? moment(userData.date_of_birth).format("MM-DD-YYYY") : "NA"}
          </p>
        </div>

        {/* ADDRESS */}
        {userData?.user_type === "TECHNICIAN" && (
          <div>
            <p className="text-sm text-text70">Address</p>

            <p className="font-medium text-sm text-primaryText">
              {formatAddress(userData)}
            </p>
            {/* {userData?.address_line && (
            <div className="flex items-center gap-1 text-secondary text-sm mt-1 cursor-pointer hover:underline">
              <MapPin className="w-4 h-4" /> Show On Map
            </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoCard;
