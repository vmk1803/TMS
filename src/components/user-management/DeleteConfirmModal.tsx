'use client'

import { Modal, Button } from 'antd'

interface Props {
  open: boolean
  title?: string
  description?: string
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteConfirmModal({
  open,
  title = 'Delete Group',
  description = 'Do You Really Want To Delete Group?',
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal
      open={open}
      footer={null}
      centered
      onCancel={onCancel}
      width={420}
    >
      <div className="text-center py-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>

        <div className="flex justify-center gap-4">
          <Button onClick={onCancel}>No</Button>
          <Button
            type="primary"
            className="bg-secondary"
            onClick={onConfirm}
          >
            Yes
          </Button>
        </div>
      </div>
    </Modal>
  )
}
