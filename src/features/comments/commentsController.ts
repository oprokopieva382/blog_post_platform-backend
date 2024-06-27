import { NextFunction, Request, Response } from "express";
import { formatResponse } from "../../utils/responseFormatter";
import { CommentInputModel } from "../../type-models";
import { commentsQueryRepository } from "../../query_repositories";
import { commentsService } from "../../services";
import { CommentParamType } from ".";
import { ApiError } from "../../helper/api-errors";
import { commentDTO } from "../../DTO";

class CommentsController {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await commentsQueryRepository.getByIdComment(
        req.params.id
      );

      if (!result) {
        throw ApiError.NotFoundError("Not found", ["No comment found"]);
      }

      formatResponse(
        res,
        200,
        commentDTO(result),
        "Comment retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await commentsService.removeComment(
        req.params.commentId,
        req.user
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
      const result = await commentsService.updateComment(
        req.body,
        req.params.commentId,
        req.user
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
}
export const commentsController = new CommentsController()
