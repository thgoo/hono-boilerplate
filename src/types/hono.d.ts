// src/types/hono.d.ts
import type PasswordService from '~/auth/services/password-service';
import type SessionService from '~/auth/services/session-service';
import type UserService from '~/auth/services/user-service';

declare module 'hono' {
  interface ContextVariableMap {
    userService: UserService;
    sessionService: SessionService;
    passwordService: PasswordService;
  }
}
