import { Hono } from 'hono';
import { logger } from 'hono/logger';

const app = new Hono();
app.use(logger());

app.get('/', c => {
  return c.json({
    message: 'This is a very long texto to test max line length!',
  });
});

export default {
  port: 8000,
  fetch: app.fetch,
};
