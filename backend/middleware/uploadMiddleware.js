const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists in the backend root
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Retain file extension and generate a safe, unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip/;
  const isExtensionAllowed = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  if (isExtensionAllowed) {
    cb(null, true);
  } else {
    cb(new Error('File format not supported! Only images, PDFs, text, zip and office files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;
