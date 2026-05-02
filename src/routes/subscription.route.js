import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  toggleSubscription,
  getUserChannelSubscribers
} from "../controllers/subscription.controller.js";

const router = Router();


router
  .route("/c/:channelId")
  .get(verifyJWT,getUserChannelSubscribers)
  .post(verifyJWT,toggleSubscription);

router.route("/u/:subscriberId").get(verifyJWT,getSubscribedChannels);


export default router;

