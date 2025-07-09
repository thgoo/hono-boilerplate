import { Hono } from 'hono';
import { csrf } from 'hono/csrf';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import auth from '~/auth';
import PasswordService from '~/auth/services/password-service';
import SessionService from '~/auth/services/session-service';
import UserService from '~/auth/services/user-service';
import { config } from '~/config';
import { HttpError } from '~/utils/errors';
import { isAuthorized } from './auth/middleware/isAuthorized';
import { isGuest } from './auth/middleware/isGuest';
import { HTTP_STATUS_CODE } from './constants/http';

export function createApp({
  userService = new UserService(),
  sessionService = new SessionService(),
  passwordService = new PasswordService(),
  enableLogger = true,
} = {}) {
  const app = new Hono({ strict: true });

  if (process.env.NODE_ENV === 'production') app.use(csrf());
  if (enableLogger) app.use(logger());

  app.use('*', async (c, next) => {
    c.set('userService', userService);
    c.set('sessionService', sessionService);
    c.set('passwordService', passwordService);
    await next();
  });

  app.route('/api/auth', auth);

  app.get('/api/example/public', c => {
    return c.json({ message: 'This is a public route. Anyone can access it.' });
  });

  app.get('/api/example/protected', isAuthorized, c => {
    const user = c.get('user');
    return c.json({ message: `Welcome, ${user.name}! This is a protected route.` });
  });

  app.get('/api/example/guest-only', isGuest, c => {
    return c.json({ message: 'You are a guest. This route is only for unauthenticated users.' });
  });

  app.onError(async (err, c) => {
    if (err instanceof HttpError) {
      return c.json({ message: err.message }, { status: err.statusCode });
    }

    if (err instanceof HTTPException) {
      const errMessage = await err.getResponse().text();
      return c.json({ message: errMessage }, { status: err.status });
    }

    return c.json(
      {
        message: err.message || 'Internal Server Error',
      }, {
        status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      });
  });

  return app;
}

const app = createApp();

export default {
  port: config.PORT,
  fetch: app.fetch,
};
