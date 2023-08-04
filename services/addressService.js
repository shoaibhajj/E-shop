const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc    add address to user addresses list
// @route   POST  /api/v1/address
// @access  protect/user
exports.addAddress = asyncHandler(async (req, res, next) => {
  // $addToSet => add address Object to addresses list if address not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    message: "Address added successfully",
    // eslint-disable-next-line no-undef
    data: user.addresses,
  });
});

// @desc    delete Address from user addresses list
// @route   DELETE  /api/v1/address
// @access  protect/user
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  // $addToSet => remove Address Object from user addresses if addressesId exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // we need to remove the address Object from Addresses list not just delete addressId
      $pull: { addresses: { _id: req.params.addressId } },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "success",
    message: "Address removed successfully.",
    result: user.addresses.length,
    data: user.addresses,
  });
});

// @desc    Get logged user Addresses
// @route   Get  /api/v1/address
// @access  protect/user
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");

  res.status(200).json({
    status: "success",
    result: user.addresses.length,
    data: user.addresses,
  });
});
