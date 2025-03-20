import mongoose from "mongoose";
import { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

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
    fullName: {
      type: String,
      required: true,
      trim: true,
      index:true,
    },
    avatar: {
      type: String,//cloudinary mein  store hoga
      required:true
    },
    coverImage: {
      type:String,//cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref:"Video"
      }
    ],
    password: {
      type: String,
      required:[true,'Password is Required']
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next()
})

//custom method design

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);//here password-->jo user ne type kiya   this.password--->jo encrypted hua password it check wheter u have type right password or not
}

userSchema.methods.generateAccsessToken = function () { 
  jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  );
}
userSchema.methods.generateRefreshToken = function () {
   jwt.sign(
     {
       _id: this._id,
       
     },
     process.env.REFRESH_TOKEN_SECRET,
     {
       expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
     }
   );
};

export const User=mongoose.model("User",userSchema)