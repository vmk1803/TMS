"use client"
import React, { useEffect, useState } from 'react';
import { Edit3 } from 'lucide-react';
import { useAppSelector } from '../../../../store/hooks';
import { useRouter } from 'next/navigation';
import { getAllPartners } from '../services/ordersService';

const PreviewInformation: React.FC = () => {
  // ---- DATA FROM STORE ----
  const personal = useAppSelector((s: any) => s.orders.personal || {});
  const caseInfo = useAppSelector((s: any) => s.orders.caseInfo || {});
  const orderInfo = useAppSelector((s: any) => s.orders.orderInfo || {});
  const insurance = useAppSelector((s: any) => s.orders.insurance || {});

  // ---- PARTNER FETCHING ----
  const [partners, setPartners] = useState<any[]>([]);
  const [partnersLoaded, setPartnersLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllPartners();
        if (mounted) setPartners(data);
      } catch (e) {
        // ignore errors
      } finally {
        if (mounted) setPartnersLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ---- HELPERS ----
  const orderingFacilityName = React.useMemo(() => {
    if (!caseInfo.orderingFacility) return '-';
    const p = partners.find((x) => String(x.guid) === String(caseInfo.orderingFacility));
    return p?.name || (partnersLoaded ? '-' : '');
  }, [caseInfo.orderingFacility, partners, partnersLoaded]);

  const selectedTestNames = React.useMemo(() => {
    const list = Array.isArray(caseInfo.selectedTests) ? caseInfo.selectedTests : [];
    return list.length ? list.map((t: any) => t?.test_name).filter(Boolean).join(', ') : '-';
  }, [caseInfo.selectedTests]);

  const pickupAddressPreview = React.useMemo(() => {
    if (personal.addPickupAddress === true) {
      const address = `${personal.address1 ?? ''} ${personal.address2 ?? ''} ${personal.city ?? ''}`.trim();
      return address || '-';
    }
    const line = `${personal.pickup_address1 ?? ''} ${personal.pickup_address2 ?? ''} ${personal.pickup_city ?? ''}`.trim();
    return line || '-';
  }, [
    personal.addPickupAddress,
    personal.address1,
    personal.address2,
    personal.city,
    personal.pickup_address1,
    personal.pickup_address2,
    personal.pickup_city,
  ]);

  // ---- SECTION DATA ----
  const personalDetails = [
    { label: 'Full Name', value: `${personal.firstName ?? ''} ${personal.middleName ?? ''} ${personal.lastName ?? ''}`.trim() || '-' },
    { label: 'Gender', value: personal.gender ?? '-' },
    { label: 'Date of Birth', value: personal.dob ?? '-' },
    { label: 'Mobile Number 1', value: personal.mobile1 ?? '-' },
    { label: 'Email ID', value: personal.email ?? '-' },
    { label: 'Address', value: `${personal.address1 ?? ''} ${personal.address2 ?? ''} ${personal.city ?? ''}`.trim() || '-' },
    { label: 'Race', value: personal.race ?? '-' },
    { label: 'Ethnicity', value: personal.ethnicity ?? '-' },
    { label: 'Homebound Patient', value: personal.homebound ? 'Yes' : 'No' },
    { label: 'Hard Stick', value: personal.hardStick ? 'Yes' : 'No' },
    { label: 'Patient Notes', value: personal.patientNotes ?? '-' },
    { label: 'Pickup Address', value: pickupAddressPreview },
  ];

  const caseInformation = [
    { label: 'Tests', value: selectedTestNames },
    { label: 'ICD Codes', value: caseInfo.icdCodes ?? '-' },
    { label: 'Ordering Facility', value: orderingFacilityName || '-' },
    { label: 'Ordering Physician', value: caseInfo.orderingPhysicianName ?? caseInfo.orderingPhysician ?? '-' },
    { label: 'Services', value: Array.isArray(caseInfo.services) ? caseInfo.services.join(', ') : (caseInfo.services ?? '-') },
  ];

  const orderInformation = [
    { label: 'Order Type', value: orderInfo.orderType ?? '-' },
    { label: 'Date of Service', value: orderInfo.dateOfService ?? '-' },
    { label: 'Appointment Time', value: orderInfo.appointmentTime ?? '-' },
    { label: 'Urgency', value: orderInfo.urgency ?? '-' },
    { label: 'Warning Notes', value: orderInfo.warningNotes ?? '-' },
    ...(orderInfo.orderType === 'STANDING ORDER' ? [
      { label: 'Start Date', value: orderInfo.startDate ?? '-' },
      { label: 'End Date', value: orderInfo.endDate ?? '-' },
      { label: 'Frequency', value: orderInfo.frequency ?? '-' },
      { label: 'Fasting', value: orderInfo.fasting ? 'Yes' : 'No' },
    ] : []),
  ];

  const insuranceInfo = [
    { label: 'Billing Type', value: orderInfo.billingType ?? '-' },
    ...(orderInfo.billingType === 'INSURANCE' ? [
      { label: 'Primary Insurance Name', value: insurance.primaryInsuranceName ?? '-' },
      { label: 'Primary Carrier Code', value: insurance.carrierCode ?? '-' },
      { label: 'Primary Policy Number', value: insurance.primaryPolicyNumber ?? '-' },
      { label: 'Primary Group Number', value: insurance.primaryGroupNumber ?? '-' },
      { label: 'Primary Relationship', value: insurance.primaryRelationship ?? '-' },
    ] : []),
    ...(insurance.secondaryInsuranceGuid ? [
      { label: 'Secondary Insurance Name', value: insurance.secondaryInsuranceName ?? '-' },
      { label: 'Secondary Carrier Code', value: insurance.secondaryCarrierCode ?? '-' },
      { label: 'Secondary Policy Number', value: insurance.secondaryPolicyNumber ?? '-' },
      { label: 'Secondary Group Number', value: insurance.secondaryGroupNumber ?? '-' },
      { label: 'Secondary Relationship', value: insurance.secondaryRelationship ?? '-' },
    ] : []),
  ];

  // ---- REUSABLE SECTION RENDER ----
  const router = useRouter();
  const renderSection = (title: string, data: { label: string; value: string }[], step?: number) => (
    <div className="bg-formBg rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-semibold text-primaryText">{title}</h3>
        <button
          className="text-green-600 hover:text-green-700"
          onClick={() => {
            if (typeof step === 'number') router.push(`/orders/createNeworder?step=${step}`);
            else router.push('/orders/createNeworder');
          }}
        >
          <Edit3 size={18} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <p className="text-sm text-formLabel mb-1">{item.label}</p>
            <p className="text-[15px] font-medium text-primaryText break-all">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ---- MAIN RENDER ----
  return (
    <div className="bg-white rounded-xl">
      {renderSection('Personal Details', personalDetails, 1)}
      {renderSection('Case Information', caseInformation, 2)}
      {renderSection('Order Info', orderInformation, 3)}
      {renderSection('Billing Information', insuranceInfo, 4)}
    </div>
  );
};

export default PreviewInformation;
