import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { formatResponse } from "../../utils/responseFormatter";
import { CommentInputModel, LikeInputModel } from "../../type-models";
import { CommentService } from "../../services";
import { CommentParamType } from ".";
import { ApiError } from "../../helper/api-errors";
import { CommentQueryRepository } from "../../query_repositories";
import { CommentDTO } from "../../DTO";

@injectable()
export class CommentController {
  constructor(
    @inject(CommentService) protected commentService: CommentService,
    @inject(CommentQueryRepository)
    protected commentQueryRepository: CommentQueryRepository,
    @inject(CommentDTO) protected commentDTO: CommentDTO
  ) {}

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.commentQueryRepository.getByIdComment(
        req.params.id
      );

      if (!result) {
        throw ApiError.NotFoundError("Not found", ["No comment found"]);
      }

      formatResponse(
        res,
        200,
        await this.commentDTO.transform(result, req?.user?.id),
        "Comment retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.commentService.removeComment(
        req.params.commentId,
        req.user!
      );

      if (!result) {
        throw ApiError.NotFoundError("Comment to delete is not found", [
          `Comment with id ${req.params.commentId} does not exist`,
        ]);
      }

      formatResponse(res, 204, {}, "Comment deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<CommentParamType, {}, CommentInputModel>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.commentService.updateComment(
        req.body,
        req.params.commentId,
        req.user!
      );

      if (!result) {
        throw ApiError.NotFoundError("Comment to update is not found", [
          `Comment with id ${req.params.commentId} does not exist`,
        ]);
      }

      formatResponse(res, 204, {}, "Comment updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async reactToComment(
    req: Request<CommentParamType, {}, LikeInputModel>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.commentService.reactToComment(
        req.body,
        req.params.commentId,
        req.user!
      );

      if (!result) {
        throw ApiError.NotFoundError("Comment to react is not found", [
          `Comment with id ${req.params.commentId} does not exist`,
        ]);
      }

      formatResponse(res, 204, {}, "React to comment successfully");
    } catch (error) {
      next(error);
    }
  }
}
