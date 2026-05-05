import { DEFAULT_USER_IDS } from '../constants/constants';

export function isDefaultUser(userId: string | undefined): boolean {
  return DEFAULT_USER_IDS.includes(userId ?? '');
}