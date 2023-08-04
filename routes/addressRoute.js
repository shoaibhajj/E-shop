const express = require("express");
const { addAddressValidator } = require("../utils/validators/addressValidator");
const {
  addAddress,
  deleteAddress,
  getLoggedUserAddresses,
} = require("../services/addressService");
const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));
router
  .route("/")
  .post(addAddressValidator, addAddress)
  .get(getLoggedUserAddresses);
router.route("/:addressId").delete(deleteAddress);

module.exports = router;
