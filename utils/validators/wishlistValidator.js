const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");

exports.addProductToWishlistValidator = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) =>
      // check if product is existing in DB
      Product.findById(req.body.productId).then((existsProduct) => {
        if (!existsProduct) {
          return Promise.reject(
            new Error(`There is no product with id ${req.body.productId}`)
          );
        }
      })
    ),
  validatorMiddleware,
];
exports.deleteProductFromWishlistValidator = [
  check("productId")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) =>
      // check if product is existing in DB
      Product.findById(req.params.productId).then((existsProduct) => {
        if (!existsProduct) {
          return Promise.reject(
            new Error(`There is no product with id ${req.params.productId}`)
          );
        }
      })
    )
    .custom((val, { req }) =>
      // check if product is in user's wishlist
      User.findById(req.user._id).then((existsUser) => {
        if (!existsUser.wishlist.includes(req.params.productId)) {
          return Promise.reject(
            new Error(
              `Product with id ${req.params.productId} is not in the wishlist`
            )
          );
        }
      })
    ),
  validatorMiddleware,
];
