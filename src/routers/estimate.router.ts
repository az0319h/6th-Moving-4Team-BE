import estimateController from "../controllers/estimate.controller";
import { Router } from "express";

const estimateRouter = Router();

// 대기 중인 견적 조회
estimateRouter.get("/pending", estimateController.getPendingEstimates);

// 견적 요청
estimateRouter.post("/create", estimateController.sendEstimateToRequest);

// 보낸 견적 요청 상세
estimateRouter.get("/sented/:id", estimateController.getSentEstimateDetail);

// 견적 거절
estimateRouter.post("/reject", estimateController.rejectEstimate);

// 보낸 견적 조회
estimateRouter.get("/sent", estimateController.getSentEstimates);

// 반려한 견적 조회
estimateRouter.get("/rejected", estimateController.getRejectedEstimates);

// 받은 견적 조회
estimateRouter.get("/received", estimateController.getReceivedEstimates);

// 견적 확정
estimateRouter.post("/confirmed", estimateController.confirmEstimate);

// 견적 상세 조회
estimateRouter.get("/client/:estimateId", estimateController.getEstimateDetail);

// 견적 상세 조회 (알림용)
estimateRouter.get("/:estimateId", estimateController.getEstimateById);

// 견적 거절 및 요청 취소
estimateRouter.delete("/:id", estimateController.deleteEstimate);

export default estimateRouter;
