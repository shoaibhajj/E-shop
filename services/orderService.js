const stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const ApiError = require("../utils/apiError");

const Product = require("../models/productModel");
const User = require("../models/userModel");

// @desc    Create cash order
// @route   Post  api/v1/orders/cartId
// @access  protected/user
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend  on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart)
    return next(new ApiError(`There is no cart with id ${req.params.cartId}`));

  // 2) Get order price based on cartPrice ("Check if coupon apply ")
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  // 3) Create order with default paymentMethodType  cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  // 4) After creating order decrement product quantity and increment product sold
  if (order) {
    const bulkOptions = await cart.cartItems.map((Item) => ({
      updateOne: {
        filter: { _id: Item.product },
        update: { $inc: { quantity: -Item.quantity, sold: +Item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOptions, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: "success", data: order });
});

exports.filterOrderforLoggedUser = asyncHandler((req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});

// @desc    Get all orders
// @route   Get  api/v1/orders/
// @access  protected/user-Admin-Manager
exports.findAllOrders = factory.getAll(Order);

// @desc    Get specifc order
// @route   Get  api/v1/orders/:id
// @access  protected/user-Admin-Manager
exports.findSpecifcOrder = factory.getOne(Order);

// @desc    Update  order paid status to paid
// @route   Get  api/v1/orders/:id/pay
// @access  protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(`there is no such order ${req.params.id}`, 404));
  }
  // Update the order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc    Update  order Delivered status to Delivered
// @route   Get  api/v1/orders/:id/delivered
// @access  protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(`there is no such order ${req.params.id}`, 404));
  }
  // Update the order to paid
  order.isDelivered = true;
  order.deliverdAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc    Get checkout session from stripe and it as a response
// @route   Get  api/v1/orders/checkout-session/:cartId
// @access  protected/user
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend  on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart)
    return next(new ApiError(`There is no cart with id ${req.params.cartId}`));

  // 2) Get order price based on cartPrice ("Check if coupon apply ")
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/v1/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cart`,
    customer_email: req.user.email,

    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethodType  card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });
  // 4) After creating order decrement product quantity and increment product sold
  if (order) {
    const bulkOptions = await cart.cartItems.map((Item) => ({
      updateOne: {
        filter: { _id: Item.product },
        update: { $inc: { quantity: -Item.quantity, sold: +Item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOptions, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};

// @desc    this webhook will run when stripe payment  success paid
// @route   Post  /webhook-checkout
// @access  protected/user
exports.webhookCheckout = asyncHandler(async (request, response) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  if (event.type === "checkout.session.completed") {
    // create Order
    createCardOrder(event.data.object);
  }
  response.status(200).json({ recived: true });
});
