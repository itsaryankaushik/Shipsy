/**
 * Frontend Validation Utilities
 * Client-side validation matching backend Zod schemas
 */

// Password validation regex - matches backend
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

// Phone validation regex - matches backend
const phoneRegex = /^\+?[1-9]\d{9,14}$/;

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate email field
 */
export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  
  if (email.length > 255) {
    return 'Email too long (max 255 characters)';
  }
  
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  
  return null;
};

/**
 * Validate password field (for login - less strict)
 */
export const validatePasswordSimple = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  return null;
};

/**
 * Validate password field (for registration/change - strict)
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  if (password.length > 100) {
    return 'Password too long (max 100 characters)';
  }
  
  if (!passwordRegex.test(password)) {
    return 'Password must contain uppercase, lowercase, and number';
  }
  
  return null;
};

/**
 * Validate confirm password field
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return "Passwords don't match";
  }
  
  return null;
};

/**
 * Validate name field
 */
export const validateName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return 'Name is required';
  }
  
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  
  if (name.length > 255) {
    return 'Name too long (max 255 characters)';
  }
  
  return null;
};

/**
 * Validate phone field
 */
export const validatePhone = (phone: string): string | null => {
  if (!phone || !phone.trim()) {
    return 'Phone is required';
  }
  
  if (phone.length < 10) {
    return 'Phone number must be at least 10 digits';
  }
  
  if (phone.length > 20) {
    return 'Phone number too long (max 20 characters)';
  }
  
  if (!phoneRegex.test(phone)) {
    return 'Invalid phone format (e.g., +1234567890)';
  }
  
  return null;
};

/**
 * Validate phone field (optional)
 */
export const validatePhoneOptional = (phone: string): string | null => {
  if (!phone || !phone.trim()) {
    return null; // Phone is optional
  }
  
  return validatePhone(phone);
};

/**
 * Validate login form
 */
export const validateLoginForm = (data: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePasswordSimple(data.password);
  if (passwordError) errors.password = passwordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate register form
 */
export const validateRegisterForm = (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;
  
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmPasswordError = validateConfirmPassword(data.password, data.confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate profile update form
 */
export const validateProfileForm = (data: {
  name: string;
  phone?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;
  
  if (data.phone) {
    const phoneError = validatePhoneOptional(data.phone);
    if (phoneError) errors.phone = phoneError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate change password form
 */
export const validateChangePasswordForm = (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!data.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }
  
  const newPasswordError = validatePassword(data.newPassword);
  if (newPasswordError) errors.newPassword = newPasswordError;
  
  const confirmPasswordError = validateConfirmPassword(data.newPassword, data.confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
