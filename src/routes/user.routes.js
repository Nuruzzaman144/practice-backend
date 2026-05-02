import { Router } from "express";
import {
  registerUser,
  LoginUser,
  LogoutUser,
  refreshAccessToken,
  changedCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  updateUserAvatar,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/videos.controller.js";
import { createTweet, getUserTweets } from "../controllers/tweet.controller.js";


const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(LoginUser);
router.route("/logout").post(verifyJWT, LogoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changedCurrentPassword);
router.route("/current-users").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/avatr")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);


//video path 





export default router;
