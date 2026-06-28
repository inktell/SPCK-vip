import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'Root',
  api_key: process.env.CLOUDINARY_API_KEY || '462851282682117',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'nKbZVC22sIreClysohQ_l6U6rv0',
});

export default cloudinary;
