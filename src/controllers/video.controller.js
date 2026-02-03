// Controllers modify krne hai middleware k hissab se jo owner check krta hai

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { isOwner } from "../middlewares/owner.middleware.js";



// ****************** Algorithm – Get All Videos ******************

// Receive request with query parameters (page, limit, query, sortBy, sortType, userId).
// Assign default values to page, limit, sortBy, and sortType if not provided.
// Convert page and limit from string to number.
// Validate that userId exists; if not, return an error response.
// Create a filter object with owner = userId.
// If search query exists, add $or condition to filter for title or description using regex.
// Determine sorting order (asc → 1, desc → -1).
// Create a sorting object using sortBy field and sort order.
// Calculate skip value using formula: (page − 1) × limit.
// Fetch videos from database using filter, sorting, skip, and limit.
// Count total number of videos matching the filter.
// Calculate total pages using totalVideos / limit.
// Send success response with videos data and pagination details.
// End.

// const getAllVideo = asyncHandler(async (req,res) => {
//     const {page = 1 , limit = 10, query, sortBy, sortType, userId} = req.query
//  //   todo: get all videos based on query sort pagination

//  page = parseInt(page)
//  limit = parseInt(limit)

//  if(!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//     throw new ApiError(400,"Invalid userId")
//  }

//  const filter = {
//    owner: "userId",
//  };

//  if(query && query.trim()) {
//     filter.$or = [
//         {title: {$regex: query, $options: "i"}},
//         {description: {$regex: query, $options: "i"}}
//     ]
//  }

//  const sortOrder = sortType === "asc" ? 1 : -1;

//  const sortObject = {
//     [sortBy]: sortOrder
//  }

//  const skip = (page - 1) * limit;

//  const videos = await Video.find(filter)
//  .sort(sortObject)
//  .skip(skip)
//  .limit(limit)
//  .populate("owner","username avatar");


//  const totalVideos = await Video.countDocuments(filter);

//  return res.status(200)
//  .json(new ApiResponse(200, videos,
// {
//       total: totalVideos,
//       page,
//       limit,
//       totalPages: Math.ceil(totalVideos / limit)
//     }) );
// })


const getAllVideo = asyncHandler(async(req,res) => {
    let { page = 1, limit = 10, sortType = "desc", query, sortBy = "createdAt", userId} = req.query

    page = parseInt(page)
    limit = parseInt(limit)

    if(!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID")
    }


    // we need to change the filter to make it dynamic based on query presence
    const filter = {
      owner: userId,
    };

    if(query) {
        filter.$or = [
            {title: {$regex:query, $options: "i"}},
            {description:{$regex:query, $options: "i"}}
        ]
    }

    const sortOrder = sortType === "asc" ? 1 : -1

    const sortObject = {
        [sortBy]: sortOrder
    }

    const skip = (page - 1) * limit

    const videos = await Video.find(filter)
    .sort(sortObject)
    .skip(skip)
    .limit(limit)


    const totalVideos = await Video.countDocuments(filter)

    return res.status(200)
    .json( new ApiResponse (
        200,
        {
            videos,
            pagination: {
                total: totalVideos,
                page,
                limit,
                totalPages: Math.ceil(totalVideos/limit)
            }
        },
        "Videos fetched Successfully"
    ))

})

const publishAvideo = asyncHandler(async (req,res) => {
//     Auth Check
// → Validate Inputs
// → Check File Presence
// → Upload to Cloudinary
// → Prepare Metadata
// → Create DB Document
// → Handle Rollback if Failure
// → Send Clean Response

const { title, description } = req.body

if(!title?.trim() || !description?.trim()) {
    throw new ApiError(400,
        "Title and Description is required"
    )
}

const VideoLocalPath = req.files?.videoFile?.[0]?.path
const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

if(!VideoLocalPath) {
    throw new ApiError(400, "VideoFile is required")
}
if(!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required")
}

// const uploadedVideo = await uploadOnCloudinary(VideoLocalPath,"Videos")

// const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath,"Thumbnails")

// Nice learining by GPT
const [uploadedVideo, uploadedThumbnail] = await Promise.all([
  uploadOnCloudinary(VideoLocalPath, "Videos"),
  uploadOnCloudinary(thumbnailLocalPath, "Thumbnails"),
]);


if(!uploadedVideo || !uploadedThumbnail) {
    return res.status(500)
    .json( new ApiError(500,
        "Failed to Upload Files"
    ))
}

let videoDoc;

try {

     videoDoc = await Video.create({
      videoFile: {
        url: uploadedVideo.secure_url,
        public_id: uploadedVideo.public_id,
      },
      thumbnail: {
        url: uploadedThumbnail.secure_url,
        public_id: uploadedThumbnail.public_id,
      },
      title: title,
      description: description,
      duration: uploadedVideo.duration || 0,
      isPublished: true,
      owner: req.user?._id

    });

    return res.status(201)
    .json( new ApiResponse(201,
        videoDoc,
        "Video Published Successfully"
    ))


} catch (error) {

    if(uploadedVideo?.public_id) {
        await cloudinary.uploader.destroy(uploadedVideo.public_id, {
        resource_type: "video"
    })
    }
    if(uploadedThumbnail?.public_id) {
        await cloudinary.uploader.destroy(uploadedThumbnail.public_id, {
          resource_type: "image",
        });
    }

  throw new ApiError(500, "Failed to create video document");


}

})

