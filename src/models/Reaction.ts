import { Schema, model } from "mongoose";
import { ReactionDBType } from "../cloud_DB/mongo_db_types";
import { LikeStatus } from "../types/LikesStatus";

const ReactionSchema = new Schema<ReactionDBType>({
  _id: { type: Schema.Types.ObjectId, required: true },
  commentId: { type: String, required: true },
  userId: { type: String, required: true },
  myStatus: { type: String, enum: Object.values(LikeStatus), required: true },
  createdAt: { type: String, required: true },
});

export const ReactionModel = model("comment-reactions", ReactionSchema);
