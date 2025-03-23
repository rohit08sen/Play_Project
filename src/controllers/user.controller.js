import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation-not empty
  //check if user already exists:username email
  //check for images, also avatar
  //upload them to cloudinary,avatar
  //create user object--create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //retrun res

  const { fullname, email,  password ,username} = req.body;
  console.log("email:", email);
  console.log("req files", req.files);
  console.log("Recieved req body:", req.body)
  
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already Exist");
  }

  const avatarlocalpath = req.files?.avatar?.[0]?.path;
  const coverimagelocalpath = req.files?.coverimage?.[0]?.path;

  console.log("Avatar Local Path:", avatarlocalpath);
  console.log("Cover Image Local Path:", coverimagelocalpath);

  if (!avatarlocalpath || !coverimagelocalpath) {
    return res.status(400).json({ error: "Missing avatar or cover image" });
  }

  const avatar = await uploadOnCloudinary(avatarlocalpath);
  const coverimage = await uploadOnCloudinary(coverimagelocalpath);

  if (!avatar || !avatar.url) {
    return res.status(400).json({ error: "Avatar upload failed" });
  }
  if (!coverimage || !coverimage.url) {
    return res.status(400).json({ error: "Cover image upload failed" });
  }


  const user = await User.create({
    fullname,
    email,
    password,
    username,
    avatar: avatar?.url,
    coverimage:coverimage?.url
  });

  console.log(user);
  return res.json(201, " created  : " , user)

  
  
});

export { registerUser };
