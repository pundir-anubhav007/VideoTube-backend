import mongoose, { Schema } from "mongoose";

const likesSchema = new Schema(
  {
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      default: null,
    },

    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// Comment Like Uniqueness
likesSchema.index(
  { likedBy: 1, comment: 1 },
  {
    unique: true,
    partialFilterExpression: { comment: { $type: "objectId" } },
  }
);

// Video Like Uniqueness
likesSchema.index(
  { likedBy: 1, video: 1 },
  {
    unique: true,
    partialFilterExpression: { video: { $type: "objectId" } },
  }
);

// Tweet Like Uniqueness
likesSchema.index(
  { likedBy: 1, tweet: 1 },
  {
    unique: true,
    partialFilterExpression: { tweet: { $type: "objectId" } },
  }
);


export const Likes = mongoose.model("Likes",likesSchema)