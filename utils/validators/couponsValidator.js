const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Coupon = require("../../models/couponModel");

exports.addCoupon = [
  check("name")
    .notEmpty()
    .withMessage("Please enter a name for the coupon")
    .isUppercase()
    .withMessage("Please enter a name for the coupon in Upper Case")
    .custom((val, { req }) =>
      // check if coupon is existing in DB
      Coupon.findOne({ name: req.body.name }).then((existsCoupon) => {
        if (existsCoupon) {
          return Promise.reject(
            new Error(`The name of coupun is already exist ${req.body.name}`)
          );
        }
      })
    ),
  validatorMiddleware,
];
