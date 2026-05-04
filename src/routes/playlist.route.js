import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist);
router.route("/u/:userId").get(getUserPlaylists)
router.route("/p/:playlistId/u/:videoId")
router.route("/add-video/p/:playlistId/v/:videoId").post(addVideoToPlaylist).get(getPlaylistById)
router.route("/remove/p/:playlistId/v/:videoId").delete(removeVideoFromPlaylist)
router.route("/remove-play-list/p/:playlistId").delete(deletePlaylist)
router.route("/update/p/:playlistId").patch(updatePlaylist)
export default router;
