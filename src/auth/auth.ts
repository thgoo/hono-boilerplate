import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { HTTP_STATUS_CODE } from '~/constants';
import { NewUser } from '~/db/schemas/users';
import { isAuthorized } from './middleware/isAuthorized';
import { isGuest } from './middleware/isGuest';
import { userLoginSchema, userRegisterSchema } from './schemas';
import PasswordService from './services/password-service';
import SessionService from './services/session-service';
import UserService from './services/user-service';

const app = new Hono();
const passwordService = new PasswordService();
const sessionService = new SessionService();
const userService = new UserService();

app.post(
  '/register',
  validator('json', (value, c) => {
    const parsed = userRegisterSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({
        message: parsed.error.issues[0].message,
      }, HTTP_STATUS_CODE.BAD_REQUEST);
    }
    return parsed.data;
  }),
  isGuest,
  async c => {
    const body = c.req.valid('json');
    const userExists = await userService.userExists(body.email);

    if (userExists) {
      return c.json({
        message: 'Email already in use',
      }, HTTP_STATUS_CODE.BAD_REQUEST);
    }

    const hashedPassword = await passwordService.hashPassword(body.password);
    const user: NewUser = {
      name: body.name,
      document: body.document,
      email: body.email,
      password: hashedPassword,
    };

    try {
      const storedIds = await userService.createUser(user);
      const token = sessionService.generateSessionToken();

      sessionService.createSession(token, storedIds[0].id);
      sessionService.setSessionTokenCookie(
        c.res,
        token,
      );

      return c.json(null, HTTP_STATUS_CODE.CREATED);
    } catch {
      return c.json({
        message: 'Failed to create user',
      }, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
  })
  .post(
    '/login',
    validator('json', (value, c) => {
      const parsed = userLoginSchema.safeParse(value);
      if (!parsed.success) {
        return c.json({ message: parsed.error.issues[0].message }, HTTP_STATUS_CODE.BAD_REQUEST);
      }
      return parsed.data;
    }),
    isGuest,
    async c => {
      const body = c.req.valid('json');
      const user = await userService.getUserByEmail(body.email);
      const passwordIsValid = await passwordService.verifyPasswordHash(
        user.password,
        body.password,
      );

      if (!user || !passwordIsValid) return c.json({ message: 'Invalid credentials' }, HTTP_STATUS_CODE.UNAUTHORIZED);

      const token = sessionService.generateSessionToken();
      sessionService.createSession(token, user.id);
      sessionService.setSessionTokenCookie(c.res, token);

      return c.body(null, HTTP_STATUS_CODE.NO_CONTENT);
    })
  .get('/me', isAuthorized, async c => {
    const { session, token, user } = c.var;

    if (!session) {
      sessionService.deleteSessionTokenCookie(c.res);
      return c.json({ message: 'Unauthorized' }, HTTP_STATUS_CODE.UNAUTHORIZED);
    }

    sessionService.setSessionTokenCookie(c.res, token, session.expiresAt);

    return c.json({ user }, HTTP_STATUS_CODE.OK);
  })
  .post('/logout', isAuthorized, async c => {
    const { session } = c.var;

    if (!session) {
      sessionService.deleteSessionTokenCookie(c.res);
      return c.json({ message: 'Failed to log out' }, HTTP_STATUS_CODE.UNAUTHORIZED);
    }

    await sessionService.invalidateSession(session.id);
    sessionService.deleteSessionTokenCookie(c.res);

    return c.body(null, HTTP_STATUS_CODE.NO_CONTENT);
  });

export default app;
