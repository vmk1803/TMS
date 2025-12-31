import api from "../../lib/api";

export async function getUserById(payload: any) {
  try {
    const res = await api.post(`/user/login`, payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}