import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim() || !description?.trim())
    throw new ApiError(400, "Playlist name and description is required");

  const userId = req.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized access");
  const existingPlaylist = await Playlist.findOne({
    name: name.trim(),
    owner: userId,
  });

  if (existingPlaylist)
    throw new ApiError(400, "Playlist with this name already exists");

  const newPlaylist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: userId,
  });

  // if this operation silently fails then no need of handling or throwing an error because the create() only returns success or failure
  return res
    .status(201)
    .json(new ApiResponse(201, newPlaylist, "Playlist created Successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const currentUserId = req.user?._id;

  if (!currentUserId) {
    throw new ApiError(401, "Unauthorized Access");
  }

  if (!mongoose.Types.isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID");

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: currentUserId,
  }).lean(); // this .lean() will convert mongoose document into plain js object

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist found Successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.isValidObjectId(userId))
    throw new ApiError(400, "Invalid USER ID");

  const playlists = await Playlist.find({ owner: userId });

  if (playlists.length === 0) throw new ApiError(404, "No Playlist Found");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        playlists: playlists,
      },
      "Playlist fetched Successfully"
    )
  );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!mongoose.Types.isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid PlaylistId");

  if (!mongoose.Types.isValidObjectId(videoId))
    throw new ApiError(400, "Invalid Video ID");

  const owner = req.user?._id;

   if (!owner) throw new ApiError(400, "Unauthorized Access");

  const playlistExists = await Playlist.findOne({ _id: playlistId, owner });

  if (!playlistExists) throw new ApiError(404, "Playlist not Found !");

  const videoExists = await Video.findById(videoId);

  if (!videoExists) throw new ApiError(404, "Video not found");

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!updatePlaylist) throw new ApiError(500, "Failed to update video");

  return res
    .status(200)
    .json(new ApiResponse(200, updatePlaylist, "Video updated Successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!mongoose.Types.isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid Playlist ID");

  if (!mongoose.Types.isValidObjectId(videoId))
    throw new ApiError(400, "Invalid Video ID");

  const owner = req.user?._id;

  if(!owner) throw new ApiError(400,
    "Unauthorized Access"
  )

  const playlist = await Playlist.findOne({_id: playlistId, owner})

  if(!playlist) throw new ApiError(404,
    "No playlist Found"
  )


  const videoExists = await Video.findById(videoId);

  if (!videoExists) throw new ApiError(404, "Video not found");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );


if (!updatedPlaylist) throw new ApiError(500, "Failed to remove video");

return res
  .status(200)
  .json(new ApiResponse(200, updatedPlaylist, "Video removal Successfull"));
});


const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if(!mongoose.Types.isValidObjectId(playlistId)) throw new ApiError(400,
    "Invalid Playlist ID"
  )

  const owner = req.user?._id
  if(!owner) throw new ApiError(401,
    "Unauthorized Access"
  )

  // This thing is not required as one atomic operation can solve this

  // const playlistExists = await Playlist.findOne({ _id: playlistId, owner})

  // if(!playlistExists) throw new ApiError(404,
  //   "Playlist not Found"
  // )

  // const playlistToDelete = await Playlist.findByIdAndDelete(playlistId)

  const playlistToDelete = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner,
  });


  if(!playlistToDelete) throw new ApiError(404,
    "Failed to delete Playlist"
  )

  return res.status(200)
  .json( new ApiResponse(
    200,
    playlistToDelete,
    "Playlist deleted Successfully"
  ))

});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if(!mongoose.Types.isValidObjectId(playlistId)) throw new ApiError(400,
    "Invalid playlist ID"
  )

  if(!name?.trim() || !description?.trim()) throw new ApiError(400,
    "Playlist name and description are required"
  )

  const owner = req.user?._id

  if(!owner) throw new ApiError(401,
    "Unauthorized Access"
  )

  const playlistToUpdate = await Playlist.findOneAndUpdate({_id: playlistId, owner},
    {
    $set: {
      name: name?.trim(),
      description: description?.trim()
    }
  },
{
  new: true
})

if (!playlistToUpdate) throw new ApiError(404, "Playlist not found or unauthorized"
);

return res.status(200)
.json( new ApiResponse(200,
  playlistToUpdate,
  "Playlist updated Successfully"
))

});





export {
  createPlaylist,
  getPlaylistById,
  getUserPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
