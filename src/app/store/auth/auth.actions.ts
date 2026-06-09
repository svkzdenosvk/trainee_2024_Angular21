// store/auth/auth.actions.ts
import { createActionGroup, emptyProps } from '@ngrx/store';

// Simple auth action group used by auth effects and guards.
export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login Success': emptyProps(),
    'Logout': emptyProps(),
  },
});