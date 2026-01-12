interface GetAllUsersPayload {
  page?: number;
  pageSize?: number;
}

export enum UserTypeEnum {
  LAB_ADMIN = "LAB ADMIN",
  ORDERING_ADMIN = "ORDERING ADMIN",
  TECHNICIAN = "TECHNICIAN",
  LAB_SUPER_ADMIN = "LAB SUPER ADMIN",
  TECHNICIAN_LEAD = "TECHNICIAN LEAD"
}

export interface UploadProfilePictureProps {
  onSelect?: (file: File | null) => void;
}

export interface CreateUserFormProps {
  mode?: 'create' | 'edit';
  initialUser?: any;
  onCancel?: () => void;
}

export interface LabAdminProps {
  onDataChange: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
  validateRequest?: number;
  apiErrors?: Record<string, string[]>;
}

export interface MonthlyUserData {
  month: string;
  users: number;
}

export interface RecentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleName?: string;
  departmentName?: string;
  organizationName?: string;
  createdAt: Date;
}

export interface RoleBreakdown {
  roleId: string;
  roleName: string;
  userCount: number;
  percentage: number;
}

export interface OrganizationOverview {
  organizationId: string;
  organizationName: string;
  userCount: number;
}

export interface ChangeMetrics {
  totalUsersChange: number;
  activeUsersChange: number;
  inactiveUsersChange: number;
  totalGroupsChange: number;
  totalDepartmentsChange: number;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalGroups: number;
  totalDepartments: number;
  monthlyData?: MonthlyUserData[];
  recentlyAddedUsers?: RecentUser[];
  roleBreakdown?: RoleBreakdown[];
  organizationsOverview?: OrganizationOverview[];
  changeMetrics?: ChangeMetrics;
}

export interface UserTrendsResponse {
  monthlyData: MonthlyUserData[];
  availableRoles: Array<{ id: string; name: string }>;
  year: number;
  roleId?: string;
}

export interface DepartmentUserCount {
  departmentId: string;
  departmentName: string;
  organizationName: string;
  userCount: number;
}

export interface UsersByDepartmentResponse {
  departments: DepartmentUserCount[];
  totalUsers: number;
}

export interface TechnicianProps {
  onDataChange: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
  validateRequest?: number;
  apiErrors?: Record<string, string[]>;
}

export interface OrderingAdminProps {
  onDataChange: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
  validateRequest?: number;
}

export interface ExtendedProps extends UploadProfilePictureProps {
  initialUrl?: string;
  disabled?: boolean;
}

export interface CreateNewPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  email?: string;
}

export interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (email?: string) => void;
  email?: string;
}

export interface RemarkItem {
  text: string;
  created_at: string;
  updated_at: string;
}