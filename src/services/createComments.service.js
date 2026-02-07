import { Comment } from "../models/comments.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";

export const createCommentService = async (payload) => {
  const { content, owner, commentableId, commentableType, parentComment } =
    payload;

  const isReply = Boolean(parentComment);

  // 1. Check target exists
  // 2. If reply, check parent comment exists

  let target;

  if (commentableType === "Tweet") {
    target = await Tweet.findById(commentableId).select("_id isPublished");
  } else if (commentableType === "Video") {
    target = await Video.findById(commentableId).select("_id isPublished");
  }

  if (!target || !target.isPublished) {
    throw new ApiError(404, " Target not found or unavailable");
  }

  let parentCommentDoc = null;

  if (isReply) {
    parentCommentDoc = await Comment.findById(parentComment).select(
      "_id isPublished commentableId commentableType"
    );

    if (!parentCommentDoc || !parentCommentDoc.isPublished)
      throw new ApiError(404, "Parent comment not found or unavailable ");

    if (
      parentCommentDoc.commentableId.toString() !== commentableId ||
      parentCommentDoc.commentableType.toString() !== commentableType
    ) {
      throw new ApiError(401, "Forbidden access");
    }
  }

  if (isReply) {
    await Comment.findByIdAndUpdate(parentComment, {
      $inc: {
        repliesCount: 1,
      },
    });
  } else {
    if (commentableType == "Tweet") {
      await Tweet.findByIdAndUpdate(commentableId, {
        $inc: {
          commentsCount: 1,
        },
      });
    }

    if (commentableType == "Video") {
      await Video.findByIdAndUpdate(commentableId, {
        $inc: {
          commentsCount: 1,
        },
      });
    }
  }

  const commentData = {
    content,
    owner,
    commentableId,
    commentableType,
    parentComment: isReply ? parentComment : null,
  };

  const newComment = await Comment.create(commentData);

  return newComment;

  // 3. Increment counters
  // 4. Save comment
  // 5. Return saved comment
};
