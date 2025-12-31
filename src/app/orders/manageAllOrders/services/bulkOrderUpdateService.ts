import api from '../../../../lib/api';

interface BulkUpdatePayload {
    order_guids: string[];
    status?: string;
    date_of_service: string;
}

export const bulkOrderUpdate = async (payload: BulkUpdatePayload) => {
    try {
        const response = await api.post('/orders/bulkOrderUpdate', payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to update orders");
    }
};
