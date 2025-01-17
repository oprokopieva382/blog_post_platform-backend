import "reflect-metadata";
import { Response, Request, NextFunction } from "express";
import { ApiError } from "../helper/api-errors";
import { AuthRepository } from "../repositories";
import { container } from "../composition-root";

const authRepository = container.get<AuthRepository>(AuthRepository);

export const validateEmailResending = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authRepository.getByLoginOrEmail(req.body.email);

    if (!result) {
      throw ApiError.BadRequestError("Bad Request", [
        {
          message: "Email is not found",
          field: "email",
        },
      ]);
    }

    if (result.emailConfirmation.isConfirmed === true) {
      throw ApiError.BadRequestError("Bad Request", [
        {
          message: "Email is already confirmed",
          field: "email",
        },
      ]);
    }

    next();
  } catch (error) {
    next(error);
  }
};
