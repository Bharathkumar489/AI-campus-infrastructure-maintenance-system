/**
 * Centralized Error Handling Middleware
 */

function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}

function errorHandler(err, req, res, next) {
  console.error(`[API Error ${new Date().toISOString()}] ${req.method} ${req.originalUrl}:`, err.message || err);

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Uploaded photo exceeds 10MB maximum limit.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    statusCode,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
