const express = require("express");
const {
  addProductToWishlistValidator,
  deleteProductFromWishlistValidator,
} = require("../utils/validators/wishlistValidator");
const {
  addProdcutToWishlist,
  deleteProdcutFromWishlist,
  getLoggedUserWishlist,
} = require("../services/wishlistService");
const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));
router
  .route("/")
  .post(addProductToWishlistValidator, addProdcutToWishlist)
  .get(getLoggedUserWishlist);
router
  .route("/:productId")
  .delete(deleteProductFromWishlistValidator, deleteProdcutFromWishlist);

module.exports = router;
