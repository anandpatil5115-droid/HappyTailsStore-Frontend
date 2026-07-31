// Form validation utilities for client-side validation
// These can later be aligned with backend validation rules

// Email validation - matches basic email format (can be refined later)
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : 'Enter a valid email address';
};

// Password validation rules for registration
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return errors;
  }
  
  if (password.length < 8) {
    errors.push('Must be at least 8 characters');
  }
  
  if (password.length > 20) {
    errors.push('Must be no more than 20 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least 1 uppercase letter (A-Z)');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least 1 lowercase letter (a-z)');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Must contain at least 1 number (0-9)');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};\':"\\\\|,.<>\/?]/.test(password)) {
    errors.push('Must contain at least 1 special character (!@#$%^&*)');
  }
  
  return errors;
};

// Username validation
export const validateUsername = (username) => {
  if (!username.trim()) {
    return 'Username is required';
  }
  
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    return 'Username must be at least 3 characters';
  }
  
  if (trimmed.length > 100) {
    return 'Username must be no more than 100 characters';
  }
  
  // Check for whitespace in username
  if (trimmed !== username) {
    return 'Username cannot start or end with spaces';
  }
  
  return null;
};

// Confirm password validation
export const validateConfirmPassword = (confirmPassword, password) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (confirmPassword !== password) {
    return 'Passwords do not match';
  }
  
  return null;
};

// Login form validation
export const validateLogin = (form) => {
  const errors = {};
  
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;
  
  if (!form.password) {
    errors.password = 'Password is required';
  }
  
  return errors;
};

// Register form validation
export const validateRegister = (form) => {
  const errors = {};
  
  const usernameError = validateUsername(form.username);
  if (usernameError) errors.username = usernameError;
  
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;
  
  const passwordErrors = validatePassword(form.password);
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors.join(', ');
  }
  
  const confirmPasswordError = validateConfirmPassword(form.confirmPassword, form.password);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  return errors;
};

// Forgot password form validation
export const validateForgotPassword = (form) => {
  const errors = {};
  
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;
  
  return errors;
};
