import { inject, injectable } from "inversify";
import { PostDBType } from "../cloud_DB";
import { PostQueryRepository } from "../query_repositories";
import { LikeDetailsViewModel, PostViewModel } from "../type-models";
import { LikeStatus } from "../types/LikesStatus";
import { sortLikes } from "../utils/sortLikes";

@injectable()
class PostDTO {
  constructor(
    @inject(PostQueryRepository)
    protected postQueryRepository: PostQueryRepository
  ) {}

  async transform(post: PostDBType, userId?: string): Promise<PostViewModel> {
    let userStatus: LikeStatus = LikeStatus.None;
    let newestLikes: LikeDetailsViewModel[] = [];

    if (userId) {
      const reactionInfo = (await this.postQueryRepository.getReactionStatus(
        userId,
        post._id.toString()
      )) as any;
      userStatus = reactionInfo ? reactionInfo.myStatus : LikeStatus.None;
    }

    const postReactionsInfo = await this.postQueryRepository.getPostReactionsInfo(
      post._id.toString()
    );
   
    const sortedLikes = sortLikes(postReactionsInfo);

    sortedLikes.map((like: any) => {
      newestLikes.push({
        userId: like.user._id.toString(),
        login: like.user.login,
        description: like.description,
        addedAt: like.addedAt,
      });
    });

    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blog._id.toString(),
      blogName: post.blog.name,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: userStatus,
        newestLikes: newestLikes,
      },
    };
  }
}

export { PostDTO };
