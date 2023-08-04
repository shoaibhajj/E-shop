const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");

const generateToken = require("../utils/generateToken");

// @desc    signup
// @route   GET /api/v1/auth/signup
// @access  public
// the user here will be signed up as a user just (not admin)
exports.signUp = asyncHandler(async (req, res, next) => {
  // 1) Create a new user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  // 2) Generate jwb token  with func sing we generate
  const token = generateToken(user._id);
  res.status(201).json({ data: user, token });
});

// @desc    login
// @route   GET /api/v1/auth/login
// @access  public
// the user here will be signed up as a user just (not admin)
exports.logIn = asyncHandler(async (req, res, next) => {
  // 1) Check if the user already exists  and if correct password
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  // 2) Generate jwb token  with func sing we generate
  const token = generateToken(user._id);

  res.status(200).json({ data: user, token });
});
// @desc   make sure that user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if Token is exist , if exists holds it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in ,please login to get access this route",
        401
      )
    );
  }
  // 2) verify token (no change happens , expired token)
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user is exist
  const currentUser = await User.findById(decodedToken.userId);
  if (!currentUser) {
    return next(
      new ApiError("the user that belongs to this token does nol longer exist")
    );
  }
  // 4) Check if user change his password after token created
  if (currentUser.passwordChangeAt) {
    // passChangedTimestamp to make passwordChageAt like timestamp and /1000 to remove milliseconds and ,10 that means we git number without ,

    const passChangedTimestamp = parseInt(
      currentUser.passwordChangeAt.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decodedToken.iat) {
      return next(
        new ApiError(
          "User recently changed his password , please login again",
          401
        )
      );
    }
  }
  // 5) check if user not active
  if (!currentUser.active) {
    return next(
      new ApiError(
        "Your account is not active , please Activate your account",
        401
      )
    );
  }
  req.user = currentUser;
  next();
});

exports.protectAndActivate = asyncHandler(async (req, res, next) => {
  // 1) Check if Token is exist , if exists holds it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in ,please login to get access this route",
        401
      )
    );
  }
  // 2) verify token (no change happens , expired token)
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user is exist
  const currentUser = await User.findById(decodedToken.userId);
  if (!currentUser) {
    return next(
      new ApiError("the user that belongs to this token does nol longer exist")
    );
  }
  // 4) Check if user change his password after token created
  if (currentUser.passwordChangeAt) {
    // passChangedTimestamp to make passwordChageAt like timestamp and /1000 to remove milliseconds and ,10 that means we git number without ,

    const passChangedTimestamp = parseInt(
      currentUser.passwordChangeAt.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decodedToken.iat) {
      return next(
        new ApiError(
          "User recently changed his password , please login again",
          401
        )
      );
    }
  }
  req.user = currentUser;
  next();
});
// @desc authorization (user Permission)
// ...roles called rest parameters syntacs  array of strings ["admin", "manager"]
exports.allowedTo = (...roles) =>
  // (...roles) => then we access parameters form function (...roles) to inside  another function
  // that called clogers in javascript
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user)
    if (!roles.includes(req.user.role))
      return next(
        new ApiError("You are not allowed to access this route.", 403)
      );
    next();
  });

// @desc    Forgot password
// @route   GET /api/v1/auth/forgotpassword
// @access  public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user for this email ${req.body.email}`)
    );
  }
  // 2) If user exists ,Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // save hashed password reset code  in db
  user.passwordResetCode = hashedResetCode;
  // add Expiration time for password reset code (10 minutes)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();
  // 3) send the reset code via email
  const message = `Hi ${user.name},\n we received  a request to reset your password on E-shop Account. \n
    ${resetCode} \n Enter this code to reset your password. \n thanks for helping us keep your Account secure. 
  `;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password  reset code (valid for 10 minutes)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    return next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "success", message: "Reset code sent to email" });
});

// @desc    verify reset code password
// @route   GET /api/v1/auth/verifyRestCode
// @access  public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset Code Invalid or expired"));
  }

  // Reset code Valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: "success" });
});

// @desc    reset password
// @route   GET /api/v1/auth/resetPassword
// @access  public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user with this email ${req.body.email}`, 404)
    );
  }
  // check if reset code is verified
  if (!user.passwordResetVerified) {
    return next(new ApiError(`Reset code not verified`, 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is successful , Generate Token
  const token = generateToken(user._id);

  res.status(200).json({ token });
});
