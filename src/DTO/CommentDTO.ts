import { inject, injectable } from "inversify";
import { CommentDBType } from "../cloud_DB";
import { CommentQueryRepository } from "../query_repositories";
import { CommentViewModel } from "../type-models";
import { LikeStatus } from "../types/LikesStatus";

@injectable()
class CommentDTO {
  constructor(
    @inject(CommentQueryRepository)
    protected commentQueryRepository: CommentQueryRepository
  ) {}

  async transform(
    comment: CommentDBType,
    userId?: string
  ): Promise<CommentViewModel> {
    let userStatus: LikeStatus = LikeStatus.None;

    if (userId) {
      const status = (await this.commentQueryRepository.getReactionStatus(
        userId,
        comment._id.toString()
      )) as any;
      userStatus = status ? status.myStatus : LikeStatus.None;
    }

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: userStatus,
      },
      createdAt: comment.createdAt,
    };
  }
}

export { CommentDTO };
