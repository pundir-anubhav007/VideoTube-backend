import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if(!name?.trim() || !description?.trim()) throw new ApiError( 400 ,
    "Playlist name and description is required"
  )

  const userId = req.user?._id

  if(!userId) throw new ApiError(401,
    "Unauthorized access"
  )
  const  existingPlaylist = await Playlist.findOne({
    name: name.trim(),
    owner: userId
})

  if(existingPlaylist) throw new ApiError(400,
    "Playlist with this name already exists"
  )


    const newPlaylist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: userId
    })

// if this operation silently fails then no need of handling or throwing an error because the create() only returns success or failure
    return res.status(201)
    .json(
        new ApiResponse(201,
            newPlaylist,
            "Playlist created Successfully"
        )
    )

});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const currentUserId = req.user?._id

  if (!currentUserId) {
    throw new ApiError(401, "Unauthorized Access");
  }

  if (!mongoose.Types.isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist ID");

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: currentUserId,
  }).lean();   // this .lean() will convert mongoose document into plain js object

if (!playlist) {
  throw new ApiError(404, "Playlist not found");
}

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist found Successfully"));


});


const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if(!mongoose.Types.isValidObjectId(userId)) throw new ApiError(400,
    "Invalid USER ID"
  )

  const playlists = await Playlist.find({ owner: userId });

  if (playlists.length === 0) throw new ApiError(404, "No Playlist Found");

  return res.status(200)
  .json( new ApiResponse(200,
    {
        playlists: playlists
    },
    "Playlist fetched Successfully"
  ))


});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

export {
  createPlaylist,
  getPlaylistById,
  getUserPlaylists,
  addVideoToPlaylist,
};