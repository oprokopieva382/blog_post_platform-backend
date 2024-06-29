import { NextFunction, Response, Request } from "express";
import { ApiError } from "../../helper/api-errors";
import { formatResponse } from "../../utils/responseFormatter";
import { DeviceService } from "../../services";
import { DeviceQueryRepository } from "../../query_repositories";

export class DeviceController {
  private deviceQueryRepository: DeviceQueryRepository;
  constructor(protected deviceService: DeviceService) {
    this.deviceQueryRepository = new DeviceQueryRepository();
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.deviceQueryRepository.getAllDevices(req.userId);

      if (result.length === 0) {
        throw ApiError.NotFoundError("Not found", ["No devices found"]);
      }

      formatResponse(res, 200, result, "Devices retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.deviceService.delete(
        req.params.deviceId,
        req.userId
      );

      if (!result) {
        throw ApiError.NotFoundError("Not found", ["No devices found"]);
      }

      formatResponse(res, 204, result, "Device removed successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.deviceService.deleteRest(
        req.deviceId,
        req.userId
      );

      if (!result) {
        throw ApiError.NotFoundError("Not found", ["No devices found"]);
      }

      formatResponse(res, 204, result, "Devices removed successfully");
    } catch (error) {
      next(error);
    }
  }
}
