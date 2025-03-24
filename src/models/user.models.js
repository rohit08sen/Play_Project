import mongoose from "mongoose";
import { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // Cloudinary storage
      required: true,
    },
    coverimage: {
      type: String, // Cloudinary URL
    },
    watchhistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
      default: "", // Ensure it is initialized
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Fix typo in `generateAccsessToken` -> `generateAccessToken`
userSchema.methods.generateAccessToken = function () {
  console.log("Generating Access Token for:", this._id);
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  console.log("Generated Access Token:", token);
  return token;
};

userSchema.methods.generateRefreshToken = function () {
  console.log("Generating Refresh Token for:", this._id);
  // console.log("REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET);
  // console.log("REFRESH_TOKEN_EXPIRY:", process.env.REFRESH_TOKEN_EXPIRY);

  const token = jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
  console.log("Generated Refresh Token:", token);
  return token;
};


export const User = mongoose.model("User", userSchema);
