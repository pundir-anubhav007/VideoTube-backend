import { Comment } from "../models/comments.model";
import { Likes } from "../models/likes.model";
import { ApiError } from "../utils/ApiError";

export const likeCommentService = async (payload) => {
  const { commentId, likedBy } = payload;

  const comment = await Comment.findById(commentId).select(
    "isDeleted likesCount"
  );

  if (!comment) throw new ApiError(404, "Comment not found");

  if (comment.isDeleted) throw new ApiError(400, "Comment deleted");

  const likesDoc = await Likes.findOne({
    likedBy,
    comment: commentId,
  });

  let liked;
  let updatedComment;

  if (likesDoc) {
    await Likes.deleteOne({ _id: likesDoc._id });

    updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $inc: { likesCount: -1 },
      },
      {
        new: true,
      }
    ).select("likesCount");

    liked = false;
  } else {
    await Likes.create({
      likedBy: likedBy,
      comment: commentId,
    });

    updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $inc: {
          likesCount: 1,
        },
      },
      {
        new: true,
      }
    ).select("likesCount");

    liked = true;
  }

  return {
    liked,
    likesCount: updatedComment.likesCount,
  };
};
