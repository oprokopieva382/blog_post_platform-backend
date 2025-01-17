import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { formatResponse } from "../../utils/responseFormatter";
import { ParamType } from ".";
import { LikeInputModel, PostInputModel } from "../../type-models";
import { PostService } from "../../services";
import {
  CommentQueryRepository,
  PostQueryRepository,
} from "../../query_repositories";
import { commentsQueryFilter, queryFilter } from "../../utils/queryFilter";
import { CommentInputModel } from "../../type-models/CommentInputModel";
import { ApiError } from "../../helper/api-errors";
import { CommentDTO } from "../../DTO/CommentDTO";
import { PostDTO } from "../../DTO/PostDTO";


@injectable()
export class PostController {
  constructor(
    @inject(PostService) protected postService: PostService,
    @inject(PostQueryRepository)
    protected postQueryRepository: PostQueryRepository,
    @inject(CommentQueryRepository)
    protected commentQueryRepository: CommentQueryRepository,
    @inject(CommentDTO) protected commentDTO: CommentDTO,
    @inject(PostDTO) protected postDTO: PostDTO
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.postQueryRepository.getAllPosts(
        queryFilter(req.query)
      );

      if (!result) {
        throw ApiError.NotFoundError("Not found", ["No posts found"]);
      }

      const sortedPosts = await Promise.all(
        result.items.map((p) => this.postDTO.transform(p, req?.user?.id))
      );

      const response = {
        ...result,
        items: sortedPosts,
      };

      formatResponse(res, 200, response, "Posts retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.postQueryRepository.getByIdPost(req.params.id);
     
      if (!result) {
        throw ApiError.NotFoundError("Not found", ["No post found"]);
      }

      formatResponse(
        res,
        200,
        await this.postDTO.transform(result, req?.user?.id),
        "Post retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request<{}, {}, PostInputModel>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.postService.createPost(req.body);
      console.log(result)

      if (!result) {
        throw ApiError.NotFoundError(`Post can't be created`);
      }

      formatResponse(
        res,
        201,
        await this.postDTO.transform(result),
        "Post created successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.postService.removePost(req.params.id);

      if (!result) {
        throw ApiError.NotFoundError("Post to delete is not found", [
          `Post with id ${req.params.id} does not exist`,
        ]);
      }

      formatResponse(res, 204, {}, "Post deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<ParamType, {}, PostInputModel>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.postService.updatePost(req.body, req.params.id);

      if (!result) {
        throw ApiError.NotFoundError("Post to update is not found", [
          `Post with id ${req.params.id} does not exist`,
        ]);
      }

      formatResponse(res, 204, {}, "Post updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async getPostComments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.commentQueryRepository.getCommentsOfPost(
        req.params.postId,
        commentsQueryFilter(req.query)
      );

      if (result.items.length === 0 || !result) {
        throw ApiError.NotFoundError("Comments not found", [
          `No comments of postId ${req.params.postId}`,
        ]);
      }

      const transformedComments = await Promise.all(
        result.items.map((c) => this.commentDTO.transform(c, req?.user?.id))
      );

      const response = {
        ...result,
        items: transformedComments,
      };

      formatResponse(res, 200, response, "Comments found successfully");
    } catch (error) {
      next(error);
    }
  }

  async createPostComment(
    req: Request<{ postId: string }, {}, CommentInputModel>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.postService.createPostComment(
        req.params.postId,
        req.body,
        req.user!
      );

      if (!result) {
        throw ApiError.NotFoundError("Not found", [
          `Can't find post with id ${req.params.postId} to create comment`,
        ]);
      }

      formatResponse(
        res,
        201,
        await this.commentDTO.transform(result, req.user!.id),
        "Comment created successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async reactToPost(
    req: Request<{ postId: string }, {}, LikeInputModel>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.postService.reactToPost(
        req.body,
        req.params.postId,
        req.user!
      );

      if (!result) {
        throw ApiError.NotFoundError("Post to react is not found", [
          `Post with id ${req.params.postId} does not exist in Controller`,
        ]);
      }

      formatResponse(res, 204, {}, "React to post successfully");
    } catch (error) {
      next(error);
    }
  }
}
