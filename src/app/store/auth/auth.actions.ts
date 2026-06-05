// store/auth/auth.actions.ts
import { createActionGroup, emptyProps } from '@ngrx/store';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login Success': emptyProps(),
    'Logout': emptyProps(),
  },
});