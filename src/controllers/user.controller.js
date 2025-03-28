import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { json } from "express";
import jwt from "jsonwebtoken";




///function to generate both token
  const generateAccessAndRefereshTokens = async (userId) => {
    try {
      const user = await User.findById(userId);
      console.log("User found:", user);
      console.log(
        "Does generateAccessToken exist?",
        typeof user.generateAccessToken
      );
      console.log(
        "Does generateRefreshToken exist?",
        typeof user.generateRefreshToken
      );
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      console.log("Generated Access Token:", accessToken);
      console.log("Generated Refresh Token:", refreshToken);


      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
    } catch (error) {
      // console.log("Generated Access Token:", accessToken);
      // console.log("Generated Refresh Token:", refreshToken);

      throw new ApiError(
        500,
        "Something went wrong while generating referesh and access token"
      );
    }
  };
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


//LOGIN USER

const loginUser = asyncHandler(async (req, res) => {
  //req body se data lao
  //username or mail
  //find user
  //milgaya to password check
  //access and refresh token generate karke user ko send hoga
  //send these in cookies
  //successfully login

  const { email, username, password } = req.body
  console.log(req.body)
  console.log("email",email)
  if (!username && !email) {
    throw new ApiError(400,"Username or Email required")
  }

 const user=await User.findOne({
    $or: [{ username }, { email}]
 })
  if (!user) {
    throw new ApiError(404,"User does not exist")
  }
  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401,"Invalid password")
  }


  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );
  
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  
  //sending cookies for that we have to design options
  const options = {
    httpOnly: true,//due to this cookies can't modify in frintend it will be in server
    secure:true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user:loggedInUser,accessToken,refreshToken
        },
        "User Logged In SuccessFully"
      )
    )



})

const logoutUser = asyncHandler(async (req, res) => {
  //we a middle ware to get user for ayth middle ware we desgined
  //clear cookies
  //reset refresh token
   await User.findByIdAndUpdate(req.user._id,
    {
      $set: {
        refreshToken:undefined
      }
    }
  );
  const options = {
    httpOnly: true,
    secure:true
  }
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {},"User Logged Out"))

})


const refreshAccessToken = asyncHandler(async (req, res) => {
  //to refresh access token you need the refreshtoken sent by the server we can access it from cookies
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
  if (!incomingRefreshToken) {
    throw new ApiError(401,"unauthorized Request")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id)
    
    if (!user) {
      throw new ApiError(401,"Invalid refresh Token")
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401,"Refresh Token is expired")
    }
  
    const options = {
      httpOnly: true,
      secure:true
    }
    const {accessToken,newrefreshToken }=await generateAccessAndRefereshTokens(user._id)
  
    return res
      .status(200)
      .cookie("accessToken", accessToken,options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200, { accessToken, newrefreshToken },
          "Access token refreshed successfully"
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message||"Invlaid Refresh Token")
  }
  
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
//passw through auth midddleware
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400,'Invalid old Password')
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })//after update saving
  
  return res
    .status(200)
    .json(new ApiResponse(200, {},"Password Change Successfully"))
  
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user,"current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body
  if (!fullname || !email) {
    throw new ApiError(400,"All fields are required")
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email,
      },
    },
    { new: true } //new:true mean update honeke baad jo dat ata hai wo save hota hai
  ).select("-password")

  return res
    .status(200)
  .json(new ApiResponse(200,user,"Account Details Updated..."))
})

//file updation 2 middleware will be used

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path//this req.file come from multer middle ware;
  
  if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is missing ")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400,"Error while Uploading on Avatar")
  }

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar:avatar.url
      }
    },
    {new :true}
  ).select("-password")

  return res.status(200).json(new ApiResponse(200,user,"Avatar updated"))
})

const updateUserCoverimage = asyncHandler(async (req, res) => {
  const coverimageLocalpath = req.file?.path
  if (!coverimageLocalpath) {
    throw new ApiError(400,"Coverimage is missing")
  }
  const coverimage = await uploadOnCloudinary(coverimageLocalpath)
  if (!coverimage.url) {
    throw new ApiError(400,"Error uploading coverimage")
  }
 const user= await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverimage:coverimage.url
      }
    },
    {new:true}
  ).select("-password")
  return res.status(200).json(new ApiResponse(200, user, "coveriamge updated"));

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params
  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscriber",
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscriber",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscriber.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        //jo jo dekhana hai
        fullname: 1,
        username: 1,
        subscriberCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverimage: 1,
        email:1
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel doesnot exist");
  }
  console.log(channel);
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched Succesfully")
  )
 
})

export { registerUser,loginUser,logoutUser ,refreshAccessToken,changeCurrentPassword,updateAccountDetails,updateUserAvatar,updateUserCoverimage,getCurrentUser,getUserChannelProfile};
