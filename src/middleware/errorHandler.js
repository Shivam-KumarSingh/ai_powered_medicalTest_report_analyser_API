const tracer = require('../utils/tracer');
const errorHandler = (err, req, res, next) => {
  tracer.error('ERROR_HANDLER', 'Caught application error:', err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
};
module.exports = errorHandler;