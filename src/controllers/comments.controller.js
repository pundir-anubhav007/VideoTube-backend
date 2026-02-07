import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { createCommentService } from "../services/createComments.service.js";
import {getCommentService} from "../services/getComments.service.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const createComment = asyncHandler(async (req, res) => {
  const { content, commentableId, commentableType, parentCommentId } = req.body;

  const owner = req.user?._id;

  if (!owner) throw new ApiError(401, "Unauthorized Access");

  if (!content?.trim()) throw new ApiError(400, "Comment can't be empty");

  if (!mongoose.Types.isValidObjectId(commentableId))
    throw new ApiError(400, "Invalid commentable Id");

  const allowedTypes = ["Tweet", "Video"];
  if (!allowedTypes.includes(commentableType))
    throw new ApiError(400, "Invalid commentable Type");

  if (parentCommentId && !mongoose.Types.isValidObjectId(parentCommentId))
    throw new ApiError(400, "Invalid parentComment ID");

  const isReply = Boolean(parentCommentId);

  const commentPayload = {
    content: content?.trim(),
    owner,
    commentableId,
    commentableType,
    parentComment: isReply ? parentCommentId : null,
  };

  const newComment = await createCommentService(commentPayload);

  if (!newComment) throw new ApiError(500, "Comment creation failed ");

  return res.status(201).json({
    success: true,
    message: "Comment created successfully",
    data: newComment,
  });
});

const getComments = asyncHandler(async (req, res) => {

  const {page = 1, limit = 10, sortBy = "newest", commentableType} = req.query
  const {commentableId,parentCommentId} = req.params

  if(!mongoose.Types.isValidObjectId(commentableId)) throw new ApiError(400,
    "Invalid commentable ID"
  )

   if (parentCommentId && !mongoose.Types.isValidObjectId(parentCommentId))
     throw new ApiError(400, "Invalid parent comment ID");

  const mode = parentCommentId ? "reply" : "top"

  const parsedPage = parseInt(page,10)
  let parsedLimit = parseInt(limit) || 10

  if(parsedLimit > 50) parsedLimit = 50;


if(isNaN(parsedPage) || parsedPage < 1) throw new ApiError(400,
  "Invalid page number"
)

if (isNaN(parsedLimit) || parsedLimit < 1)
  throw new ApiError(400, "Invalid Limit");

const allowedTypes = ["Tweet", "Video"]
if(!allowedTypes.includes(commentableType)) throw new ApiError(400,
  "Invalid commentable Type"
)

const allowedSort = ["newest", "oldest", "top"];
const normalizedSort = allowedSort.includes(sortBy) ? sortBy : "newest";

const options = {
  commentableId,
  commentableType,
  parentCommentId,
  page: parsedPage,
  limit: parsedLimit,
  normalizedSort,
  mode,
};

const result = await getCommentService(options)

if(!result) throw new ApiError(404,
  "Failed to fetch comments"
)

return res.status(200)
.json( new ApiResponse(200,
  result,
  "Comments fetched successfully"
))


}
)
export { createComment, getComments };
