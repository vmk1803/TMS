import type { GenderEnum, OrderTypeEnum, UrgencyEnum, InsuranceRelationTypeEnum } from '../types/order'

export const GENDER_OPTIONS: { label: string; value: GenderEnum }[] = [
  { label: 'MALE', value: 'MALE' },
  { label: 'FEMALE', value: 'FEMALE' },
]

export const ORDER_TYPE_OPTIONS: { label: string; value: OrderTypeEnum }[] = [
  { label: 'Standing Order', value: 'STANDING ORDER' },
  { label: 'One Visit', value: 'ONE VISIT' },
  //{ label: 'Return Visit', value: 'RETURN VISIT' },
]

export const APPOINTMENT_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "12:00 AM - 02:00 AM", value: "12:00 AM - 02:00 AM" },
  { label: "02:00 AM - 04:00 AM", value: "02:00 AM - 04:00 AM" },
  { label: "04:00 AM - 06:00 AM", value: "04:00 AM - 06:00 AM" },
  { label: "06:00 AM - 08:00 AM", value: "06:00 AM - 08:00 AM" },
  { label: "08:00 AM - 10:00 AM", value: "08:00 AM - 10:00 AM" },
  { label: "10:00 AM - 12:00 PM", value: "10:00 AM - 12:00 PM" },
  { label: "12:00 PM - 02:00 PM", value: "12:00 PM - 02:00 PM" },
  { label: "02:00 PM - 04:00 PM", value: "02:00 PM - 04:00 PM" },
  { label: "04:00 PM - 06:00 PM", value: "04:00 PM - 06:00 PM" },
  { label: "06:00 PM - 08:00 PM", value: "06:00 PM - 08:00 PM" },
  { label: "08:00 PM - 10:00 PM", value: "08:00 PM - 10:00 PM" },
  { label: "10:00 PM - 12:00 AM", value: "10:00 PM - 12:00 AM" },
];

export const URGENCY_OPTIONS: { label: string; value: UrgencyEnum }[] = [
  { label: 'STAT', value: 'STAT' },
  { label: 'ROUTINE', value: 'ROUTINE' },
]

export const INSURANCE_RELATION_OPTIONS: { label: string; value: InsuranceRelationTypeEnum }[] = [
  { label: 'Adopted Child', value: 'ADOPTED CHILD' },
  { label: 'Cadaver Donor', value: 'CADAVER DONOR' },
  { label: 'Child', value: 'CHILD' },
  { label: 'Child Where Insured Has No Financial Responsibility', value: 'CHILD WHERE INSURED HAS NO FINANCIAL RESPONSIBILITY' },
  { label: 'Dependent of a Minor Dependent', value: 'DEPENDENT OF A MINOR DEPENDENT' },
  { label: 'Emancipated Minor', value: 'EMANCIPATED MINOR' },
  { label: 'Employee', value: 'EMPLOYEE' },
  { label: 'Father', value: 'FATHER' },
  { label: 'Foster Child', value: 'FOSTER CHILD' },
  { label: 'Grandfather or Grandmother', value: 'GRANDFATHER OR GRANDMOTHER' },
  { label: 'Grandson or Granddaughter', value: 'GRANDSON OR GRANDDAUGHTER' },
  { label: 'Handicapped Dependent', value: 'HANDICAPPED DEPENDENT' },
  { label: 'Injured Plaintiff', value: 'INJURED PLAINTIFF' },
  { label: 'Life Partner', value: 'LIFE PARTNER' },
  { label: 'Mother', value: 'MOTHER' },
  { label: 'Nephew or Niece', value: 'NEPHEW OR NIECE' },
  { label: 'Organ Donor', value: 'ORGAN DONOR' },
  { label: 'Other Adult', value: 'OTHER ADULT' },
  { label: 'Other Relationship', value: 'OTHER RELATIONSHIP' },
  { label: 'Self', value: 'SELF' },
  { label: 'Significant Other', value: 'SIGNIFICANT OTHER' },
  { label: 'Sponsored Dependent', value: 'SPONSORED DEPENDENT' },
  { label: 'Spouse', value: 'SPOUSE' },
  { label: 'Stepson or Stepdaughter', value: 'STEPSON OR STEPDAUGHTER' },
  { label: 'Unknown', value: 'UNKNOWN' },
  { label: 'Ward', value: 'WARD' },
]

// A small set of insurer names (UI choices). There's no enum for insurers in types,
// so provide a curated list here. You can replace this with a server-driven list later.
export const INSURANCE_NAME_OPTIONS: { label: string; value: string }[] = [
  { label: 'United Healthcare', value: 'United Healthcare' },
  { label: 'Blue Cross Blue Shield', value: 'Blue Cross Blue Shield' },
  { label: 'Star Health', value: 'Star Health' },
]

export const ORDER_TYPES_ALL_ORDERS = ["ONE VISIT", "STANDING ORDER", "RETURN VISIT"];
export const URGENCY_OPTIONS_ALL_ORDERS = ["STAT", "ROUTINE"];
export const FASTING_OPTIONS_ALL_ORDERS = ["Yes", "No"];
export const STATUS_OPTIONS_ALL_ORDERS = [
  'PENDING',
  'ASSIGNED',
  'CONFIRMED',
  'EN-ROUTE',
  'ARRIVED',
  'PERFORMED',
  'DELIVERED TO LAB',
  'CANCELLED',
  'REJECTED',
  'ON HOLD',
  'PARTIALLY COLLECTED'
];
export const RACE_OPTIONS = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Native Hawaiian or Other Pacific Islander",
  "White",
  "Other Race",
];
export const ETHNICITY_OPTIONS = [
  "Ashkenazi Jewish",
  "Asian",
  "Black/African",
  "American",
  "Hispanic or Latino",
  "Hispanic",
  "Native American",
  "Not Hispanic or Latino",
  "Other",
  "Pacific Islander",
  "Unknown",
  "White/Caucasian",
];

export const SERVICE_OPTIONS = [
  "Venipuncture Home Draw",
  "UA Specimen Pickup",
  "Stool Specimen Pickup",
  "Testing Ordering Facility",
];

export default null
