const express = require("express");
const {
  signUpValidator,
  logInValidator,
} = require("../utils/validators/authValidator");

const {
  signUp,
  logIn,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../services/authService");

const router = express.Router();

router.post("/signup", signUpValidator, signUp);
router.post("/login", logInValidator, logIn);
router.post("/forgotpassword", forgotPassword);
router.post("/verifyResetCode", verifyPassResetCode);
router.put("/resetPassword", resetPassword);
module.exports = router;
