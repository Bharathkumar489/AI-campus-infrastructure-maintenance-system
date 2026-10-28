const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Target directory for uploaded complaint and evidence photos
const uploadDir = path.resolve(__dirname, '../backend/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanExt = ext.toLowerCase();
    cb(null, `upload-${Date.now()}-${uuidv4().substring(0, 6)}${cleanExt}`);
  }
});

// File filter (Only JPEG, PNG, WEBP, GIF images allowed)
const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMime.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, and WebP image uploads are supported.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

const uploadSingleImage = upload.single('image');
const uploadEvidence = upload.single('evidence');

module.exports = {
  upload,
  uploadSingleImage,
  uploadEvidence,
  uploadDir
};
