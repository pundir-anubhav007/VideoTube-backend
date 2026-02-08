import { Comment } from "../models/comments.model";
import { Tweet } from "../models/tweet.model";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/ApiError";

export const updateCommentService = async (payload) => {
  const { commentId, content, owner: userId } = payload;

  const comment = await Comment.findById(commentId).select(
    "owner commentableId commentableType content isPublished"
  );

  if (!comment) throw new ApiError(404, "Comment not found");

  if (comment.owner?.toString() !== userId.toString())
    throw new ApiError(403, "Forbidden");

  if (!comment.isPublished) throw new ApiError(403, "Forbidden");

  if (comment.content === content.trim()) return comment;

  let target;
  if (comment.commentableType === "Tweet") {
    target = await Tweet.findById(comment.commentableId).select(
      "_id isPublished"
    );
  } else if (comment.commentableType === "Video") {
    target = await Video.findById(comment.commentableId).select(
      "_id isPublished"
    );
  }

  if (!target || !target.isPublished)
    throw new ApiError(404, "Parent resource unavailable");

  comment.content = content.trim();
  await comment.save();

  await comment.populate( "owner", "username avatar"

  );

  return comment;
};
