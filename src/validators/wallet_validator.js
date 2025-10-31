import { body } from "express-validator";

const topUpRules = [
  body("top_up_amount")
    .isInt({ gt: 0 })
    .withMessage(
      "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0"
    ),
];
export { topUpRules };
