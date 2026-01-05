'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { saveOrder, resetOrder, resetSection, updateField } from '../../../store/ordersSlice'
import { useOrderForm } from './hooks/useOrderForm'
import { useExistingOrder } from './hooks/useExistingOrder'
import { getUploadedFiles, clearUploadedFiles } from './hooks/useFileUploadManager'
import SuccessModal from './components/SuccessModal'
import UpdateReasonModal from './components/UpdateReasonModal'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import Toast from '../../../components/common/Toast'

// Lazy load form section components
const PersonalInformation = dynamic(() => import('./components/PersonalInformation'), {
  loading: () => <LoadingSpinner size="medium" message="Loading form..." />,
  ssr: false,
})

const CaseInformation = dynamic(() => import('./components/CaseInformation'), {
  loading: () => <LoadingSpinner size="medium" message="Loading form..." />,
  ssr: false,
})

const OrderInformation = dynamic(() => import('./components/OrderInformation'), {
  loading: () => <LoadingSpinner size="medium" message="Loading form..." />,
  ssr: false,
})

const InsuranceInformation = dynamic(() => import('./components/InsuranceInformation'), {
  loading: () => <LoadingSpinner size="medium" message="Loading form..." />,
  ssr: false,
})

const PreviewInformation = dynamic(() => import('./components/PreviewInformation'), {
  loading: () => <LoadingSpinner size="medium" message="Loading preview..." />,
  ssr: false,
})

const steps = [
  { id: 1, title: 'Basic Info', description: 'Enter basic details — patient type, location, and contact info' },
  { id: 2, title: 'Case Info', description: 'Add case details — test type, symptoms, and notes' },
  { id: 3, title: 'Order Info', description: 'Enter order details — technician, date, and priority' },
  { id: 4, title: 'Billing Info', description: 'Add details for billing and verification' },
  { id: 5, title: 'Preview', description: 'Review all details and submit' },
]

