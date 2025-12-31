"use client";

import api from "@/lib/api";

export async function updateOrderByGuid(orderGuid: string, updateData: Record<string, any>): Promise<any> {
  try {
    const response = await api.patch(`/orders/updateOrderByGuid/${orderGuid}`, updateData)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update order')
  }
}

export async function printRequisitionForm(orderGuid: string): Promise<{ s3Key: string; signedUrl: string }> {
  try {
    const response = await api.get(`/orders/printRequisitionForm/${orderGuid}`)
    return response.data.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to print requisition form')
  }
}