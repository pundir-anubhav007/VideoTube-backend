// import mongoose, {Schema} from 'mongoose'
// import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

// const commentSchema = new Schema(
//   {
//     content: {
//       type: String,
//       required: true,
//     },
//     video: {
//       type: Schema.Types.ObjectId,
//       ref: "Video",
//     },
//     owner: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// commentSchema.plugin(mongooseAggregatePaginate);
// export const Comment = mongoose.model("Comment",commentSchema)


import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Polymorphic association
    commentableId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    commentableType: {
      type: String,
      enum: ["Tweet", "Video"],
      required: true,
    },

    // Reply system
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },

    repliesCount: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);




