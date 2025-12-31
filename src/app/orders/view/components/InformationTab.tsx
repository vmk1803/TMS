"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Pencil } from 'lucide-react'

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
    <div className="text-sm text-primaryText space-y-2">{children}</div>
  </div>
)

import { canEdit } from '../../../../utils/rbac'

const InformationTab = ({ orderData, isReadOnly = false }: { orderData?: any; isReadOnly?: boolean }) => {

  const getFullName = (t: any) => {
    if (!t) return "--";
    if (typeof t === "string") return t;
    return `${t.first_name ?? ""} ${t.middle_name ?? ""} ${t.last_name ?? ""}`.trim();
  };

  const formatUTCDateOnly = (d: any) => {
    if (!d) return "--";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "--";

    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const yyyy = date.getUTCFullYear();

    return `${mm}-${dd}-${yyyy}`;
  };

  const getCompleteAddress = (address: any) => {
    if (!address) return '--';
    if (typeof address === 'string') return address;
    return `${address.address_line1 ?? ''} ${address.address_line2 ?? ''} ${address.city ?? ''} ${address.state ?? ''} ${address.country ?? ''} ${address.zipcode ?? ''}`.trim();
  };
  const router = useRouter()

  const handleEditPatient = () => {
    if (orderData?.guid || orderData?.order_guid) {
      router.push(`/orders/createNeworder?step=1&orderGuid=${orderData.guid || orderData.order_guid}&mode=edit`)
    }
  }

  const handleEditOrder = () => {
    if (orderData?.guid || orderData?.order_guid) {
      router.push(`/orders/createNeworder?step=3&orderGuid=${orderData.guid || orderData.order_guid}&mode=edit`)
    }
  }

  const to12HourFormat = (time) => {
    if (!time) return "--";
    const [h, m] = time.split(":");

    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${String(hour).padStart(2, "0")}:${m} ${ampm}`;
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5">
        {/* Patient Information */}
        <InfoBox>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[20px] font-semibold text-primaryText">
              Patient Information
            </h3>
            {canEdit() && (
              <button
                onClick={handleEditPatient}
                className="text-green-600 hover:text-green-700"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>

          <hr className="border-gray-200 mb-4" />

          <div className="grid grid-cols-2 gap-y-2">
            <p className="text-text70 text-sm">Name</p>
            <p className="text-primaryText text-sm font-medium">
              {getFullName(orderData?.patient)}
            </p>

            <p className="text-text70 text-sm">Gender</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.patient?.gender || "--"}
            </p>

            <p className="text-text70 text-sm">Mobile Number</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.patient?.phone_no1 || "--"}
            </p>

            <p className="text-text70 text-sm">Email ID</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.patient?.email || "--"}
            </p>

            <p className="text-text70 text-sm">Date Of Birth</p>
            <p className="text-primaryText text-sm font-medium">
              {formatUTCDateOnly(orderData?.patient?.date_of_birth)}
            </p>

            {/* <p className="text-text70 text-sm">SSN</p>
            <p className="text-primaryText text-sm font-medium">--</p> */}

            <p className="text-text70 text-sm">Billing Type</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.billing_type || "--"}
            </p>

            <p className="text-text70 text-sm">Primary Insurance</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.primary_insurance?.name || "--"}
            </p>

            <p className="text-text70 text-sm">Primary Insurance Number</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.primary_insurance_policy_number || "--"}
            </p>

            <p className="text-text70 text-sm">Secondary Insurance</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.secondary_insurance?.name || "--"}
            </p>

            <p className="text-text70 text-sm">Secondary Insurance Number</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.secondary_insurance_policy_number || "--"}
            </p>

            <p className="text-text70 text-sm">Address</p>
            <div>
              <p className="text-primaryText text-sm font-medium">
                {getCompleteAddress(orderData?.patient_address)}
              </p>
              {/* <p className="flex items-center gap-2 text-green-600 text-sm font-medium mt-1 cursor-pointer">
                <MapPin size={14} /> Show On Map
              </p> */}
            </div>

            <p className="text-text70 text-sm">Home Bound</p>
            <p className="text-primaryText text-sm font-medium">{orderData?.patient?.home_bound_status == false ? "NO" : "YES"}</p>
            <p className="text-text70 text-sm">Hard Stick</p>
            <p className="text-primaryText text-sm font-medium">{orderData?.patient?.hard_stick == false ? "NO" : "YES"}</p>
            <p className="text-text70 text-sm">Notes</p>
            <p className="text-primaryText text-sm font-medium">{orderData?.patient?.patient_notes || "--"}</p>
          </div>
        </InfoBox>

        {/* Technician Information */}

        {/* Client Information */}
        <InfoBox>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[20px] font-semibold text-primaryText">
              Client Information
            </h3>
            {/* {canEdit() && (
              <button className="text-green-600 hover:text-green-700">
                <Pencil size={18} />
              </button>
            )} */}
          </div>
          <hr className="border-gray-200 mb-4" />

          {/* Client Details */}
          <div className="grid grid-cols-2 gap-y-2">
            <p className="text-text70 text-sm">Name</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.partner?.name || "--"}
            </p>

            <p className="text-text70 text-sm">Mobile Number</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.partner?.phone || "--"}
            </p>

            <p className="text-text70 text-sm">Email ID</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.partner?.email || "--"}
            </p>

            <p className="text-text70 text-sm">Address</p>
            <div>
              <p className="text-primaryText text-sm font-medium">
                {getCompleteAddress(orderData?.partner)}
              </p>
              {/* <p className="flex items-center gap-2 text-green-600 text-sm font-medium mt-1 cursor-pointer">
                <MapPin size={14} /> Show On Map
              </p> */}
            </div>

            {/* <p className="text-text70 text-sm">Notes</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.partner?.notes || "--"}
            </p> */}
          </div>
        </InfoBox>
        <InfoBox>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[20px] font-semibold text-primaryText">
              Provider Information
            </h3>
            {/* {canEdit() && (
              <button className="text-green-600 hover:text-green-700">
                <Pencil size={18} />
              </button>
            )} */}
          </div>

          <hr className="border-gray-200 mb-4" />

          {/* Provider Details */}
          <div className="grid grid-cols-2 gap-y-2">
            <p className="text-text70 text-sm">Name</p>
            <p className="text-primaryText text-sm font-medium">
              {getFullName(orderData?.physician)}
            </p>

            <p className="text-text70 text-sm">Mobile Number</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.physician?.phone_number || "--"}
            </p>

            <p className="text-text70 text-sm">Email ID</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.physician?.email || "--"}
            </p>

            <p className="text-text70 text-sm">Address</p>
            <div>
              <p className="text-primaryText text-sm font-medium">
                {getCompleteAddress(orderData?.physician)}
              </p>
              {/* <p className="flex items-center gap-2 text-green-600 text-sm font-medium mt-1 cursor-pointer">
                <MapPin size={14} /> Show On Map
              </p> */}
            </div>

            {/* <p className="text-text70 text-sm">Notes</p>
            <p className="text-primaryText text-sm font-medium">--</p> */}
          </div>
        </InfoBox>
      </div>
      <div className="lg:col-span-7">
        <InfoBox>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[20px] font-semibold text-primaryText">
              Order Information
            </h3>
            {canEdit() && (
              <button
                onClick={handleEditOrder}
                className="text-green-600 hover:text-green-700"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>

          <hr className="border-gray-200 mb-4" />

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-y-2">
            <p className="text-text70 text-sm">Order Type</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.order_type || "--"}
            </p>
            {orderData?.order_type === "STANDING ORDER" && (
              <>
                <p className="text-text70 text-sm">Start Date</p>
                <p className="text-primaryText text-sm font-medium">
                  {orderData?.standing_start_date || "--"}
                </p>
                <p className="text-text70 text-sm">End Date</p>
                <p className="text-primaryText text-sm font-medium">
                  {orderData?.standing_end_date || "--"}
                </p>
                <p className="text-text70 text-sm">Frequency</p>
                <p className="text-primaryText text-sm font-medium">
                  {orderData?.standing_frequency || "--"}
                </p>
              </>
            )}
            <p className="text-text70 text-sm">Services</p>
            <p className="text-primaryText text-sm font-medium">
              {Array.isArray(orderData?.services) ? orderData.services.join(', ') : (orderData?.services || "--")}
            </p>

            <p className="text-text70 text-sm">Service Date</p>
            <p className="text-primaryText text-sm font-medium">
              {formatUTCDateOnly(orderData?.date_of_service) || "--"}
            </p>

            <p className="text-text70 text-sm">Service Address</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.service_address || "--"}
            </p>

            <p className="text-text70 text-sm">Appointment Time</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.appointment_time || "--"}
            </p>

            <p className="text-text70 text-sm">Fasting</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.fasting ? "YES" : "NO"}
            </p>

            <p className="text-text70 text-sm">Warning</p>
            <p className="text-primaryText text-sm font-medium">{orderData?.order_notes || "--"}</p>

            <p className="text-text70 text-sm">Urgency</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.urgency || "--"}
            </p>

            {/* <p className="text-text70 text-sm">Interface Order</p>
            <p className="text-primaryText text-sm font-medium leading-relaxed">
              {orderData?.interface_order || '--'}
            </p>

            <p className="text-text70 text-sm font-medium">Results CC Information</p>
            <p className="text-primaryText text-sm font-medium">{orderData?.results_cc || '--'}</p> */}

            <p className="text-text70 text-sm">Dx Code Information</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.icd_code?.map((dx: any) => `[${dx}]`).join(", ") ||
                "--"}
            </p>
          </div>
        </InfoBox>
        <InfoBox>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[20px] font-semibold text-primaryText">
              Lab Test Information
            </h3>
          </div>
          <hr className="border-gray-200 mb-4" />

          {/* Technician Details */}
          <div className="grid grid-cols-2 gap-y-2">
            <p className="text-text70 text-sm">Ordered Tests</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.test_info
                ?.map((test) => `[${test.test_code}]`)
                .join(" ") || "--"}
            </p>

            <p className="text-text70 text-sm">Test Tube</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.tube_data
                ?.map((tube) => `[${tube.tube_name}][${tube.tube_count}]`)
                .join(" ") || "--"}
            </p>

            {orderData?.return_visit_data?.slice().reverse().map((visit, index) => (
              <React.Fragment key={index}>
                <p className="text-text70 text-sm font-bold">
                  Collected Tests (Visit {index + 1})
                </p>
                <p className="text-primaryText text-sm font-medium">
                  {visit.completed_tests?.join(", ") || "--"}
                </p>
                <p className="text-text70 text-sm font-bold">Collected Tubes</p>
                <p className="text-primaryText text-sm font-medium">
                  {visit?.completed_tubes
                    ?.map((tube) => tube.tube_count > 0 ? `[${tube.tube_name}][${tube.tube_count}]` : null)
                    .join(" ") || "--"}
                </p>
                {visit?.test_data?.length > 0 && (
                  <>
                    <p className="text-text70 text-sm">Pending Tests</p>
                    <p className="text-primaryText text-sm font-medium">
                      {visit?.test_data?.map(test => `[${test.test_name}]`).join(" ") || "--"}
                    </p>
                  </>
                )}

                {visit?.tubes_data?.length > 0 && (
                  <>
                    <p className="text-text70 text-sm">Pending Tubes</p>
                    <p className="text-primaryText text-sm font-medium">
                      {visit?.tubes_data
                        ?.map((tube) => `[${tube.tube_name}][${tube.tube_count}]`)
                        .join(" ") || "--"}
                    </p>
                  </>)}
              </React.Fragment>
            ))}

            <p className="text-text70 text-sm">Laboratory</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.delivered_lab || "--"}
            </p>

            {/* Important Note */}
            <p className="text-red-500 text-sm font-medium mt-4">
              Note: Please review important Lab Test Notes
            </p>
          </div>
        </InfoBox>
        <InfoBox>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[20px] font-semibold text-primaryText">
              Technician Information
            </h3>
          </div>
          <hr className="border-gray-200 mb-4" />

          {/* Technician Details */}
          <div className="grid grid-cols-2 gap-y-2">
            <p className="text-text70 text-sm">Name</p>
            <p className="text-primaryText text-sm font-medium">
              {getFullName(orderData?.technician) || "--"}
            </p>

            <p className="text-text70 text-sm">Email ID</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.technician?.email || "--"}
            </p>

            <p className="text-text70 text-sm">Mobile Number</p>
            <p className="text-primaryText text-sm font-medium">
              {orderData?.technician?.phone_number || "--"}
            </p>
          </div>
        </InfoBox>
      </div>
    </div>
  );
}

export default InformationTab
