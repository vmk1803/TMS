"use client";

import Availability from "./Availability";
import NotesSection from "./NotesSection";
import OrdersPerformed from "./OrdersPerformed";
import PersonalInfoCard from "./PersonalInfoCard";
import { BacktIcon } from "../../../../../components/Icons";

interface UserDetailsPageProps {
  userId: string;
  userData: any;
}

export default function UserDetailsPage({ userId, userData }: UserDetailsPageProps) {
  return (
    <div className="bg-[#F9FAFB] p-4">
      <button
        type="button"
        onClick={() => history.back()}
        className="text-sm text-gray-600 mb-4 flex gap-1 items-center hover:text-green-600"
      >
        <BacktIcon /> User Details
      </button>

      <PersonalInfoCard userData={userData} />
      {userData?.user_type === "TECHNICIAN" && <OrdersPerformed userData={userData} />}
      {userData?.user_type === "TECHNICIAN" && <Availability userData={userData} />}
      {userData?.user_type === "TECHNICIAN" && <NotesSection userData={userData} />}
    </div>
  );
}