const getVideoById = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    if(!mongoose.Types.isValidObjectId(videoId)) {
        throw new ApiError(400,
            "Invalid VideoId"
        )
    }
    const result = await Video.findOne({_id:videoId, isPublished:true})
    if(!result) {
        throw new ApiError(404,
            `Video with VideoID ${videoId} does not exist`
        )
    }

    // await Video.findByIdAndUpdate(videoId, {
    //   $inc: { views: 1 },
    // });


    return res.status(200)
    .json( new ApiResponse(
        200,
        result,
        "Video fetched Successfully"
    ))


})

const updateVideo = asyncHandler(async (req,res) => {
    const owner = req.user?._id;
    const { videoId } = req.params;

    const newVideoUploadpath = req.file?.path
    if(!newVideoUploadpath) throw new ApiError(
        400,
        "New Video File is required"
    )

    if(!mongoose.Types.isValidObjectId(videoId))
        throw new ApiError(
    400,
    "Invalid VideoID")

    const video = await Video.findOne({owner, _id: videoId })

    if(!video) {
        throw new ApiError(404, "Searched Video not Found");
    }

    const oldVideoPublicId = video.videoFile.public_id;

    let newVideo;
    let dbUpdated = false;

    try {

        newVideo = await uploadOnCloudinary(newVideoUploadpath, "Videos");

        // This also becomes redundant because we are now doing set and not save

        // if ( newVideo?.secure_url && newVideo?.public_id ) {
        //     video.videoFile = {
        //         url: newVideo.secure_url,
        //         public_id: newVideo.public_id
        //     }
        // }

       //  await video.save()
       // Here we did that because we are updating only videoFile field and by doing this we are optimising the db operation

       if(!newVideo?.secure_url || !newVideo?.public_id) throw new ApiError(
        500,
        "Cloudinary upload failed"
       )


    const updatedVideoFileField = await Video.findByIdAndUpdate(
         videoId,
         {
           $set: {
             videoFile: {
               url: newVideo?.secure_url,
               public_id: newVideo?.public_id,
             },
           },
         },
         { new: true }
       );

       dbUpdated = true;


        await cloudinary.uploader.destroy(oldVideoPublicId,{
            resource_type: "video"
        })

        return res.status(
          200).json(
            new ApiResponse(
            200,
            updatedVideoFileField,
            "Video Updated Successfully"
          )
          );

    } catch (error) {

        if(newVideo?.public_id && !dbUpdated) {
           await cloudinary.uploader.destroy(newVideo.public_id,
            {
                resource_type: "video"
            }
           )
        }

        throw new ApiError(500,
            "Failed to update Video"
        )

    }
})

const deleteVideo = asyncHandler(async (req, res) => {
  const videoId = req.resource?._id
  if(!videoId) throw new ApiError(404,
    "VideoId not found"
  )
  const videoPublicId = req.resource?.videoFile?.public_id

  if(!videoPublicId) throw new ApiError(404,
    "Can't find public Id of the target video"
  )

  try {
    const deletedVideo = await cloudinary.uploader.destroy(videoPublicId, {
      resource_type: "video",
    });

    if(deletedVideo.result !== "ok") throw new ApiError(500,
      "Failed to delete video from cloudinary"
    )

    const videoToDelete = await Video.findByIdAndDelete(videoId);

    if(!videoToDelete) {
      throw new ApiError(500,
          "Failed to delete Video from DB"
      )
    }

    return res.status(200).json(
        new ApiResponse(200,
           " Video deleted Successfully"
        )
    )
  } catch (error) {

   throw new ApiError(500,
    "Failed to delete video"
   )


  }


});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const video = req.resource;

  if (!video) {
    throw new ApiError(404, "Video not found");
  }


  const statusFlip = await Video.findByIdAndUpdate(
    video._id,
    { $set: { isPublished: !video.isPublished } },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        statusFlip,
        `Video is now ${statusFlip.isPublished ? "Published" : "Unpublished"}`
      )
    );
});


export { getAllVideo, publishAvideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };