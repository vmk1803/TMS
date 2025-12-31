import api from "../../../lib/api";

export async function getUserById(userId: string) {
  try {
    const res = await api.get(`/user/getUserByGuid/${userId}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}