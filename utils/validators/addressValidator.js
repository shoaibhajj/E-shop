const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.addAddressValidator = [
  check("alias").custom((val, { req }) =>
    // check if product is existing in DB
    User.findById(req.user._id).then((user) => {
      // .some  is used when you want to check if at least one element in the array passes a condition.
      //  It requires a callback function as an argument.
      // The callback function should return true or false and it is applied to every item in the array until the function returns true.
      if (user.addresses.some((address) => address.alias === req.body.alias)) {
        return Promise.reject(
          new Error(`Alias already exists: ${req.body.alias}`)
        );
      }
    })
  ),

  validatorMiddleware,
];
// exports.deleteProductFromWishlistValidator = [
//   check("productId")
//     .isMongoId()
//     .withMessage("Invalid Review id format")
//     .custom((val, { req }) =>
//       // check if product is existing in DB
//       Product.findById(req.params.productId).then((existsProduct) => {
//         if (!existsProduct) {
//           return Promise.reject(
//             new Error(`There is no product with id ${req.params.productId}`)
//           );
//         }
//       })
//     )
//     .custom((val, { req }) =>
//       // check if product is in user's wishlist
//       User.findById(req.user._id).then((existsUser) => {
//         if (!existsUser.wishlist.includes(req.params.productId)) {
//           return Promise.reject(
//             new Error(
//               `Product with id ${req.params.productId} is not in the wishlist`
//             )
//           );
//         }
//       })
//     ),
//   validatorMiddleware,
// ];
