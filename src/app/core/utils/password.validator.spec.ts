// src/app/core/utils/password.validator.spec.ts
import { validatePassword } from './validators';

describe('validatePassword', () => {
  it('should return null for valid password', () => {
    expect(validatePassword('Password1')).toBeNull();
  });

  it('should return error for too short', () => {
    expect(validatePassword('Pass1')).toBe('auth.errors.passwordTooShort');
  });

  it('should return error for too long', () => {
    expect(validatePassword('P1' + 'a'.repeat(127))).toBe('auth.errors.passwordTooLong');
  });

  it('should return error for missing uppercase', () => {
    expect(validatePassword('password1')).toBe('auth.errors.passwordNeedsUppercase');
  });

  it('should return error for missing number', () => {
    expect(validatePassword('Password')).toBe('auth.errors.passwordNeedsNumber');
  });

  it('should return null for password at max length', () => {
    expect(validatePassword('P1' + 'a'.repeat(126))).toBeNull();
  });

  it('should return null for password at min length', () => {
    expect(validatePassword('Pass1a')).toBeNull();
  });
});