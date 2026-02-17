import { Router } from "express";
import {
  getAllVideo,
  publishAvideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isOwner } from "../middlewares/owner.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/fetch", getAllVideo);
router.post(
  "/upload",
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAvideo
);
router.get("/:videoId", getVideoById);
router.patch(
  "/:videoId",
  verifyJWT,
  isOwner, // middleware loads req.resource
  upload.single("videoFile"),
  updateVideo
);
router.delete("/:videoId", verifyJWT, isOwner, deleteVideo);
router.patch(
  "/toggle/publish/:videoId",
  verifyJWT,
  isOwner,
  togglePublishStatus
);

export default router;
