import { NextFunction, Request, Response } from "express";
import { CreateRequestDto } from "../dtos/request.dto";
import requestService from "../services/request.service";

// 견적 요청 (일반 유저)
async function createRequest(
  req: Request<{}, {}, CreateRequestDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const request = await requestService.createRequest({
      request: req.body,
      clientId: req.auth!.userId,
    });
    res.status(201).json({ message: "견적 요청 성공", data: request });
  } catch (error) {
    next(error);
  }
}

// 받은 요청 조회 (기사님)
async function getReceivedRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const moverId = req.auth!.userId;
    const { result, nextCursor } = await requestService.getReceivedRequests({
      ...req.query,
      moverId,
    });
    res.json({
      message: "받은 요청 조회 성공",
      totalCount: result.length,
      nextCursor,
      requests: result,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  createRequest,
  getReceivedRequests,
};
