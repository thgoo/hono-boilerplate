import { Session } from '~/db/schemas/sessions';
import { User } from '~/db/schemas/users';

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
