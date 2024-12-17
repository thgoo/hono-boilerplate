import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { Session } from '~/db/schemas/sessions';
import type { User } from '~/db/schemas/users';
import { HTTP_STATUS_CODE } from '~/constants';
import SessionService from '../services/session-service';

const sessionService = new SessionService();

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
  if (responseData?.user?.password) delete responseData.user.password;
  c.res = undefined;
  c.res = new Response(JSON.stringify(responseData), {
    headers: response.headers,
    status: response.status,
  });
});
