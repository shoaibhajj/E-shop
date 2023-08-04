const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Review = require("../../models/reviewModel");
const Product = require("../../models/productModel");

// we can use body to see if there are any thing in body
// but if we use check then we can see if there are any change in body And in Params

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("ratings value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("ratings value must be between 1 to 5"),
  check("user").isMongoId().withMessage("Invalid Review id format"),
  check("product")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) =>
      // check if product is existing in DB
      Product.findById(req.body.product).then((existsProduct) => {
        if (!existsProduct) {
          return Promise.reject(
            new Error(`There is no product with id ${req.body.product}`)
          );
        }
      })
    )
    .custom((val, { req }) =>
      // check if logged user create review before
      Review.findOne({ user: req.user._id, product: req.body.product }).then(
        (review) => {
          if (review) {
            return Promise.reject(
              new Error("You already created a review before")
            );
          }
        }
      )
    ),
  validatorMiddleware,
];

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format"),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((value, { req }) =>
      // check review ownership before updating
      Review.findById(value).then((review) => {
        if (!review) {
          return Promise.reject(
            new Error(`There is no review with id ${value}`)
          );
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("'You are not allowed to perform this action")
          );
        }
      })
    ),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((value, { req }) => {
      // check review ownership before updating
      if (req.user.role === "user") {
        return Review.findById(value).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`There is no review with id ${value}`)
            );
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error("'You are not allowed to perform this action")
            );
          }
        });
      }
      return true;
    }),

  validatorMiddleware,
];
