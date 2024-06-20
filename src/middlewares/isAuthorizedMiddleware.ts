import { NextFunction, Request, Response } from "express";
import { usersQueryRepository } from "../query_repositories";
import { ApiError } from "../helper/api-errors";
import { jwtService } from "../features/application";
import redisClient from "../redisClient";

export const isAuthorizedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization) {
      throw ApiError.UnauthorizedError("Not authorized", [
        "Authorization failed. Access token is incorrect or expired",
      ]);
    }

    const token = req.headers.authorization.split(" ")[1];

    const userId = await jwtService.getUserIdByAccessToken(token);

    if (!userId) {
      throw ApiError.UnauthorizedError("Not authorized", [
        "Authorization failed. Access token is incorrect or expired",
      ]);
    }

    let authorizedUser;
    const cashedUser = await redisClient.get(`user:${userId}`);

    if (!cashedUser) {
      authorizedUser = await usersQueryRepository.getByIdUser(userId);
      if (!authorizedUser) {
        throw ApiError.UnauthorizedError("Not authorized", [
          "Authorization failed. Can't find user with such id",
        ]);
      }

      await redisClient.set(`user:${userId}`, JSON.stringify(authorizedUser), {
        EX: 3600, // Cache for 1 hour
      });
    } else {
      authorizedUser = JSON.parse(cashedUser);
    }

    req.user = authorizedUser;
    next();
  } catch (error) {
    next(error);
  }
};
