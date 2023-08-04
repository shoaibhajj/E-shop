const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changePassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  activeLoggedUserData,
} = require("../services/userService");

const authService = require("../services/authService");

const router = express.Router();

router.get("/getMe", authService.protect, getLoggedUserData, getUser);
router.put("/changeMyPassword", authService.protect, updateLoggedUserPassword);
router.put(
  "/ ",
  authService.protect,
  updateLoggedUserValidator,
  updateLoggedUserData
);
router.delete("/deleteMe", authService.protect, deleteLoggedUserData);
router.put("/activeMe", authService.protectAndActivate, activeLoggedUserData);

// here when we use router.use we put these to service to all routes so protect and allowed added to routes
router.use(authService.protect, authService.allowedTo("admin", "manager"));

router.put("/changePassword/:id", changeUserPasswordValidator, changePassword);
router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
