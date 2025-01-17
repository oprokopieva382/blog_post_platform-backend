import "reflect-metadata";
import { Response, Request, NextFunction } from "express";
import { ApiError } from "../helper/api-errors";
import { AuthRepository } from "../repositories";
import { container } from "../composition-root";

const authRepository = container.get<AuthRepository>(AuthRepository);

export const validateEmailConfirmation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authRepository.getByConfirmationCode(req.body.code);

    if (!result) {
      throw ApiError.BadRequestError("Bad Request", [
        {
          message: "Code is incorrect",
          field: "code",
        },
      ]);
    }

    if (result.emailConfirmation.isConfirmed === true) {
      throw ApiError.BadRequestError("Bad Request", [
        {
          message: "Code is already confirmed",
          field: "code",
        },
      ]);
    }

    if (result.emailConfirmation.expirationDate < new Date()) {
      throw ApiError.BadRequestError("Bad Request", [
        {
          message: "Code is already expired",
          field: "code",
        },
      ]);
    }

    next();
  } catch (error) {
    next(error);
  }
};
