import { v2 as cloudinary } from "cloudinary";
//learn about node js fs
import fs from "fs"

 cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KE,
   api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
 });


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
      const response= await cloudinary.uploader.upload(localFilePath, {
      resource_type:"auto"
    })
    //file has been uploaded succussfully
    console.log("Uploaded", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath)//remove locally saved temporary file as the upload operation got failed
    return null;
  }
}

export {uploadOnCloudinary}