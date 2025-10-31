import { body, check } from "express-validator";

const editUserRules = [
  body("first_name").trim().notEmpty().withMessage("First Name wajib diisi"),
  body("last_name").trim().notEmpty().withMessage("Last Name wajib diisi"),
];

const imageProfileRules = [
  check("file").custom((_, { req }) => {
    if (!req.file) {
      throw new Error("Profile image wajib diunggah");
    }
    // File type is already validated by multer
    return true;
  }),
];

export { editUserRules, imageProfileRules };
