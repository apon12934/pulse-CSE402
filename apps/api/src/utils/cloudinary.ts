import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage Engine for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req, file) => {
    return {
      folder: 'pulse_uploads',
      format: 'png', // auto convert to png or use auto
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

// Export multer instance
export const upload = multer({ storage: storage });
export { cloudinary };
