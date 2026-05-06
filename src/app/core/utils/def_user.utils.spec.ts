// src/app/core/utils/user.utils.spec.ts
import { isDefaultUser } from './def_user.utils';
import { DEFAULT_USER_IDS } from '../constants/constants';

describe('isDefaultUser', () => {
  it('should return true for first default user ID', () => {
    expect(isDefaultUser(DEFAULT_USER_IDS[0])).toBe(true);
  });

  it('should return true for second default user ID', () => {
    expect(isDefaultUser(DEFAULT_USER_IDS[1])).toBe(true);
  });

  it('should return false for regular user ID', () => {
    expect(isDefaultUser('some-random-id-123')).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isDefaultUser(undefined)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isDefaultUser('')).toBe(false);
  });
});