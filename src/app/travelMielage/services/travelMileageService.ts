import api from '../../../lib/api'

export async function getTravelMileage(page: number, pageSize: number, filters?: Record<string, any>): Promise<any> {
  try {
    const payload: Record<string, any> = {
      page,
      pageSize,
      searchText: "MLX",
      sortBy: "id",
      sortOrder: "DESC"
    }

    if (filters && Object.keys(filters).length) {
      payload.filters = filters
    } else {
      // Default filters for travel mileage
      payload.filters = {
        statuses: ["PERFORMED", "DELIVERED TO LAB", "ARRIVED"]
      }
    }

    const response = await api.post('/orders/getTravelMileage', payload)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch travel mileage data')
  }
}

export async function getTravelMileageByGuid(guid: string): Promise<any> {
  try {
    const payload = {
      page: 1,
      pageSize: 10,
      searchText: "MLX",
      sortBy: "id",
      sortOrder: "DESC",
      filters: {
        guid: guid
      }
    }

    const response = await api.post('/orders/getTravelMileage', payload)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch travel mileage details')
  }
}
