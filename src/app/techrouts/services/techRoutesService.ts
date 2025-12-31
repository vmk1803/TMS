import api from '../../../lib/api'

export interface TechRoutesFilters {
  technician_guid?: string;
  date_of_service?: string;
  created_from?: string;
  created_to?: string;
}

export interface StatusCount {
  total: number
  arrived: number
  on_hold: number
  pending: number
  assigned: number
  en_route: number
  rejected: number
  cancelled: number
  completed: number
  confirmed: number
  performed: number
  delivered_to_lab: number
  partially_collected: number
}

export interface GetTechRoutesResult {
  success: boolean
  status: number
  message?: string
  page: number
  limit: number
  total_count: number
  status_count?: StatusCount
  data: any[]
}

export async function getTechRoutes(
  page: number,
  pageSize: number,
  filters: TechRoutesFilters
): Promise<GetTechRoutesResult> {
  const payload = {
    page,
    pageSize,
    filters: filters || {},
  }

  const res = await api.post('/orders/getTechRoutes', payload)
  return res.data as GetTechRoutesResult
}

export interface AssignOrderPayload {
  order_guids: string[]
  technician_guid: string
  progress_notes: string
}

export interface AssignOrderResult {
  success: boolean
  status: number
  message?: string
}

export async function assignOrder(
  orderGuids: string[],
  technicianGuid: string,
  progressNotes: string
): Promise<AssignOrderResult> {
  const payload: AssignOrderPayload = {
    order_guids: orderGuids,
    technician_guid: technicianGuid,
    progress_notes: progressNotes,
  }

  const res = await api.post('/orders/assignTechnician', payload)
  return res.data as AssignOrderResult
}
