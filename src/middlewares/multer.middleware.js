import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "./public/temp",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });
export { upload };
