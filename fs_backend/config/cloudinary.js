const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "friendsspace/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill" }],
  },
});

const chatStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const mime = file.mimetype || "";
    const esVideo = mime.startsWith("video/");
    const esAudio = mime.startsWith("audio/");
    const esImagen = mime.startsWith("image/");

    return {
      folder: "friendsspace/chats",
      resource_type: esVideo || esAudio ? "video" : esImagen ? "image" : "raw",
      ...(esVideo && {
        transformation: [{ quality: "auto:low", fetch_format: "mp4" }],
      }),
    };
  },
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadChat = multer({
  storage: chatStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

module.exports = { uploadAvatar, uploadChat, cloudinary };
