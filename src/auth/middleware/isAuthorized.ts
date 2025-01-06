import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { Session } from '~/db/schemas/sessions';
import type { User } from '~/db/schemas/users';
import { HTTP_STATUS_CODE } from '~/constants/http';
import SessionService from '../services/session-service';

const sessionService = new SessionService();

// Define utility types
interface ObjectWithPassword {
  password?: string;
  [key: string]: unknown;
}

const isObjectWithPassword = (value: unknown): value is ObjectWithPassword => {
  return typeof value === 'object' && value !== null && 'password' in value;
};

const removePassword = <T>(data: T): T => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(removePassword) as T;
  }

  if (isObjectWithPassword(data)) {
    const { password, ...rest } = data;
    return rest as T;
  }

  const result = { ...data };
  for (const key in result) {
    result[key] = removePassword(result[key]);
  }

  return result;
};

export const isAuthorized = createMiddleware<{
  Variables: {
    session: Session;
    token: string;
    user: User;
  }
}>(async (c, next) => {
  const token = getCookie(c, 'session');

  if (!token) return c.json({ message: 'Unauthorized' }, HTTP_STATUS_CODE.UNAUTHORIZED);

  const { session, user } = await sessionService.validateSessionToken(token);

  if (!session) {
    sessionService.deleteSessionTokenCookie(c.res);
    return c.json({ message: 'Unauthorized' }, HTTP_STATUS_CODE.UNAUTHORIZED);
  }

  c.set('session', session);
  c.set('token', token);
  c.set('user', user);
  await next();

  // remove password from response
  const response = c.res;
  const responseData = response.headers.get('Content-Type')?.includes('application/json')
    ? await response.json()
    : null;
  const sanitizedData = removePassword(responseData);
  c.res = new Response(JSON.stringify(sanitizedData), {
    headers: response.headers,
    status: response.status,
  });
});
