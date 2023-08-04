const multer = require("multer");
const ApiError = require("../utils/apiError");

// 1- DiskStorage engine
// const multerStorage = multer.diskStorage({
//   // cb is called callback function like next()
//   destination: function (req, file, cb) {
//     cb(null, "uploads/categories");
//   },
//   filename: function (req, file, cb) {
//     // category-${id}-${Date-now()}.${jpeg}
//     const ext = file.mimetype.split("/")[1];
//     const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
//     cb(null, filename);
//   },
// });

const multerOptions = () => {
  // 2) Memory buffer engine
  const multerStorage = multer.memoryStorage();

  const multerFileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only images are allowed", 400), false);
    }
  };

  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFileFilter,
  });
  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (ArrayOfFields) =>
  multerOptions().fields(ArrayOfFields);
