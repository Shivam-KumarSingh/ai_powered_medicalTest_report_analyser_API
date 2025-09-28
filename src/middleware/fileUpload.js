const multer = require('multer');
const tracer = require('../utils/tracer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only JPG and PNG are allowed!'), false);
    }
  },
});

const uploadMiddleware = (req, res, next) => {
  tracer.log('MIDDLEWARE', 'Processing file upload...');
  upload.single('file')(req, res, (err) => {
    if (err) {
      tracer.error('MIDDLEWARE', 'File upload error:', err);
      return res.status(400).json({ status: 'error', message: err.message });
    }
    next();
  });
};

module.exports = uploadMiddleware;