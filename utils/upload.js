const multer = require("multer");
const path = require("path");

const createUploader = (folder) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `public/uploads/${folder}/`);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  return multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      file.mimetype.startsWith("image/")
        ? cb(null, true)
        : cb(new Error("Seules les images sont autorisées (max 5MB)"), false);
    },
  });
};

module.exports = {
  uploadUser: createUploader("users"),
  uploadClient: createUploader("clients"),
};
