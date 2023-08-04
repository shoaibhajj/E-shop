const express = require("express");
const { addCoupon } = require("../utils/validators/couponsValidator");
const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../services/couponService.");
const authService = require("../services/authService");

const router = express.Router();
router.use(authService.protect, authService.allowedTo("admin", "manager"));
router.route("/").get(getCoupons).post(addCoupon, createCoupon);
router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
