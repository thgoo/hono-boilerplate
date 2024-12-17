import { Hono } from 'hono';
import { csrf } from 'hono/csrf';
import { logger } from 'hono/logger';
import auth from '~/auth';

const app = new Hono({ strict: false });
app.use(csrf());
app.use(logger());

// auth
app.route('/api/auth', auth);

export default {
  port: 8000,
  fetch: app.fetch,
};
