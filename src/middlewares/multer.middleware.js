import multer from 'multer'


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../../public/temp");
  },
  filename: function (req, file, cb) {

    // here the file. filename should not be the original name as many files can come with same name from user end
    cb(null, file.originalname);
  },
});

export const upload = multer(
     storage,
);
