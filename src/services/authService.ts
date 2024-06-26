import { randomUUID } from "crypto";
import { Request } from "express";
import { add } from "date-fns/add";
import { fromUnixTime } from "date-fns/fromUnixTime";
import { ObjectId } from "mongodb";
import { bcryptService, emailService } from ".";
import {
  LoginInputModel,
  NewPasswordRecoveryInputModel,
  RegistrationConfirmationCodeModel,
  UserInputModel,
} from "../type-models";
import { authRepository, usersRepository } from "../repositories";
import { RegistrationEmailResending } from "../types/RegistrationEmailResending";
import { ApiError } from "../helper/api-errors";
import { SessionData } from "../types/SessionData";
import { jwtService } from "../features/application";
import { userDTO } from "../DTO";

export const authService = {
  async loginUser(data: LoginInputModel, req: Request) {
    const userData = await authRepository.getByLoginOrEmail(data.loginOrEmail);

    if (!userData) {
      throw ApiError.UnauthorizedError("Not authorized", [
        "Login failed. No user found.",
      ]);
    }

    const isPasswordCorrect = await bcryptService.testPassword(
      data.password,
      userData.password
    );

    if (!isPasswordCorrect) {
      throw ApiError.UnauthorizedError("Not authorized", [
        "Login failed. Password is incorrect.",
      ]);
    }

    const deviceId = randomUUID();
    const IP = req.ip;
    const deviceName = req.headers["user-agent"] || "Unknown Device";
    const user = userDTO(userData);

    const accessToken = await jwtService.createAccessToken(user.id);
    const refreshToken = await jwtService.createRefreshToken(user.id, deviceId);

    const { iat, exp } = await jwtService.validateRefreshToken(refreshToken);

    await this.createSession({
      userId: user.id,
      deviceId,
      iat: iat!,
      deviceName,
      ip: IP!,
      exp: exp!,
    });

    return { accessToken, refreshToken };
  },

  async registerUser(data: UserInputModel) {
    const { login, password, email } = data;
    const findUser = await authRepository.getByLoginOrEmail(login);

    if (findUser) {
      throw ApiError.BadRequestError("Bad Request", [
        "Registration failed. User already exists.",
      ]);
    }

    const passwordHash = await bcryptService.createHash(password);

    const newUser = {
      _id: new ObjectId(),
      login,
      email,
      password: passwordHash,
      createdAt: new Date().toISOString(),
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date().toISOString(), {
          hours: 1,
        }),
        isConfirmed: false,
      },
    };

    await usersRepository.createUser(newUser);

    await emailService.sendEmail(
      newUser.email,
      newUser.emailConfirmation.confirmationCode
    );

    return newUser;
  },

  async confirmUser(data: RegistrationConfirmationCodeModel) {
    const findUser = await authRepository.getByConfirmationCode(data.code);

    if (!findUser) {
      throw ApiError.BadRequestError("Bad Request", [
        "Can't find user by confirmation code",
      ]);
    }
    return await authRepository.updateConfirmation(findUser._id);
  },

  async confirmResentUser(data: RegistrationEmailResending) {
    const findUser = await authRepository.getByLoginOrEmail(data.email);

    if (!findUser) {
      throw ApiError.BadRequestError("Bad Request", [
        "Request failed. Can't find user with such email.",
      ]);
    }

    const newCode = randomUUID();
    await authRepository.updateCode(findUser._id, newCode);

    emailService.sendEmail(data.email, newCode);

    return findUser;
  },

  async logoutUser(deviceId: string) {
    await authRepository.removeSession(deviceId);
  },

  async refreshToken(deviceId: string, userId: string) {
    const newAccessToken = await jwtService.createAccessToken(userId);
    const newRefreshToken = await jwtService.createRefreshToken(
      userId,
      deviceId
    );

    await this.updateSession(newRefreshToken);
    return { newAccessToken, newRefreshToken };
  },

  async createSession(sessionData: SessionData) {
    const newSession = {
      _id: new ObjectId(),
      userId: sessionData.userId,
      deviceId: sessionData.deviceId,
      iat: fromUnixTime(sessionData.iat!).toISOString(),
      deviceName: sessionData.deviceName,
      ip: sessionData.ip,
      exp: fromUnixTime(sessionData.exp!).toISOString(),
    };
    await authRepository.createSession(newSession);
  },

  async updateSession(newRefreshToken: string) {
    const { iat, exp, deviceId } = await jwtService.validateRefreshToken(
      newRefreshToken
    );

    const tokenIat = fromUnixTime(+iat!);
    const dbIat = new Date(iat!);

    if (tokenIat > dbIat) {
      await authRepository.updateSession({
        iat: tokenIat.toISOString(),
        exp: fromUnixTime(+exp!).toISOString(),
        deviceId: deviceId,
      });
    }
  },

  async passwordRecovery(email: string) {
    const passwordRecovery = {
      _id: new ObjectId(),
      recoveryCode: randomUUID(),
      email,
      expirationDate: add(new Date(Date.now()).toISOString(), {
        hours: 1,
      }),
      createdAt: new Date().toISOString(),
    };

    const { recoveryCode } = await authRepository.savePasswordRecoveryInfo(
      passwordRecovery
    );

    await emailService.passwordRecovery(email, recoveryCode);
  },

  async setNewPassword(data: NewPasswordRecoveryInputModel) {
    const { newPassword, recoveryCode } = data;
    const result = await authRepository.getByRecoveryCode(recoveryCode);

    if (!result || new Date(result.expirationDate) < new Date()) {
      throw ApiError.BadRequestError("Bad Request", [
        "RecoveryCode is incorrect or expired",
      ]);
    }
    const passwordHash = await bcryptService.createHash(newPassword);

    await authRepository.setNewPassword(result.email, passwordHash);
  },
};
