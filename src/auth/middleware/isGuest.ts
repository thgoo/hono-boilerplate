import { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { HTTP_STATUS_CODE } from '~/constants';
import SessionService from '../services/session-service';

const sessionService = new SessionService();

export const isGuest: MiddlewareHandler = async (c, next) => {
  const token = getCookie(c, 'session');

  if (token) {
    const { session } = await sessionService.validateSessionToken(token);

    if (session) return c.json({ message: 'Already logged in' }, HTTP_STATUS_CODE.FORBIDDEN);
  }

  await next();
};
