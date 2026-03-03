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

export default async function handler(req, res) {
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