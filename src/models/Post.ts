import { Schema, model } from "mongoose";
import { PostDBType } from "../cloud_DB";

const postSchema = new Schema<PostDBType>({
  _id: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blog: { type: Schema.Types.ObjectId, ref: "blogs", required: true },
  likesCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  dislikesCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  reactionInfo: [
    {
      type: Schema.Types.ObjectId,
      ref: "PostReaction",
    },
  ],
  createdAt: { type: String },
});

export const PostModel = model("posts", postSchema);
