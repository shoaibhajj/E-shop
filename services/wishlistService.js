const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc    add prodcut to wishlist
// @route   POST  /api/v1/wishlist
// @access  protect/user
exports.addProdcutToWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet => add prodcutId to wishlist if productId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist",
    // eslint-disable-next-line no-undef
    data: user.wishlist,
  });
});

// @desc    delete prodcut to wishlist
// @route   DELETE  /api/v1/wishlist
// @access  protect/user
exports.deleteProdcutFromWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet => add prodcutId to wishlist if productId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    message: "Product removed successfully from your wishlist",
    data: user.wishlist,
  });
});

// @desc    Get logged user wishlist
// @route   Get  /api/v1/wishlist
// @access  protect/user
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    status: "success",
    result: user.wishlist.length,
    data: user.wishlist,
  });
});
