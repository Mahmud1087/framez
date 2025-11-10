export const validateFirstName = (value: string) => {
  if (!value.trim()) {
    return 'First name is required';
  }
  if (value.trim().length < 2) {
    return 'First name must be at least 2 characters';
  }
  return '';
};

export const validateLastName = (value: string) => {
  if (!value.trim()) {
    return 'Last name is required';
  }
  if (value.trim().length < 2) {
    return 'Last name must be at least 2 characters';
  }
  return '';
};

export const validateEmail = (value: string) => {
  if (!value.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePassword = (value: string) => {
  if (!value) {
    return 'Password is required';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/(?=.*[a-z])/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(value)) {
    return 'Password must contain at least one number';
  }
  return '';
};

export const validateConfirmPassword = (value: string, password: string) => {
  if (!value) {
    return 'Please confirm your password';
  }
  if (value !== password) {
    return 'Passwords do not match';
  }
  return '';
};
