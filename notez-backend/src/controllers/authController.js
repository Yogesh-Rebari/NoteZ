const User = require('../models/User');
const { AppError, catchAsync, generateToken } = require('../utils/helpers');
const jwt = require('../utils/jwt');

/**
 * Authentication Controller
 */
class AuthController {
  /**
   * Register new user
   */
  register = catchAsync(async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmailOrUsername(email) || 
                        await User.findByEmailOrUsername(username);
    
    if (existingUser) {
      throw new AppError('User with this email or username already exists', 400);
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // Generate JWT token
    const token = jwt.generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  });

  /**
   * Login user
   */
  login = catchAsync(async (req, res) => {
    const { identifier, password } = req.body;

    // 1) Check if email and password exist
    if (!identifier || !password) {
      throw new AppError('Please provide email/username and password!', 400);
    }

    // 2) Check if user exists and password is correct
    const user = await User.findByEmailOrUsername(identifier).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Incorrect email/username or password', 401);
    }

    // 3) Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 401);
    }

    // 4) Update last active and login count
    await user.updateLastActive();

    // 5) Generate JWT token
    const token = jwt.generateToken(user._id);

    // 6) Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  });

  /**
   * Logout user (client-side token removal)
   */
  logout = catchAsync(async (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });

  /**
   * Get current user profile
   */
  getMe = catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id)
      .populate('adminGroups', 'name description memberCount')
      .populate('memberGroups', 'name description memberCount');

    res.status(200).json({
      status: 'success',
      data: {
        user: user.getPublicProfile()
      }
    });
  });

  /**
   * Update current user profile
   */
  updateMe = catchAsync(async (req, res) => {
    const { firstName, lastName, bio, preferences } = req.body;
    const user = req.user;

    // Update allowed fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: user.getPublicProfile()
      }
    });
  });

  /**
   * Change password
   */
  updatePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  });

  /**
   * Forgot password
   */
  forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('There is no user with that email address', 404);
    }

    // Generate reset token
    const resetToken = generateToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    console.log(`Password reset token: ${resetToken}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email'
    });
  });

  /**
   * Reset password
   */
  resetPassword = catchAsync(async (req, res) => {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Generate new JWT token
    const jwtToken = jwt.generateToken(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        token: jwtToken,
        user: user.getPublicProfile()
      }
    });
  });

  /**
   * Verify email
   */
  verifyEmail = catchAsync(async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token
    });

    if (!user) {
      throw new AppError('Invalid verification token', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  });

  /**
   * Resend verification email
   */
  resendVerification = catchAsync(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    // Generate new verification token
    const verificationToken = generateToken();
    user.emailVerificationToken = verificationToken;
    await user.save({ validateBeforeSave: false });

    // TODO: Send verification email
    console.log(`Email verification token: ${verificationToken}`);

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent'
    });
  });

  /**
   * Refresh token
   */
  refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new access token
    const newToken = jwt.generateToken(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        token: newToken,
        user: user.getPublicProfile()
      }
    });
  });
}

module.exports = new AuthController();