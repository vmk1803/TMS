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