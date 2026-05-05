//password validator
export function validatePassword(password: string): string | null {
  if (password.length < 6) return 'auth.errors.passwordTooShort';
  if (password.length > 128) return 'auth.errors.passwordTooLong';
  if (!/[A-Z]/.test(password)) return 'auth.errors.passwordNeedsUppercase';
  if (!/[0-9]/.test(password)) return 'auth.errors.passwordNeedsNumber';
  return null;
}

//username validator 
export function validateUsername(username: string): string | null {
  if (username.trim().length < 3) return 'auth.register.errors.usernameTooShort';
  if (username.trim().length > 20) return 'auth.register.errors.usernameTooLong';
  return null;
}