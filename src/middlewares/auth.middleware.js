import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    //getting the token if cookies hai accesstoken lo but in mobile app from header we hai authorization where Bearer AccsessToken is present so...from header also we can access
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401,"Unauthorized Request")
    }
  //jwt provides a method to verify ...it will match then give the data ..see the generate access token in usermodel...
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //then find user ...
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if (!user) {
      //TODO: discuss about frontend
      throw new ApiError(401,"Invalid Acesss Token")
    }
    //here we have added another object to req which will be used in logged  out to get user
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401,error?.message|| "Invalid message token")
  }
})

//go in logout router add this middleware