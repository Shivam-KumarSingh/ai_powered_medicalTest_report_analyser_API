const tracer = {
  log: (module, message, data = '') => {
    console.log(`[${new Date().toISOString()}] [${module}] ${message}`, data);
  },
  error: (module, message, error) => {
    console.error(`[${new Date().toISOString()}] [${module}] ERROR: ${message}`, error);
  },
};

module.exports = tracer;