import { filter } from "lodash";
import api from "../../../../lib/api";
import type { GetAllUsersResponse } from "../../../../types/technician";

export async function fetchTechnicians(): Promise<GetAllUsersResponse> {
  const payload = {
    page: 1,
    pageSize: 10000000,
    filters: {
      user_type: "TECHNICIAN",
      is_deleted: false,
    }
  };
  const res = await api.post("/user/getAllUsers", payload);
  return res.data;
}
