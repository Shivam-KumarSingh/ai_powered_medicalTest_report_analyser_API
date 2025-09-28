const reportService = require('../services/reportService');
const tracer = require('../utils/tracer');

const simplifyReport = async (req, res, next) => {
  tracer.log('CONTROLLER', 'Received request to simplify report.');
  try {
    const result = await reportService.processReport(req);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { simplifyReport };