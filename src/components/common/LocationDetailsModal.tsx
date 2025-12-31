'use client'

import { Modal } from 'antd'
import LocationDetails from '@/app/user-management/locations/LocationDetails'

interface LocationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  data: any
  onEdit: () => void
}

export default function LocationDetailsModal({
  isOpen,
  onClose,
  data,
  onEdit,
}: LocationDetailsModalProps) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      destroyOnClose
    >
      <LocationDetails data={data} onEdit={onEdit} />
    </Modal>
  )
}
