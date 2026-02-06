import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Resolve Absolute Path (Fixes folder creation issues)
// This puts 'uploads' in your project root, not inside 'src' or 'dist'
const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  console.log('📂 Creating uploads folder at:', uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the absolute path
  },
  filename: (req, file, cb) => {
    // Simple filename to avoid errors
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `tender-${uniqueSuffix}${ext}`);
  }
});

// 3. Export Multer (No Filter, Higher Limits)
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});