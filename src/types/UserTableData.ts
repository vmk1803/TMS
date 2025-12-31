export interface UserRow {
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  facilities: string;
  lastLogin: string;
  mfa: string;
  supervisor: string;
  status: string;
}
export const auditTimeConversionFields = ["Updated At", "last_login", "created_at", "updated_at"];
