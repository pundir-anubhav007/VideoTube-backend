import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";

export const isOwner = asyncHandler(async (req,_, next) => {
    const {videoId} = req.params

    const reqOwner = req.user?._id

    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400,
            "Invalid Video ID"
        )
    }

    // const resourceFound = await Video.findOne({_id: videoId})
    // i did this gpt told me findbyID

    const resourceFound = await Video.findById(videoId);

    if(!resourceFound) throw new ApiError(404,
        "Searched resource not found!"
    )
    if(!resourceFound.owner) {
        throw new ApiError(500,
            "Owner field missing in resource"
        )
    }


    // if (resourceFound?.owner == null || resourceFound?.owner == undefined) {
    //   throw new ApiError(500, "Internal Server Error ");
    // }

    // this became redundant because of the above code which naturally checks for null and undefined


    if (!reqOwner || resourceFound.owner.toString() !== reqOwner.toString()) {
      throw new ApiError(403, "Trying to access unauthorized resource");
    }

    // if (!(resourceFound?.owner == reqOwner)) {
    //     throw new ApiError(403, "Trying to access unauthorized resource");
    // }

    // This is wrong because owner and reqOwner are objects and this comparision will not be reliable

    // ***************** Resource Attach ********************

        req.resource = resourceFound


    // ******************************************************


    next();
})


