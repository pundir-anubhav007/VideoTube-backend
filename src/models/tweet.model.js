import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },

    mediaUrls: [
      {
        type: String,
      },
    ],

    likesCount: {
      type: Number,
      default: 0,
    },

    repliesCount: {
      type: Number,
      default: 0,
    },

    retweetCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0
    },

    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    editedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
