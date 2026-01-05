"use client";
import React, { useState, useRef } from 'react'
import Title from '../../../components/common/Title'
import ButtonDarkRounded from '../../../components/common/ButtonDarkRounded'
import ButtonLight from '../../../components/common/ButtonLight'
import { ExportIcon, PlusIcon } from '../../../components/Icons'
import UserTable, { UserTableRef } from './components/UserTable';
import Toast from '../../../components/common/Toast';
import { canCreate } from '../../../utils/rbac'

const Userspage = () => {
  const tableRef = useRef<UserTableRef>(null);
  const [selectedGuids, setSelectedGuids] = useState<string[]>([]);
  const [clearSelectionKey, setClearSelectionKey] = useState(0);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const handleExportRequest = () => {
    if (selectedGuids.length === 0) {
      setToastType('info');
      setToastMessage('Please select user to export');
      setToastOpen(true);
      return;
    }
    // Call the export method via ref
    tableRef.current?.exportSelected();
  };

  const handleExportComplete = (count: number) => {
    // Clear selection after export
    setSelectedGuids([]);
    setClearSelectionKey((k) => k + 1);

    // Show success toast
    setToastType('success');
    setToastMessage(`Successfully exported ${count} user(s)`);
    setToastOpen(true);
  };

  return (
    <>
      <div className='flex justify-between'>
        <Title
          heading="User Management"
          subheading="Manage user accounts, roles, and permissions across the organization"
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
            <ButtonDarkRounded label="New User" Icon={PlusIcon} link="/records/users/new" />
          )}
        </div>
      </div>
      <div className='flex flex-col border border-tableBorder rounded-xl mt-4 '>
        <UserTable
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

export default Userspage