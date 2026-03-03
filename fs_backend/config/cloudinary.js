const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage para avatares, solo imágenes, recortadas a 300x300
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'friendsspace/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill' }],
  },
});

// Storage para chats, cualquier tipo de archivo
const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'friendsspace/chats',
    resource_type: 'auto',
  },
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadChat = multer({ storage: chatStorage });

module.exports = { uploadAvatar, uploadChat, cloudinary };