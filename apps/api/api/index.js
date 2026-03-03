const sendJson = (res, statusCode, payload) => {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(payload);
    return;
  }

  if (typeof res.setHeader === 'function') {
    res.setHeader('content-type', 'application/json; charset=utf-8');
  }

  if ('statusCode' in res) {
    res.statusCode = statusCode;
  }

  if (typeof res.end === 'function') {
    res.end(JSON.stringify(payload));
  }
};

const applyCors = (req, res) => {
  const origin = req?.headers?.origin;
  const configuredOrigin = process.env.CLIENT_ORIGIN;
  const isVercelOrigin = typeof origin === 'string' && /\.vercel\.app$/i.test(origin);
  const allowOrigin = origin && (origin === configuredOrigin || isVercelOrigin) ? origin : configuredOrigin;

  if (allowOrigin && typeof res.setHeader === 'function') {
    res.setHeader('access-control-allow-origin', allowOrigin);
    res.setHeader('access-control-allow-credentials', 'true');
    res.setHeader('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('access-control-allow-headers', 'Content-Type, Authorization');
    res.setHeader('vary', 'Origin');
  }
};

const sendEmpty = (res, statusCode) => {
  if ('statusCode' in res) {
    res.statusCode = statusCode;
  }

  if (typeof res.end === 'function') {
    res.end();
  }
};

export default async function handler(req, res) {
  applyCors(req, res);

  if (req?.method === 'OPTIONS') {
    sendEmpty(res, 204);
    return;
  }

  try {
    const mod = await import('../dist/app.js');
    const app = mod.app;

    if (typeof app !== 'function') {
      throw new Error('Express app export not found in dist/app.js');
    }

    return app(req, res);
  } catch (error) {
    console.error('Serverless bootstrap failed', error);
    const message = error instanceof Error ? error.message : 'Unknown startup error';

    return sendJson(res, 500, {
      error: 'SERVERLESS_BOOTSTRAP_FAILED',
      message,
    });
  }
}