export default function AddNewPatientPage() {
  const searchParams = useSearchParams()
  const initialStep = Number(searchParams?.get('step') || 1)
  const [currentStep, setCurrentStep] = useState(initialStep)
  const clearedOnReloadRef = useRef(false)
  const patientDataPopulatedRef = useRef<string | null>(null)
  const [submitAttemptedStep, setSubmitAttemptedStep] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [savedOrderData, setSavedOrderData] = useState<any>(null)
  const [showUpdateReasonModal, setShowUpdateReasonModal] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    const step = Number(searchParams?.get('step') || 1)
    if (step && step !== currentStep) setCurrentStep(step)
  }, [searchParams])
  const router = useRouter()

  const handleNext = () => {
    const stepToSection: Record<number, 'personal' | 'caseInfo' | 'orderInfo' | 'insurance' | 'preview'> = {
      1: 'personal',
      2: 'caseInfo',
      3: 'orderInfo',
      4: 'insurance',
      5: 'preview',
    }
    const section = stepToSection[currentStep]
    if (section !== 'preview') {
      const ok = canProceedToNextSection(section)
      if (!ok) {
        setSubmitAttemptedStep(currentStep)
        return
      }
    }
    setSubmitAttemptedStep(null)
    if (currentStep < steps.length) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
    else router.back()
  }

  //const handleCancel = () => router.push('/orders')

  const dispatch = useAppDispatch()
  const orderState = useAppSelector((s: any) => s.orders)
  const orderStatus = orderState.status
  const { canProceedToNextSection } = useOrderForm()
  const { isEditing } = useExistingOrder()

  // When coming from patient lookup in create mode, always hydrate the
  // personal section from the selected patient whenever it changes.
  useEffect(() => {
    const selectedPatient = orderState.selectedPatient

    if (!selectedPatient || isEditing) return

    // Prevent redundant updates if the same patient data was already populated
    if (patientDataPopulatedRef.current === selectedPatient.guid) return

    const patient = selectedPatient
    const patientAddress = Array.isArray(patient.addresses) && patient.addresses.length > 0
      ? patient.addresses[0]
      : undefined

    dispatch(updateField({ section: 'personal', field: 'firstName', value: patient.first_name || '' }))
    dispatch(updateField({ section: 'personal', field: 'middleName', value: patient.middle_name || '' }))
    dispatch(updateField({ section: 'personal', field: 'lastName', value: patient.last_name || '' }))
    dispatch(updateField({ section: 'personal', field: 'gender', value: patient.gender || '' }))
    dispatch(updateField({ section: 'personal', field: 'dob', value: patient.date_of_birth || '' }))
    dispatch(updateField({ section: 'personal', field: 'mobile1', value: patient.phone_no1 || '' }))
    dispatch(updateField({ section: 'personal', field: 'mobile2', value: patient.phone_no2 || '' }))
    dispatch(updateField({ section: 'personal', field: 'email', value: patient.email || '' }))
    dispatch(updateField({ section: 'personal', field: 'address1', value: patientAddress?.address_line1 || '' }))
    dispatch(updateField({ section: 'personal', field: 'address2', value: patientAddress?.address_line2 || '' }))
    dispatch(updateField({ section: 'personal', field: 'city', value: patientAddress?.city || '' }))
    dispatch(updateField({ section: 'personal', field: 'state', value: patientAddress?.state || '' }))
    dispatch(updateField({ section: 'personal', field: 'zip', value: patientAddress?.zipcode || '' }))
    dispatch(updateField({ section: 'personal', field: 'country', value: patientAddress?.country || '' }))
    dispatch(updateField({ section: 'personal', field: 'race', value: patient.race || '' }))
    dispatch(updateField({ section: 'personal', field: 'ethnicity', value: patient.ethnicity || '' }))
    dispatch(updateField({ section: 'personal', field: 'hardStick', value: !!patient.hard_stick }))
    dispatch(updateField({ section: 'personal', field: 'homebound', value: !!patient.home_bound_status }))
    dispatch(updateField({ section: 'personal', field: 'patientNotes', value: patient.patient_notes || '' }))

    // Mark this patient as populated to prevent redundant updates
    patientDataPopulatedRef.current = selectedPatient.guid
  }, [orderState.selectedPatient, isEditing])

  // On hard reload, clear only the current section's form data
  useEffect(() => {
    if (clearedOnReloadRef.current) return
    let isReload = false
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (navEntries && navEntries[0]) {
        isReload = navEntries[0].type === 'reload'
      } else {
        // Fallback for older browsers
        // @ts-ignore
        isReload = (performance as any).navigation?.type === 1
      }
    }

    if (isReload) {
      const stepToSection: Record<number, 'personal' | 'caseInfo' | 'orderInfo' | 'insurance' | null> = {
        1: 'personal',
        2: 'caseInfo',
        3: 'orderInfo',
        4: 'insurance',
        5: null,
      }
      const section = stepToSection[currentStep]
      if (section) {
        dispatch(resetSection(section))
      }
    }
    clearedOnReloadRef.current = true
  }, [])

  useEffect(() => {
    return () => {
      patientDataPopulatedRef.current = null
      dispatch(resetOrder())
    }
  }, [])

  const handleFinish = async () => {
    if (isEditing) {
      setShowUpdateReasonModal(true)
      return
    }

    const resultAction = await dispatch(saveOrder())
    if (saveOrder.fulfilled.match(resultAction)) {
      const responseData = resultAction.payload?.data || resultAction.payload
      setSavedOrderData(responseData)

      // Extract order GUID from response - try multiple possible locations
      const orderGuid = responseData?.guid || responseData?.order_guid || responseData?.data?.guid

      // Upload attachments if any
      if (orderGuid && Array.isArray(orderState.orderInfo.uploadDocuments)) {
        const uploadDocuments = orderState.orderInfo.uploadDocuments
        const filesToUpload = uploadDocuments.filter((doc: any) => doc.isNewUpload === true)

        if (filesToUpload.length > 0) {
          // Get File objects from global storage
          const fileMap = getUploadedFiles()
          const files: File[] = []

          filesToUpload.forEach((doc: any) => {
            const file = fileMap.get(doc.id)
            if (file) {
              files.push(file)
            } else {
              console.warn(`File not found in storage for document: ${doc.name}`)
            }
          })

          if (files.length > 0) {
            try {
              const { uploadAttachmentsForOrder } = await import('../view/services/viewOrderService')
              await uploadAttachmentsForOrder(orderGuid, files)
            } catch (error) {
              console.error(`Failed to upload files:`, error)
            }
          }

          // Clear uploaded files after successful upload
          clearUploadedFiles()
        }
      } else {
        if (!orderGuid) {
          console.warn('No order GUID found in response, cannot upload attachments')
        } else {
          console.log('No files to upload')
        }
      }

      setShowSuccess(true)
    } else {
      const errorMsg = (resultAction.payload as any)?.message || (resultAction.payload as any)?.error || 'Failed to save order'
      setToastType('error')
      setToastMessage(errorMsg)
      setToastOpen(true)
    }
  }

  const handleCancelWithClear = () => {
    patientDataPopulatedRef.current = null
    dispatch(resetOrder())
    router.push('/orders')
  }

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className="flex flex-col bg-gray-50 overflow-hidden">
      {/* Fixed Header with Back Button */}
      <div className='w-full px-6 pt-2 pb-2 bg-gray-50'>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-700 hover:text-green-700 transition"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      {/* Main Content Area with Sidebar and Form */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-160px) pb-4">
        {/* Sidebar Progress - Fixed Height */}
        <aside className="w-64 bg-white shadow-sm p-4 rounded-3xl border border-gray-100 flex-shrink-0 mr-4 h-[calc(100vh-220px)] overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Let's Start</h2>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <div className="w-full bg-gray-200 h-1.5 rounded-full mr-2">
              <div
                className="h-1.5 bg-green-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-gray-600 font-medium">{Math.round(progress)}%</span>
          </div>

          <ul className="space-y-6 mt-2">
            {steps.map((step, index) => (
              <li key={step.id} className="relative flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${currentStep > step.id
                    ? 'border-secondary bg-secondary text-white'
                    : currentStep === step.id
                      ? 'border-secondary text-secondary'
                      : 'border-gray-300 text-gray-300'
                    }`}
                >
                  {currentStep > step.id ? <Check size={12} /> : <div className="w-2 h-2 bg-current rounded-full" />}
                </div>
                <div className="-mt-1">
                  <p
                    className={`text-sm font-semibold ${currentStep >= step.id ? 'text-green-700' : 'text-gray-500'
                      }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 leading-tight w-40">{step.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Scrollable Form Content */}
        <main className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-220px)]">
          <div className="flex-1 overflow-y-auto scrollbar-custom bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            {currentStep === 1 && (
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading form..." />}>
                <PersonalInformation submitAttempted={submitAttemptedStep === 1} />
              </Suspense>
            )}

            {currentStep === 2 && (
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading form..." />}>
                <CaseInformation submitAttempted={submitAttemptedStep === 2} />
              </Suspense>
            )}

            {currentStep === 3 && (
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading form..." />}>
                <OrderInformation submitAttempted={submitAttemptedStep === 3} />
              </Suspense>
            )}

            {currentStep === 4 && (
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading form..." />}>
                <InsuranceInformation submitAttempted={submitAttemptedStep === 4} />
              </Suspense>
            )}

            {currentStep === 5 && (
              <Suspense fallback={<LoadingSpinner size="medium" message="Loading preview..." />}>
                <PreviewInformation />
              </Suspense>
            )}
          </div>
        </main>
      </div>

      {/* Fixed Bottom Action Buttons */}
      <div className="pt-2 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancelWithClear}
            className="border border-gray-300 text-gray-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-100 transition"
            disabled={orderStatus === 'loading'}
          >
            Cancel
          </button>
          <div className='flex gap-2'>
            {currentStep < 5 && (
              <button
                onClick={() => {
                  // Validate ALL sections before allowing preview
                  const sectionsToValidate: Array<'personal' | 'caseInfo' | 'orderInfo' | 'insurance'> = [
                    'personal',
                    'caseInfo',
                    'orderInfo',
                    'insurance'
                  ]

                  // Check each section for validation errors
                  let firstInvalidStep: number | null = null
                  const stepToSection: Record<number, 'personal' | 'caseInfo' | 'orderInfo' | 'insurance'> = {
                    1: 'personal',
                    2: 'caseInfo',
                    3: 'orderInfo',
                    4: 'insurance',
                  }

                  for (let step = 1; step <= 4; step++) {
                    const section = stepToSection[step]
                    const isValid = canProceedToNextSection(section)
                    if (!isValid) {
                      firstInvalidStep = step
                      break
                    }
                  }

                  // If any section is invalid, navigate to that step and show errors
                  if (firstInvalidStep !== null) {
                    setCurrentStep(firstInvalidStep)
                    setSubmitAttemptedStep(firstInvalidStep)
                    return
                  }

                  // All sections valid, proceed to preview
                  setSubmitAttemptedStep(null)
                  setCurrentStep(5)
                }}
                className="border border-green-600 text-green-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-green-50 transition"
                disabled={orderStatus === 'loading'}
              >
                Preview
              </button>
            )}
            <button
              onClick={currentStep === steps.length ? handleFinish : handleNext}
              className="bg-green-600 text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-green-700 transition disabled:opacity-60"
              disabled={orderStatus === 'loading'}
            >
              {orderStatus === 'loading' ? 'Saving...' : currentStep === steps.length ? (isEditing ? 'Update' : 'Finish') : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {orderStatus === 'loading' && <LoadingSpinner overlay message="Saving order..." />}

      {/* Modals */}
      <SuccessModal
        isOpen={showSuccess && !isEditing}
        onClose={() => {
          setShowSuccess(false)
          dispatch(resetOrder())
          router.push('/orders')
        }}
        message="Order Created Successfully"
        data={savedOrderData}
      />

      {isEditing && (
        <UpdateReasonModal
          isOpen={showUpdateReasonModal}
          onClose={() => setShowUpdateReasonModal(false)}
        />
      )}
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </div>
  )
}
