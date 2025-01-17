import { Router } from "express";
import {
  isAdminMiddleware,
  isAuthorizedMiddleware,
  softAccessMiddleware,
  validateComment,
  validatePost,
  validateReaction,
} from "../../middlewares";
import { container } from "../../composition-root";
import { PostController } from "./PostController";

const postController = container.resolve(PostController);
export const postRouter = Router();

postRouter.get(
  "/",
  softAccessMiddleware,
  postController.getAll.bind(postController)
);
postRouter.get(
  "/:id",
  softAccessMiddleware,
  postController.getById.bind(postController)
);
postRouter.post(
  "/",
  isAdminMiddleware,
  validatePost,
  postController.create.bind(postController)
);
postRouter.delete(
  "/:id",
  isAdminMiddleware,
  postController.deleteById.bind(postController)
);
postRouter.put(
  "/:id",
  isAdminMiddleware,
  validatePost,
  postController.update.bind(postController)
);
postRouter.get(
  "/:postId/comments",
  softAccessMiddleware,
  postController.getPostComments.bind(postController)
);
postRouter.post(
  "/:postId/comments",
  isAuthorizedMiddleware,
  validateComment,
  postController.createPostComment.bind(postController)
);
postRouter.put(
  "/:postId/like-status",
  isAuthorizedMiddleware,
  validateReaction,
  postController.reactToPost.bind(postController)
);
