import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount:1,
    },
    {
      name: "coverimage",
      maxCount:1
    }
  ]),
  registerUser
);
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)//used the verifyJwt middleware now we get access before logoutUser call got to usercontroller
router.route("/refresh-token").post(refreshAccessToken)
export default router;
