import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { saveOrderApi, buildOrderPayload, updateOrderApi, buildOrderUpdatePayload } from '../app/orders/createNeworder/services/ordersService'

type Section = 'personal' | 'caseInfo' | 'orderInfo' | 'insurance'

type UpdateFieldPayload = {
  section: Section
  field: string
  value: any
}

export type OrderState = {
  personal: Record<string, any>
  caseInfo: Record<string, any>
  orderInfo: Record<string, any>
  insurance: Record<string, any>
  originalPersonal: Record<string, any>
  originalCaseInfo: Record<string, any>
  originalOrderInfo: Record<string, any>
  originalInsurance: Record<string, any>
  orderGuid: string | null
  patientGuid: string | null
  mode: string | null
  selectedPatient: any | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string | null
}

const initialState: OrderState = {
  personal: {},
  caseInfo: {},
  orderInfo: {},
  insurance: {},
  originalPersonal: {},
  originalCaseInfo: {},
  originalOrderInfo: {},
  originalInsurance: {},
  orderGuid: null,
  patientGuid: null,
  mode: null,
  selectedPatient: null,
  status: 'idle',
  error: null,
}

export const saveOrder = createAsyncThunk(
  'orders/saveOrder',
  async (_, { getState, rejectWithValue }) => {
    try {
      // @ts-ignore
      const state = getState() as { orders: OrderState }
      const payload = buildOrderPayload(state.orders)

      const response = await saveOrderApi(payload)
      return response
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async (summary: string | undefined, { getState, rejectWithValue }) => {
    try {
      // @ts-ignore
      const state = getState() as { orders: OrderState }
      const {
        personal,
        caseInfo,
        orderInfo,
        insurance,
        originalPersonal,
        originalCaseInfo,
        originalOrderInfo,
        originalInsurance,
        orderGuid,
        patientGuid,
      } = state.orders

      if (!orderGuid) {
        throw new Error('Missing orderGuid for update')
      }

      const currentState = { personal, caseInfo, orderInfo, insurance }
      const originalState = {
        personal: originalPersonal || {},
        caseInfo: originalCaseInfo || {},
        orderInfo: originalOrderInfo || {},
        insurance: originalInsurance || {},
      }

      const updatePayload = buildOrderUpdatePayload(currentState, originalState, patientGuid)

      if (summary && typeof summary === 'string') {
        ; (updatePayload as any).update_summary = summary
      }

      const response = await updateOrderApi(orderGuid, updatePayload)
      return response
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err.message)
    }
  }
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    updateField: (state, action: PayloadAction<UpdateFieldPayload>) => {
      const { section, field, value } = action.payload
      if (section === 'personal') state.personal[field] = value
      if (section === 'caseInfo') state.caseInfo[field] = value
      if (section === 'orderInfo') state.orderInfo[field] = value
      if (section === 'insurance') state.insurance[field] = value
    },
    setSelectedPatient: (state, action: PayloadAction<any | null>) => {
      state.selectedPatient = action.payload
    },
    setOriginalSnapshot: (
      state,
      action: PayloadAction<{
        personal: Record<string, any>
        caseInfo: Record<string, any>
        orderInfo: Record<string, any>
        insurance: Record<string, any>
        orderGuid: string | null
        patientGuid: string | null
        mode?: string | null
      }>
    ) => {
      const { personal, caseInfo, orderInfo, insurance, orderGuid, patientGuid, mode } = action.payload
      state.originalPersonal = personal
      state.originalCaseInfo = caseInfo
      state.originalOrderInfo = orderInfo
      state.originalInsurance = insurance
      state.orderGuid = orderGuid
      state.patientGuid = patientGuid
      state.mode = mode || null
    },
    resetSection: (state, action: PayloadAction<Section>) => {
      const section = action.payload
      if (section === 'personal') state.personal = {}
      if (section === 'caseInfo') state.caseInfo = {}
      if (section === 'orderInfo') state.orderInfo = {}
      if (section === 'insurance') state.insurance = {}
    },
    resetOrder: (state) => {
      state.personal = {}
      state.caseInfo = {}
      state.orderInfo = {}
      state.insurance = {}
      state.originalPersonal = {}
      state.originalCaseInfo = {}
      state.originalOrderInfo = {}
      state.originalInsurance = {}
      state.orderGuid = null
      state.patientGuid = null
      state.mode = null
      state.selectedPatient = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveOrder.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(saveOrder.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(saveOrder.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(updateOrder.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateOrder.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
  },
})

export const { updateField, resetOrder, resetSection, setOriginalSnapshot, setSelectedPatient } = ordersSlice.actions

export default ordersSlice.reducer

