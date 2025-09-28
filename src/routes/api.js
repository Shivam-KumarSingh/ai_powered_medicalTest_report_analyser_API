const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const uploadMiddleware = require('../middleware/fileUpload');
router.post('/simplify-report', uploadMiddleware, reportController.simplifyReport);

module.exports = router;