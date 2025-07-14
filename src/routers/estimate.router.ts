import { Router, RequestHandler } from "express";
import estimateController from "../controllers/estimate.controller";
import { verifyAccessToken } from "../middlewares/auth.middleware";

const estimateRouter = Router();

// 작성 가능한 리뷰 목록
estimateRouter.get("/writable/me", estimateController.getWritableEstimates);

// 대기 중인 견적 조회
estimateRouter.get(
  "/estimates/pending",
  verifyAccessToken,
  estimateController.getPendingEstimates as RequestHandler,
);

export default estimateRouter;
