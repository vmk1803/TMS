"use client";
import React, { useState } from "react";
import EventsTable from "./EventsTable";
import EventsTabs from "./EventsTabs";
import { useGlobalAudits } from "../hooks/globalAuditsHook";

interface EventsPageProps {
  selectedRows: any[];
  setSelectedRows: (rows: any[]) => void;
}

const EventsPage: React.FC<EventsPageProps> = ({ selectedRows, setSelectedRows }) => {
  const [activeTab, setActiveTab] = useState<"Events">("Events");
  const audits = useGlobalAudits(1, 10);

  return (
    <div className="bg-white rounded-xl">
      <EventsTabs activeTab={activeTab} setActiveTab={setActiveTab} audits={audits as any} />

      {/* Tab Content */}
      <div className="p-4 overflow-x-auto scrollbar-custom">
        {activeTab === "Events" && <EventsTable audits={audits as any} selectedRows={selectedRows} setSelectedRows={setSelectedRows} />}
      </div>
    </div>
  );
};

export default EventsPage;
