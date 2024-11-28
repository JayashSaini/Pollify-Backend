const { ApiError } = require('../utils/ApiError.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const User = require('../models/auth/user.models.js');
const jwt = require('jsonwebtoken');

const verifyJWT = asyncHandler(async (req, res, next) => {
  // Step 1: Extract the token
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', ''); // Ensure proper replacement with space

  console.log('req.cookies = ' + JSON.stringify(req.cookies));
  console.log('[verifyJWT] Extracted Token:', token);

  if (!token) {
    console.error('[verifyJWT] No token found in request');
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    // Step 2: Verify the token
    console.log('[verifyJWT] AccessToken : ', process.env.ACCESS_TOKEN_SECRET);
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log('[verifyJWT] Decoded Token:', decodedToken);

    // Step 3: Find the user by ID
    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken'
    );

    if (!user) {
      console.error('[verifyJWT] No user found for the provided token');
      throw new ApiError(401, 'Invalid access token');
    }

    console.log('[verifyJWT] User found:', user);

    req.user = user;
    next();
  } catch (error) {
    // Step 4: Handle errors
    console.error(
      '[verifyJWT] Error during token verification:',
      error.message
    );
    console.error('[verifyJWT] Full Error Stack:', error.stack);

    throw new ApiError(401, error?.message || 'Invalid access token');
  }
});

module.exports = { verifyJWT };
