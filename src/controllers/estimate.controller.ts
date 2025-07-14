import { NextFunction, Request, Response } from "express";
import estimateService from "../services/estimate.service";

// 작성 가능한 리뷰 목록
async function getWritableEstimates(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.pageSize) || 6;

    const result = await estimateService.getWritableEstimates(clientId, page, limit);
    res.status(200).json({
      message: "작성 가능한 리뷰 견적 목록 조회 성공",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// 대기 중인 견적 조회
async function getPendingEstimates(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;

    const data = await estimateService.getPendingEstimates(clientId);

    return res.status(200).json({
      message: "대기 중인 견적 조회 성공",
      data: data,
    });
  } catch (e) {
    next(e);
  }
}

export default {
  getWritableEstimates,
  getPendingEstimates,
};
