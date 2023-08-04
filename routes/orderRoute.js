const express = require("express");

const {
  createCashOrder,
  findAllOrders,
  filterOrderforLoggedUser,
  findSpecifcOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require("../services/orderService");
const authService = require("../services/authService");

const router = express.Router();

router.get(
  "/checkout-session/:cartId",
  authService.protect,
  authService.allowedTo("user"),
  checkoutSession
);
router.post(
  "/:cartId",
  authService.protect,
  authService.allowedTo("user"),
  createCashOrder
);
router.get(
  "/",
  authService.protect,
  authService.allowedTo("user", "admin", "manager"),
  filterOrderforLoggedUser,
  findAllOrders
);
router.get(
  "/:id",
  authService.protect,
  authService.allowedTo("user", "admin", "manager"),
  findSpecifcOrder
);
router.put(
  "/:id/pay",
  authService.protect,
  authService.allowedTo("admin", "manager"),
  updateOrderToPaid
);
router.put(
  "/:id/deliver",
  authService.protect,
  authService.allowedTo("admin", "manager"),
  updateOrderToDelivered
);
module.exports = router;
