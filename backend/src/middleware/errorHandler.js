// errorHandler.js – catches anything passed to next(err) and returns a consistent shape
// Always the last middleware registered in app.js
function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already exists` });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    return res.status(400).json({ message: 'Validation error', errors });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
}

module.exports = errorHandler;
