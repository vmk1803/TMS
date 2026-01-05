export interface Technician {
  id: number;
  guid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  user_name: string;
  date_of_birth: string;
  is_deleted: boolean;
}

export interface GetAllUsersResponse {
  status: number;
  message: string;
  page: number;
  limit: number;
  total_count: number;
  data: Technician[];
}
