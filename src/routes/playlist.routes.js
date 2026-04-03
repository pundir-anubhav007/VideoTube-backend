import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getPlaylistById,
  getUserPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

// Apply verifyJWT middleware to all routes in this file
// Since every playlist action requires a logged-in user (req.user._id)
router.use(verifyJWT);

// Core Playlist Routes (/api/v1/playlists)
router.route("/create-playlist").post(createPlaylist);

router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

//  User Playlists Route
router.route("/user/:userId").get(getUserPlaylists);

//  Playlist Video Management Routes
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

export default router;
