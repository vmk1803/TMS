import api from '../../../../lib/api'

export async function fetchOrderByPhlebioId(phlebioOrderId: string): Promise<any> {
    try {
        const response = await api.get(`/orders/fetchGuidByOrderId`, {
            params: { order_id: phlebioOrderId }
        })
        return response.data?.data || null
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch order')
    }
}
