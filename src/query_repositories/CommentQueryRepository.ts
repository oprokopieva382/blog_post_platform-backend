import { ObjectId } from "mongodb";
import { CommentViewModel, Paginator } from "../type-models";
import { CommentDBType } from "../cloud_DB/mongo_db_types";
import { QueryCommentsType } from "../types/query-type";
import { CommentDTO } from "../DTO";
import { CommentModel, ReactionModel } from "../models";

export class CommentQueryRepository {
  async getCommentsOfPost(
    postId: string,
    query: QueryCommentsType
  ): Promise<Paginator<CommentViewModel>> {
    const totalCommentsCount = await CommentModel.countDocuments({
      postId: postId.toString(),
    });

    const comments: CommentDBType[] = await CommentModel.find({
      postId: postId.toString(),
    })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .sort({ [query.sortBy]: query.sortDirection })
      .lean();

    const commentsToView = {
      pagesCount: Math.ceil(totalCommentsCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCommentsCount,
      items: comments.map((c) => CommentDTO.transform(c)),
    };

    return commentsToView;
  }

  async getByIdComment(id: string, userId: string ): Promise<CommentDBType | null> {
    // const result = await CommentModel.findOne({
    //   _id: new ObjectId(id),
    // })
    //   .populate({
    //     path: "myStatus",
    //     options: {
    //       // strictPopulate: false,
    //     },
    //   })
    //   .exec();
 const comment = await CommentModel.findOne({
      _id: new ObjectId(id),
    })
    const likesForComment = await ReactionModel
    .findOne({commentId: comment._id, userId})
    
    
    console.log("getByIdComment in CommentQueryRepository", result);
    return result;
  }

  async getUserReactionStatus(userId: string, commentId: string) {
    return ReactionModel.findOne({ userId, commentId }).lean();
  }
}
