import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    //  console.log("All cookies:", req.cookies); // should show accessToken
    //  console.log("All headers:", req.headers.cookie);
    const token =  req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(404, "Authorization Cookie is missing");
    }



    const decodedTokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedTokenInfo?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    
    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access token");
  }
});
