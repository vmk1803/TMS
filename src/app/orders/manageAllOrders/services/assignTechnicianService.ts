import api from "../../../../lib/api";

interface AssignTechnicianPayload {
  order_guids: string[];
  technician_guid: string;
}

export async function assignTechnician(payload: AssignTechnicianPayload) {
  const res = await api.post("/orders/assignTechnician", payload);
  return res.data;
}
