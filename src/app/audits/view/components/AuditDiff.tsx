"use client";
import React, { useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { formatUTCToCSTString, getGlobalAudits } from "../../services/GlobalAuditsService";
import { auditTimeConversionFields } from "@/types/UserTableData";
import {
  auditOrderFieldsToShow,
  auditTestTubeFieldsToShow,
  auditUserFieldsToShow,
  auditTestFieldsToShow,
  auditPartnerFieldsToShow,
  auditPhysicianFieldsToShow,
  auditInsuranceFieldsToShow
} from "@/lib/auditEnum";
 
const AuditDiff = () => {
 
  const [singleAuditData, setSingleAuditData] = React.useState<any>(null);
  const [auditData, setAuditData] = React.useState<any>(null);
  const [auditItemMeta, setAuditItemMeta] = React.useState<any>(null);
  const [changedBy, setChangedBy] = React.useState<string | null>(null);
 
  const searchParams = useSearchParams();
  const auditGuid = searchParams?.get('auditGuid');
 
  useEffect(() => {
    async function fetchAudit() {
      if (!auditGuid) return;
 
      const filter = { guid: auditGuid };
      const response = await getGlobalAudits(1, 10, filter);
 
      if (response?.data?.length > 0) {
        const item = response.data[0];
 
        setAuditItemMeta(item?.table_name || null);
        setAuditData(item.old_data);
        setSingleAuditData(item.new_data);
        setChangedBy(item.changed_person || null);
      }
    }
 
    fetchAudit();
  }, [auditGuid]);
 
  const diffData = singleAuditData || {};
 
  // -----------------------------
  // ENTITY FIELD HANDLER
  // -----------------------------
  const entityType = auditItemMeta;
 
  const getEntityFields = () => {
    if (entityType === 'Order' || entityType === 'order') return auditOrderFieldsToShow;
    if (entityType === 'User') return auditUserFieldsToShow;
    if (entityType === 'Test Tube') return auditTestTubeFieldsToShow;
    if (entityType === 'Test') return auditTestFieldsToShow;
    if (entityType === 'Partner') return auditPartnerFieldsToShow;
    if (entityType === 'Physician') return auditPhysicianFieldsToShow;
    if (entityType === 'insurance') return auditInsuranceFieldsToShow;
    return [];
  };
 
  const entityFields = getEntityFields();
 
  let mergedDiff: any = { ...diffData };
 
  if (diffData["Updated At"] || diffData["Updated By"]) {
    mergedDiff = {
      ...diffData,
      "Updated Info": {
        changed_person: changedBy ?? null,
        updated_at: diffData["Updated At"]?.new ?? null
      }
    };
   
    delete mergedDiff["Updated At"];
    delete mergedDiff["Updated By"];
  }
  return (
    <>
      {auditData && (
        <div className="bg-[#F6F9FB] rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-green-700 mb-3">
            {entityType} Details
          </h3>
          <hr className="border-gray-200 mb-4" />
 
          <div className="space-y-3">
            {entityFields.length === 0 && (
              <div className="text-sm text-gray-600">No fields defined.</div>
            )}
 
            {entityFields.map(({ key, label }: any) => {
              const val = auditData?.[key];
 
              if (val == null) return null;
              if (typeof val === "object" && !Array.isArray(val)) return null;
              let display = "--";
 
              if (key === 'patient_dob' && val && typeof val === 'string') {
                // Convert yyyy-mm-dd to mm-dd-yyyy
                const dateMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (dateMatch) {
                  const [, year, month, day] = dateMatch;
                  display = `${month}-${day}-${year}`;
                } else {
                  display = String(val);
                }
              } else if (Array.isArray(val)) {
                const primitives = val.filter(
                  (v: any) => v == null || ["string", "number", "boolean"].includes(typeof v)
                );
                display = primitives.length > 0 ? primitives.join(", ") : "--";
              } else if (typeof val === "boolean") {
                display = val ? "YES" : "NO";
              } else {
                display = String(val);
              }
 
              return (
                <div className="flex items-center" key={key}>
                  <span className="text-[#495057] font-semibold w-[200px]">{label}</span>
                  <span className="text-sm font-semibold text-gray-700">{display}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="bg-[#F6F9FB] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-green-700 mb-3">Changed details</h3>
        <hr className="border-gray-200 mb-4" />
 
        <div className="space-y-6">
 
          {Object.entries(mergedDiff || {}).map(([label, values]: any, idx) => {
 
            // Updated By + Updated At
            if (label === "Updated Info") {
              return (
                <div key={idx}>
 
                  <div className="grid grid-cols-2 gap-4">
 
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Updated By</p>
                      <p className="text-sm font-semibold text-green-700">
                        {values.changed_person ?? "--"}
                      </p>
                    </div>
 
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Updated At</p>
                      <p className="text-sm font-semibold text-green-700">
                        {values.updated_at
                          ? formatUTCToCSTString(values.updated_at)
                          : "--"}
                      </p>
                    </div>
 
                  </div>
                </div>
              );
            }
            return (
              <div key={idx}>
                <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
 
                <div className="grid grid-cols-2 gap-4">
 
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Before</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {auditTimeConversionFields.includes(label)
                        ? formatUTCToCSTString(values.old)
                        : values.old ?? "--"}
                    </p>
                  </div>
 
                  <div>
                    <p className="text-xs text-gray-500 mb-1">After</p>
                    <p className="text-sm font-semibold text-green-600">
                      {auditTimeConversionFields.includes(label)
                        ? formatUTCToCSTString(values.new)
                        : values.new ?? "--"}
                    </p>
                  </div>
 
                </div>
              </div>
            );
 
          })}
        </div>
      </div>
    </>
  );
};
 
export default AuditDiff;