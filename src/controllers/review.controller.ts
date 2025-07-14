import { NextFunction, Request, Response } from "express";
import reviewService from "../services/review.service";
import { CreateReviewDto, ReviewIdParamsDto, UpdateReviewDto } from "../dtos/review.dto";

// 내가 작성한 리뷰 목록
async function getMyReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.pageSize) || 6;

    const result = await reviewService.getMyReviews(clientId, page, limit);
    res.status(200).json({ message: "리뷰 목록 조회 성공", data: result });
  } catch (error) {
    next(error);
  }
}

// 리뷰 작성
async function createReview(
  req: Request<{}, {}, CreateReviewDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const clientId = req.auth!.userId;
    const { estimateId, rating, content } = req.body;
    const review = await reviewService.createReview({ estimateId, rating, content }, clientId);

    res.status(201).json({ message: "리뷰 작성 성공", data: review });
  } catch (error) {
    next(error);
  }
}

// 리뷰 수정
async function updateReview(
  req: Request<ReviewIdParamsDto, {}, UpdateReviewDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const clientId = req.auth!.userId;
    const { reviewId } = req.params;
    const { rating, content } = req.body;
    const updated = await reviewService.updateReview(reviewId, clientId, {
      rating,
      content,
    });

    res.status(200).json({ message: "리뷰 수정 성공", data: updated });
  } catch (error) {
    next(error);
  }
}

// 리뷰 삭제
async function deleteReview(req: Request<ReviewIdParamsDto>, res: Response, next: NextFunction) {
  try {
    const clientId = req.auth!.userId;
    const { reviewId } = req.params;
    await reviewService.deleteReview(reviewId, clientId);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export default {
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
};
