import reviewController from "../controllers/review.controller";
import { CreateReviewSchema, UpdateReviewschema } from "../dtos/review.dto";
import { validateReq, verifyAccessToken } from "../middlewares/auth.middleware";
import { Router } from "express";

const reviewRouter = Router();

// 내가 작성한 리뷰 목록
reviewRouter.get("/me", verifyAccessToken, reviewController.getReviews);

// 기사님 본인 리뷰 목록
reviewRouter.get("/mover", verifyAccessToken, reviewController.getMoverOwnReviews);

// 특정 기사님에게 달린 리뷰 목록 (공개용)
reviewRouter.get("/mover/:moverId", reviewController.getReviews);

// 리뷰 작성
reviewRouter.post(
  "/",
  verifyAccessToken,
  validateReq(CreateReviewSchema),
  reviewController.createReview,
);

// 리뷰 수정
reviewRouter.patch(
  "/:reviewId",
  verifyAccessToken,
  validateReq(UpdateReviewschema),
  reviewController.updateReview,
);

// 리뷰 삭제
reviewRouter.delete("/:reviewId", verifyAccessToken, reviewController.deleteReview);

// 작성 가능한 리뷰 목록
reviewRouter.get("/writable", verifyAccessToken, reviewController.getWritableReviews);

export default reviewRouter;
