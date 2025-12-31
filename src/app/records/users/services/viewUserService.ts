import api from "../../../../lib/api";

interface GetAllUsersParams {
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>;
  // backward compatibility fields
  search_column?: string;
  search_value?: string;
}

export async function getAllUsers({ page = 1, pageSize = 10, filters, search_column, search_value }: GetAllUsersParams = {}) {
  try {
    const payload: any = { page, pageSize };
    if (filters && Object.keys(filters).length) payload.filters = filters;
    if (!filters && search_column && search_value) {
      payload.search_column = search_column;
      payload.search_value = search_value;
    }
    const res = await api.post(`/user/getAllUsers`, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getUserById(userId: string) {
  try {
    const res = await api.get(`/user/getUserByGuid/${userId}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getTechniciansByGuid(
  userId: string,
  filters?: { from_date?: string; to_date?: string }
) {
  try {
    const payload: any = { technician_guid: userId };

    if (filters?.from_date) payload.from_date = filters.from_date;
    if (filters?.to_date) payload.to_date = filters.to_date;

    const res = await api.post(`/orders/getOrdersByTechnicianGuid`, payload);

    return res.data;

  } catch (error) {
    throw error;
  }
}

export async function updateUserByGuid(userGuid: string, payload: any, reason?: string) {
  try {
    // If reason is provided, add it to the payload
    if (reason) {
      if (payload instanceof FormData) {
        payload.append('update_summary', reason);
      } else {
        payload.reason = reason;
      }
    }

    const res = await api.patch(
      `/user/updateUser/${userGuid}`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function toggleUserStatus(userGuid: string) {
  try {
    const res = await api.get(`/user/delete/${userGuid}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}
export async function resetUserPassword(userGuid: string) {
  try {
    const res = await api.get(`/user/resetPassword/${userGuid}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}