import { useCallback, useState } from "react";

export type userForm = {
  firstName: string;
  lastName: string;
  lab?: string; 
  email?: string;
  userEmail?: string; 
  phoneNumber: string;
  userName: string;
  dateOfBirth: string;
  gender: string;

  // Technician–specific
  employeeId?: string;
  address?: string;
  state?: string;
  city?: string;
  zip?: string;
};

export function validateUserForm(data: userForm): Record<string, string> {
  const errors: Record<string, string> = {};

  const firstNameTrimmed = data.firstName?.trim() || "";
  const lastNameTrimmed = data.lastName?.trim() || "";

  if (!firstNameTrimmed) errors.firstName = "First name is required";
  else if (firstNameTrimmed.length < 3) errors.firstName = "First name required atleast 3 characters";

  if (!lastNameTrimmed) errors.lastName = "Last name is required";
  else if (lastNameTrimmed.length < 3) errors.lastName = "Last name required atleast 3 characters";
 
  // Validate that names contain only letters/spaces
  if (firstNameTrimmed && !/^[A-Za-z\s]+$/.test(firstNameTrimmed)) {
    errors.firstName = "First name must contain only letters";
  }
  if (lastNameTrimmed && !/^[A-Za-z\s]+$/.test(lastNameTrimmed)) {
    errors.lastName = "Last name must contain only letters";
  }
  if (!data.phoneNumber?.trim()) errors.phoneNumber = "Phone number is required";
  else if (!/^\d+$/.test(data.phoneNumber.trim())) errors.phoneNumber = "Phone number must contain only numbers";
  if (!data.dateOfBirth?.trim()) errors.dateOfBirth = "Date of birth is required";
  if (!data.gender?.trim()) errors.gender = "Gender is required";

  const finalEmail = data.userEmail || data.email;
  if (!finalEmail?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
    errors.email = "Invalid email format";
  }

  if (data.lab !== undefined) {
    if (!data.lab?.trim()) errors.lab = "Lab is required";
  }
  
  if (data.address !== undefined && !data.address.trim()) {
    errors.address = "Street address is required";
  }

  if (data.state !== undefined && !data.state.trim()) {
    errors.state = "State is required";
  }

  if (data.city !== undefined && !data.city.trim()) {
    errors.city = "City is required";
  }

  if (data.zip !== undefined && !data.zip.trim()) {
    errors.zip = "Zip code is required";
  }

  return errors;
}

export function useUserValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: userForm) => {
    const newErrors = validateUserForm(data);
    setErrors(newErrors);
    return newErrors;
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  }, []);

  return { errors, validate, clearError };
}
