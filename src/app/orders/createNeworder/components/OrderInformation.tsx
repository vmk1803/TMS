"use client"
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { updateField } from '../../../../store/ordersSlice'
import { Calendar, Clock, FileText, Trash2, Eye, ChevronDown } from 'lucide-react'
import { APPOINTMENT_TYPE_OPTIONS, ORDER_TYPE_OPTIONS, URGENCY_OPTIONS } from '../../../../lib/orderEnums'
import { useOrderForm } from '../hooks/useOrderForm'
import FileUploadBox from '../../../records/testtubes/new/components/FileUploadBox'
import DateCalenderPicker from '../../../../components/common/DateCalenderPicker'
import DocumentViewerModal from '../../../../components/common/DocumentViewerModal'
import { useFileUploadManager } from '../hooks/useFileUploadManager'
import CustomSelect from '../../../../components/common/CustomSelect'

const OrderInformation: React.FC<{ submitAttempted?: boolean }> = ({ submitAttempted = false }) => {
  const dispatch = useAppDispatch()
  const orderInfo = useAppSelector((s: any) => s.orders.orderInfo || {})
  const orderGuid = useAppSelector((s: any) => s.orders.orderGuid)
  const { validateSection } = useOrderForm()
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [viewDocument, setViewDocument] = useState<{ name: string; url: string; size?: number; file?: File } | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  // Use file upload manager to store File objects separately from Redux
  const { addFile, removeFile } = useFileUploadManager()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    setTouched((prev) => ({ ...prev, [target.name]: true }))
    dispatch(updateField({ section: 'orderInfo', field: target.name, value }))

    // When switching away from STANDING ORDER, clear standing-specific fields
    if (target.name === 'orderType' && value !== 'STANDING ORDER') {
      dispatch(updateField({ section: 'orderInfo', field: 'startDate', value: '' }))
      dispatch(updateField({ section: 'orderInfo', field: 'endDate', value: '' }))
      dispatch(updateField({ section: 'orderInfo', field: 'frequency', value: '' }))
      // Note: fasting is now mandatory for all order types, so we don't clear it
    }
  }

  useEffect(() => {
    const v = validateSection('orderInfo')
    setErrors(v)
  }, [orderInfo])

  const getFieldError = (fieldName: string) => {
    return (touched[fieldName] || submitAttempted) && errors[fieldName] ? errors[fieldName][0] : null
  }

  const handleDateChange = (field: 'dateOfService' | 'startDate' | 'endDate', date: string | null) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    dispatch(updateField({ section: 'orderInfo', field, value: date || '' }))
  }

  const handleAddDocument = (file: File) => {
    if (!file) return

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(file.type)) {
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      return
    }

    const existing = Array.isArray(orderInfo.uploadDocuments) ? orderInfo.uploadDocuments : []

    // Generate unique ID for this document
    const docId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Store File object using the file upload manager
    addFile(docId, file)

    // Store only serializable metadata in Redux
    const newDoc = {
      id: docId,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      isNewUpload: true, // Flag to identify new uploads vs existing attachments
    }

    dispatch(
      updateField({
        section: 'orderInfo',
        field: 'uploadDocuments',
        value: [...existing, newDoc],
      })
    )
  }

  const handleRemoveDocument = (index: number) => {
    const existing = Array.isArray(orderInfo.uploadDocuments) ? orderInfo.uploadDocuments : []
    if (!existing.length) return

    const docToRemove = existing[index]

    // Remove from file manager if it's a new upload
    if (docToRemove?.id) {
      removeFile(docToRemove.id)
    }

    const updated = existing.filter((_: any, i: number) => i !== index)
    dispatch(
      updateField({
        section: 'orderInfo',
        field: 'uploadDocuments',
        value: updated,
      })
    )
  }

  const handleViewDocument = async (doc: any) => {
    // If it's a new upload, we already have the blob URL
    if (doc.isNewUpload) {
      setViewDocument(doc)
      setIsViewerOpen(true)
      return
    }

    // For existing documents, we need to fetch the view URL
    // Use the orderGuid from Redux state

    if (!orderGuid) {
      // Fallback to existing URL if available
      if (doc.url) {
        setViewDocument(doc)
        setIsViewerOpen(true)
      }
      return
    }

    try {
      const { getAttachmentsForOrder } = await import('../../view/services/viewOrderService')
      // Use doc.url (which contains the full path/key from API) instead of doc.name
      const url = await getAttachmentsForOrder(orderGuid, doc.url)

      if (url) {
        setViewDocument({
          ...doc,
          url: url
        })
        setIsViewerOpen(true)
      } else {
        console.error('No URL returned for attachment')
      }
    } catch (error) {
      console.error('Error fetching attachment URL:', error)
    }
  }

  const handleCloseViewer = () => {
    setIsViewerOpen(false)
    setViewDocument(null)
  }

  const parseMMDDYYYY = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("-").map((p) => p.trim());
    if (parts.length !== 3) return null;
    const [mmStr, ddStr, yyyyStr] = parts;
    const mm = Number(mmStr);
    const dd = Number(ddStr);
    const yyyy = Number(yyyyStr);
    if (!yyyy || !mm || !dd) return null;
    const d = new Date(yyyy, mm - 1, dd + 1);
    return isNaN(d.getTime()) ? null : d;
  };

  useEffect(() => {
    const s = parseMMDDYYYY(orderInfo.startDate);
    const e = parseMMDDYYYY(orderInfo.endDate);
    if (s && e && e < s) {
      dispatch(updateField({ section: 'orderInfo', field: 'endDate', value: '' }));
    }
  }, [orderInfo.startDate]);
  const isToday = (dateStr?: string): boolean => {
    if (!dateStr) return false;

    const [mm, dd, yyyy] = dateStr.split("-").map(Number);
    if (!mm || !dd || !yyyy) return false;

    const today = new Date();
    return (
      today.getFullYear() === yyyy &&
      today.getMonth() === mm - 1 &&
      today.getDate() === dd
    );
  };

  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.trim().split(" ");
    const [h, m] = time.split(":").map(Number);

    let hours = h % 12;
    if (period === "PM") hours += 12;

    return hours * 60 + m;
  };

  const getSlotRangeMinutes = (range: string) => {
    const [startStr, endStr] = range.split(" - ");

    const start = timeToMinutes(startStr);
    let end = timeToMinutes(endStr);
    if (end === 0 && start > 0) end = 1440;

    return { start, end };
  };


  const getFilteredAppointmentOptions = (
    options: { label: string; value: string }[],
    dateOfService?: string
  ) => {
    if (!dateOfService || !isToday(dateOfService)) {
      return options;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return options.filter((opt) => {
      if (!opt.value) return false;

      const { end } = getSlotRangeMinutes(opt.value);
      return end > currentMinutes;
    });
  };


  return (
    <div className="bg-white rounded-xl">
      {/* Section Title */}
      <h2 className="text-[20px] font-semibold text-primaryText mb-6">
        Order Information
      </h2>

      {/* Top Fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Order Type */}
        <div>
          <CustomSelect
            label="Order Type"
            value={orderInfo.orderType ?? ''}
            options={ORDER_TYPE_OPTIONS}
            onChange={(val) => {
              setTouched((prev) => ({ ...prev, orderType: true }))
              dispatch(updateField({ section: 'orderInfo', field: 'orderType', value: val }))
              if (val !== 'STANDING ORDER') {
                dispatch(updateField({ section: 'orderInfo', field: 'startDate', value: '' }))
                dispatch(updateField({ section: 'orderInfo', field: 'endDate', value: '' }))
                dispatch(updateField({ section: 'orderInfo', field: 'frequency', value: '' }))
              }
            }}
            required
          />
          {getFieldError('orderType') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('orderType')}</p>
          )}
        </div>

        {/* Date of Service */}
        {/* Date of Service */}
        <div>
          <label className="block text-sm text-primaryText mb-2 font-medium">
            Date of Service <span className="text-red-500">*</span>
          </label>

          <DateCalenderPicker
            name="dateOfService"
            value={orderInfo.dateOfService ?? ""}
            onChange={(d) => handleDateChange("dateOfService", d)}
            error={!!getFieldError("dateOfService")}
            placeholder="MM-DD-YYYY"
          />

          {getFieldError("dateOfService") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("dateOfService")}
            </p>
          )}
        </div>

        {/* Appointment Time */}
        <div>
          <CustomSelect
            label="Appointment Time"
            value={orderInfo.appointmentTime ?? ""}
            options={getFilteredAppointmentOptions(
              APPOINTMENT_TYPE_OPTIONS,
              orderInfo.dateOfService
            )}
            onChange={(val) => {
              setTouched((prev) => ({ ...prev, appointmentTime: true }));
              dispatch(
                updateField({
                  section: "orderInfo",
                  field: "appointmentTime",
                  value: val,
                })
              );
            }}
          />

          {orderInfo.appointmentTime && (
            <button
              type="button"
              onClick={() => {
                dispatch(
                  updateField({
                    section: "orderInfo",
                    field: "appointmentTime",
                    value: "",
                  })
                );
              }}
              className="absolute right-10 top-[36px] text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          )}
          {isToday(orderInfo.dateOfService) &&
            getFilteredAppointmentOptions(
              APPOINTMENT_TYPE_OPTIONS,
              orderInfo.dateOfService
            ).length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No available slots for today
              </p>
            )}
        </div>
        <div>
          {/* Urgency */}
          <div>
            <CustomSelect
              label="Urgency"
              value={orderInfo.urgency ?? ''}
              options={URGENCY_OPTIONS}
              onChange={(val) => {
                setTouched((prev) => ({ ...prev, urgency: true }))
                dispatch(updateField({ section: 'orderInfo', field: 'urgency', value: val }))
              }}
              required
            />
            {getFieldError('urgency') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('urgency')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Standing Order: Start / End / Frequency */}
      {orderInfo.orderType === 'STANDING ORDER' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm text-primaryText mb-2 font-medium">
              Start Date <span className="text-red-500">*</span>
            </label>
            <DateCalenderPicker
              name="startDate"
              value={orderInfo.startDate ?? ''}
              onChange={(d) => handleDateChange('startDate', d)}
              error={!!getFieldError('startDate')}
              placeholder="MM-DD-YYYY"
            />
            {getFieldError('startDate') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('startDate')}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm text-primaryText mb-2 font-medium">
              End Date <span className="text-red-500">*</span>
            </label>
            <DateCalenderPicker
              name="endDate"
              value={orderInfo.endDate ?? ''}
              minDate={parseMMDDYYYY(orderInfo.startDate) ?? undefined}
              onChange={(d) => handleDateChange('endDate', d)}
              error={!!getFieldError('endDate')}
              placeholder="MM-DD-YYYY"
            />
            {getFieldError('endDate') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('endDate')}</p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <CustomSelect
              label="Frequency"
              value={orderInfo.frequency ?? ''}
              options={[{ label: 'Daily', value: 'Daily' }, { label: 'Weekly', value: 'Weekly' }, { label: 'Monthly', value: 'Monthly' }]}
              onChange={(val) => {
                setTouched((prev) => ({ ...prev, frequency: true }))
                dispatch(updateField({ section: 'orderInfo', field: 'frequency', value: val }))
              }}
              required
            />
            {getFieldError('frequency') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('frequency')}</p>
            )}
          </div>

          {/* Fasting Field - Fourth column for Standing Order */}
          <div>
            <CustomSelect
              label="Fasting"
              value={orderInfo.fasting === true ? 'Yes' : orderInfo.fasting === false ? 'No' : ''}
              options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
              onChange={(val) => {
                setTouched((prev) => ({ ...prev, fasting: true }))
                dispatch(updateField({ section: 'orderInfo', field: 'fasting', value: val === 'Yes' }))
              }}
              required
            />
            {getFieldError('fasting') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('fasting')}</p>
            )}
          </div>
        </div>
      )}

      {/* Fasting Field - When not Standing Order */}
      {orderInfo.orderType !== 'STANDING ORDER' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <CustomSelect
              label="Fasting"
              value={orderInfo.fasting === true ? 'Yes' : orderInfo.fasting === false ? 'No' : ''}
              options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
              onChange={(val) => {
                setTouched((prev) => ({ ...prev, fasting: true }))
                dispatch(updateField({ section: 'orderInfo', field: 'fasting', value: val === 'Yes' }))
              }}
              required
            />
            {getFieldError('fasting') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('fasting')}</p>
            )}
          </div>
        </div>
      )}

      {/* Warning Notes */}
      <div>
        <label className="block text-sm text-primaryText mb-2 font-medium">
          Warning Notes
        </label>
        <textarea
          name="warningNotes"
          placeholder="Important warning or special instructions..."
          rows={3}
          value={orderInfo.warningNotes ?? ''}
          onChange={handleChange}
          className="w-full rounded-2xl border border-formBorder bg-formBg px-4 py-3 text-sm text-primaryText placeholder:text-gray-500 focus:outline-none focus:border-green-600"
          autoComplete="off"
        />
      </div>

      {/* Upload Documents */}
      <div className="mt-2">
        <h3 className="text-[16px] font-semibold text-primaryText mb-3">Upload Documents</h3>

        <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-[#F6F9FB] p-4 mb-2">
          <FileUploadBox onFileSelect={handleAddDocument} showInlinePreview={false} />
        </div>

        {Array.isArray(orderInfo.uploadDocuments) && orderInfo.uploadDocuments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {orderInfo.uploadDocuments.map((doc: any, index: number) => (
              <div
                key={`${doc.name}-${index}`}
                className="grid grid-cols-[80%_20%]  items-center bg-[#DDE2E5] rounded-3xl p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-green-600" size={24} />
                  <div className='w-full'>
                    <p className="text-primaryText font-medium w-[80%] truncate cursor-help" title={doc.name}>{doc.name}</p>
                    {doc.size ? (
                      <p className="text-xs text-gray-500">
                        {(doc.size / (1024 * 1024)).toFixed(1)}MB
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex justify-end items-center gap-3 text-green-600">
                  <button
                    type="button"
                    onClick={() => handleViewDocument(doc)}
                    className="p-1 rounded-full hover:bg-green-50 text-green-600 hover:text-green-700"
                    title="View Document"
                  >
                    <Eye className="cursor-pointer" size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(index)}
                    className="p-1 rounded-full hover:bg-green-50 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="cursor-pointer" size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
        document={viewDocument}
      />
    </div>
  )
}

export default OrderInformation
