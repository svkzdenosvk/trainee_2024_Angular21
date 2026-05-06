// src/app/core/utils/username.validator.spec.ts
import { validateUsername } from './validators';

describe('validateUsername', () => {
  it('should return null for valid username', () => {
    expect(validateUsername('john')).toBeNull();
  });

  it('should return error for too short', () => {
    expect(validateUsername('ab')).toBe('auth.errors.usernameTooShort');
  });

  it('should return error for too long', () => {
    expect(validateUsername('a'.repeat(21))).toBe('auth.errors.usernameTooLong');
  });

  it('should return null for username at min length', () => {
    expect(validateUsername('abc')).toBeNull();
  });

  it('should return null for username at max length', () => {
    expect(validateUsername('a'.repeat(20))).toBeNull();
  });

  it('should trim before checking length', () => {
    expect(validateUsername('  ab  ')).toBe('auth.errors.usernameTooShort');
  });
});
