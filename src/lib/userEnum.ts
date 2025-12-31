import { UserTypeEnum } from "../types/user";

export const USER_TYPE_OPTIONS = [
  { label: "Lab Admin", value: UserTypeEnum.LAB_ADMIN },
  // { label: "Ordering Facility Admin", value: UserTypeEnum.ORDERING_ADMIN },
  { label: "Technician", value: UserTypeEnum.TECHNICIAN },
  { label: "Lab Super Admin", value: UserTypeEnum.LAB_SUPER_ADMIN },
  // { label: "Technician Lead", value: UserTypeEnum.TECHNICIAN_LEAD }
];
