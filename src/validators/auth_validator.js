import { body } from "express-validator";

const registerRules = [
  body("first_name").trim().notEmpty().withMessage("First Name wajib diisi"),
  body("last_name").trim().notEmpty().withMessage("Last Name wajib diisi"),
  body("email").isEmail().withMessage("Paramter email tidak sesuai format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter"),
];

const loginRules = [
  body("email").isEmail().withMessage("Parameter email tidak sesuai format"),
  body("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter"),
];
export { registerRules, loginRules };
