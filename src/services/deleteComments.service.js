import { Comment } from "../models/comments.model";
import { ApiError } from "../utils/ApiError";
import { Video } from "../models/video.model";
import { Tweet } from "../models/tweet.model";

export const deleteCommentService = async (payload) => {
  const { commentId, owner: user_Id } = payload;

  const comment = await Comment.findById(commentId).select(
    "owner parentComment isPublished isDeleted"
  );

  if (!comment) throw new ApiError(404, "Comment not found");

  if (comment.owner.toString() !== user_Id.toString())
    throw new ApiError(403, "Forbidden");

  // if (!comment.isPublished) throw new ApiError(403, "Forbidden");

  if (comment.isDeleted)
    return {
      message: "Comment already deleted",
      commentId,
    };

  const deletedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      isDeleted: true,
      deletedAt: new Date(),
      isPublished: false,
      content: "Comment Deleted",
    },

    {
      new: true,
    }
  ).select("_id isDeleted deletedAt parentComment commentableId commentableType");

  if (!deletedComment) {
    throw new ApiError(500, "Failed to delete comment");
  }


  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(deletedComment.parentComment, {
      $inc: {
        repliesCount: -1,
      },
    });
  } else {
    const Model = deletedComment.commentableType === "Tweet" ? Tweet : Video;
    await Model.findByIdAndUpdate(deletedComment.commentableId, {
      $inc: {
        repliesCount: -1,
      },
    });
  }


  return {
    commentId: deletedComment._id,
    isDeleted: deletedComment.isDeleted,
    deletedAt: deletedComment.deletedAt
  }
};
