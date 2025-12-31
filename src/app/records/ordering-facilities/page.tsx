'use client';
import React, { useState, useRef } from 'react'
import Title from '../../../components/common/Title'
import ButtonDarkRounded from '../../../components/common/ButtonDarkRounded'
import ButtonLight from '../../../components/common/ButtonLight'
import { ExportIcon, PlusIcon } from '../../../components/Icons'
import OrderingFacilitiesTable, { OrderingFacilitiesTableRef } from './components/OrderingFacilitiesTable';
import Toast from '../../../components/common/Toast';
import { canCreate } from '../../../utils/rbac';

const Page = () => {
  const tableRef = useRef<OrderingFacilitiesTableRef>(null);
  const [selectedGuids, setSelectedGuids] = useState<string[]>([]);
  const [clearSelectionKey, setClearSelectionKey] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const handleExportRequest = () => {
    if (selectedGuids.length === 0) {
      setToastType('info');
      setToastMessage('Please select facility to export');
      setToastOpen(true);
      return;
    }
    tableRef.current?.exportSelected();
  };

  const handleExportComplete = (count: number) => {
    setSelectedGuids([]);
    setClearSelectionKey((k) => k + 1);
    setToastType('success');
    setToastMessage(`Successfully exported ${count} facility(ies)`);
    setToastOpen(true);
  };

  return (
    <>
      <div className='flex justify-between'>
        <Title
          heading="Ordering Facilities"
          subheading="Monitor, organize, and coordinate all facility location in one place"
        />
        <div className="flex gap-3">
          <ButtonLight
            label="Export CSV"
            Icon={ExportIcon}
            onClick={handleExportRequest}
            disabled={selectedGuids.length === 0}
            count={selectedGuids.length}
          />
          {canCreate() && (
            <ButtonDarkRounded label="New Ordering Facility" Icon={PlusIcon} link="/records/ordering-facilities/new" />
          )}
        </div>
      </div>
      <div className='flex flex-col border border-tableBorder rounded-xl mt-4 '>
        <OrderingFacilitiesTable
          ref={tableRef}
          onSelectionChange={setSelectedGuids}
          clearSelectionKey={clearSelectionKey}
          selectedGuids={selectedGuids}
          onExportComplete={handleExportComplete}
        />
      </div>
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </>
  )
}

export default Page