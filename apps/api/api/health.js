export default function handler(_req, res) {
  const payload = {
    status: 'ok',
    service: 'taskboard-hub-api',
    mode: 'vercel-health-js',
  };

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(200).json(payload);
    return;
  }

  if (typeof res.setHeader === 'function') {
    res.setHeader('content-type', 'application/json; charset=utf-8');
  }

  if ('statusCode' in res) {
    res.statusCode = 200;
  }

  if (typeof res.end === 'function') {
    res.end(JSON.stringify(payload));
  }
}