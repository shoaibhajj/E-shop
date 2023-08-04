const express = require("express");

const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require("../services/cartService");
const authService = require("../services/authService");

const router = express.Router();
router.use(authService.protect, authService.allowedTo("user"));
router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);
router.put("/applycoupon", applyCoupon);
router
  .route("/:itemId")
  .delete(removeSpecificCartItem)
  .put(updateCartItemQuantity);

module.exports = router;
