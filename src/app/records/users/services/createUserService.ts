import api from "../../../../lib/api"
import { SaveTestTubeResponse } from "../../../../types/testTubes"

export async function saveUser(payload: any): Promise<SaveTestTubeResponse>  {
  const res = await api.post('/user/saveUser', payload, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return res.data;
}

export async function getAllLabs()  {
  const res = await api.get('/labs/getAllLabs')
  return res.data?.data || [];
}

export async function getStateByZipCode(zipCode:string): Promise<any> {
  try {
    const response = await api.get(`/labs/getStatesByZipCode/${zipCode}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch state by zip code");
  }
}