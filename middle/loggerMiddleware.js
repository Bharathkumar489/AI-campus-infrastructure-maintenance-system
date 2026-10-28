/**
 * HTTP Request Logging & Telemetry Middleware
 */

function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    // Keep internal health checks quiet unless in error
    if (originalUrl === '/health' || originalUrl === '/api/health') return;

    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(`[HTTP] ${method} ${originalUrl} -> ${color}${status}${reset} (${duration}ms)`);
  });

  next();
}

module.exports = {
  requestLogger
};
