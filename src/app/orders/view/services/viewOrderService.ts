import api from '../../../../lib/api'

export async function getOrderByGuid(orderGuid: string): Promise<any> {
  try {
    const response = await api.get(`/orders/getOrderByGuid/${orderGuid}`)
    return (response.data?.data) ? response.data.data : {}
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch tests')
  }
}

export async function getAttachmentsForOrder(orderGuid: string, name: string): Promise<string> {
  try {
    const payload = { filename: name }
    const response = await api.post(`/orders/viewOrderAttachments/${orderGuid}`, payload)
    return typeof response.data?.data === 'string' ? response.data.data : ""
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch attachments')
  }
}

export async function uploadAttachmentsForOrder(orderGuid: string, files: File[]): Promise<any> {
  try {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('attachments', file)
    })

    const response = await api.post(
      `/orders/saveOrderAttachments/${orderGuid}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )

    return response.data

  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to upload attachments")
  }
}


export async function deleteAttachmentForOrder(orderGuid: string, name: string): Promise<any> {
  try {
    const payload = { filename: name }
    const response = await api.post(`/orders/deleteOrderAttachments/${orderGuid}`, payload)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete attachment")
  }
}