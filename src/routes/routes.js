import { Router } from "express";
import multer from "multer";
import validate from "../middlewares/validate.js";
import { auth } from "../middlewares/auth.js";
import { registerRules, loginRules } from "../validators/auth_validator.js";
import { transactionRules } from "../validators/transaction_validator.js";
import { topUpRules } from "../validators/wallet_validator.js";
import {
  editUserRules,
  imageProfileRules,
} from "../validators/user_validator.js";
import * as authCtrl from "../controllers/authController.js";
import * as userCtrl from "../controllers/userController.js";
import * as transactionCtrl from "../controllers/transactionController.js";
import {
  getServices,
  getBanners,
} from "../controllers/informationController.js";

// Configure multer for image uploads
const upload = multer({
  //   limits: {
  //     fileSize: 1024 * 1024, // 1 MB
  //   },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
      return cb(new Error("Format Image tidak sesuai"));
    }
    if (
      !["image/jpeg", "image/jpg", "image/png"].includes(
        file.mimetype.toLowerCase()
      )
    ) {
      return cb(new Error("Format Image tidak sesuai"));
    }
    cb(null, true);
  },
});

const router = Router();

// Authentication routes
router.post("/registration", validate(registerRules), authCtrl.register);
router.post("/login", validate(loginRules), authCtrl.login);

//User routes
router.get("/profile", auth, userCtrl.getProfile);
router.put(
  "/profile/update",
  auth,
  validate(editUserRules),
  userCtrl.updateUser
);
router.put(
  "/profile/image",
  auth,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.log(err);

        return res.status(400).json({
          status: 102,
          message: err.message || "Format Image tidak sesuai",
          data: null,
        });
      }
      next();
    });
  },
  validate(imageProfileRules, { customError: true, bodyStatus: 102 }), // Then validate
  userCtrl.uploadProfileImage
);

//Information routes
router.get("/banner", getBanners);
router.get("/services", auth, getServices);

// Transaction routes
router.get("/balance", auth, transactionCtrl.getBalance);
router.post("/topup", auth, validate(topUpRules), transactionCtrl.topUp);
router.post(
  "/transaction",
  auth,
  validate(transactionRules),
  transactionCtrl.paymentService
);
router.get("/transaction/history", auth, transactionCtrl.getTransactionHistory);

export default router;
