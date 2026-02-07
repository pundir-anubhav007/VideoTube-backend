import mongoose from "mongoose";
import { Comment } from "../models/comments.model";

export const getCommentService = async (options) => {
  const {
    commentableId,
    commentableType,
    parentCommentId,
    page,
    limit,
    normalizedSort,
    mode,
  } = options;

  const matchStage = {
    commentableId: mongoose.Types.ObjectId(commentableId),
    commentableType,
    isPublished: true,
  };

  if (mode === "top") {
    matchStage.parentComment = null;
  } else {
    matchStage.parentComment = mongoose.Types.ObjectId(parentCommentId);
  }

  const sortStageLogic = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    // This top comments logic will change the structure of the aggregation pipelines
    // I will study this later
    // top: {likesCount: -1}
  };

  const sortStage = sortStageLogic[normalizedSort] || sortStageLogic.newest;

  const skip = (page - 1) * limit;

  const pipeline = [
    {
      $match: matchStage,
    },
    {
      $sort: sortStage,
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];

  const lookupLogic = [
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $arrayElemAt: ["$owner", 0],
        },
      },
    },
    {
      $project: {
        isDeleted: 0,
        __v: 0,
      },
    },
  ];

  pipeline.push(...lookupLogic);

  const comments = await Comment.aggregate(pipeline);

  const totalDocs = await Comment.countDocuments(matchStage)

  if (skip >= totalDocs) return empty;

  const hasNextPage = skip + comments.length < totalDocs

 return {
   comments,
   page,
   limit,
   totalDocs,
   hasNextPage,
 };
};
