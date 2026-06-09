import { DEFAULT_USER_IDS } from '../constants/constants';

// Check whether the given user id belongs to a seeded/default user.
// Default users are protected from deletion and some admin edits.
export function isDefaultUser(userId: string | undefined): boolean {
  return DEFAULT_USER_IDS.includes(userId ?? '');
}