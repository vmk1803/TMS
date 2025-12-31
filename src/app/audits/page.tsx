'use client';
import React from 'react'
import Title from '../../components/common/Title'
import { AssignIcon } from '../../components/Icons'
import ButtonLight from '../../components/common/ButtonLight'
import EventsPage from './components/EventsPage';

import { exportToCSV } from '../../utils/exportToCSV';

const page = () => {
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);

  const handleExport = () => {
    if (selectedRows.length > 0) {
      // Map to only include visible table columns
      const exportData = selectedRows.map((row: any) => ({
        "Timestamp": row.changed_at ? new Date(row.changed_at).toLocaleString('en-US') : "--",
        "Entity Type": row.entity_type ?? "--",
        "Action": row.action ?? "--",
        "Actor": row.actor_name ?? "--",
        "Summary": row.summary ?? "--",
        "Difference": row.difference ?? "--"
      }));
      
      exportToCSV(exportData, "audits_export");
      setSelectedRows([]);
    }
  };

  return (
    <>
      <div className='flex justify-between'>

        <Title
          heading="Audit"
          subheading="Complete audit trail and event history for compliance and analysis"
        />
        <div className="flex gap-3">
          <div onClick={handleExport}>
            <ButtonLight label="Export CSV" Icon={AssignIcon} disabled={selectedRows.length === 0} count={selectedRows.length} />
          </div>
        </div>

      </div>
      <div className='flex flex-col border border-tableBorder rounded-xl mt-4 '>
        <EventsPage selectedRows={selectedRows} setSelectedRows={setSelectedRows} />
      </div>
    </>
  )
}

export default page