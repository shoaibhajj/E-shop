const asyncHandler = require("express-async-handler");

const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const ApiError = require("../utils/apiError");

const calcTotalcartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((cartItem) => {
    totalPrice += cartItem.price * cartItem.quantity;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// @desc    add product to cart
// @route   POST  /api/v1/cart
// @access  protect/user
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);
  // 1) Get cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  // if user does not have a cart
  if (!cart) {
    // 2) Create cart for logged user and add product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
    // if user has already cart
  } else {
    //if product is already exist in cart ,update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    // if exist
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      //if product is not exist ,Push the product to cartItems array
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
      });
    }
  }

  // Calculate total cart price
  calcTotalcartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    message: "Product added to cart successfully ",
    data: cart,
  });
});

// @desc    Get logged user cart
// @route   Get  /api/v1/cart
// @access  protect/user
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart)
    return next(
      new ApiError(`There is no card for this user id ${req.user._id}`),
      404
    );
  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
// @desc    delete specific cart item
// @route   delete  /api/v1/cart/:itemId
// @access  protect/user
exports.removeSpecificCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  calcTotalcartPrice(cart);
  cart.save();
  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    delete all Items in cart
// @route   Put  /api/v1/cart/
// @access  protect/user
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc    Update specific cart item quantity
// @route   Put  /api/v1/cart/itemId
// @access  protect/user
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError(`there is no cart for user ${req.user._id}`, 404));
  }
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const product = await Product.findById(
      cart.cartItems[itemIndex].product.toString()
    );
    if (product.quantity < quantity) {
      return next(
        new ApiError(
          `The is no enough quantity for this product ${cart.cartItems[
            itemIndex
          ].product.toString()}`
        )
      );
    }
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`There is no item for this id ${req.params.itemId}`, 404)
    );
  }

  calcTotalcartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    message: "Product added to cart successfully ",
    data: cart,
  });
});

// @desc    applay coupon logged user
// @route   Put  /api/v1/cart/itemId
// @access  protect/user
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new ApiError(`coupon is invalid or expired`));
  }
  // 2) Get logged user cart to get total card price
  const cart = await Cart.findOne({ user: req.user._id });
  const totalPrice = cart.totalCartPrice;

  // 3) calculate price after discount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();
  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    message: "Product added to cart successfully ",
    data: cart,
  });
});
