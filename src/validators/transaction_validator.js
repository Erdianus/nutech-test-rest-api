import { body } from "express-validator";

const transactionRules = [
  body("service_code")
    .notEmpty()
    .withMessage("Parameter service_code wajib diisi"),
];

export { transactionRules };
