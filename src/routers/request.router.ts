import { Router } from "express";
import requestController from "../controllers/request.controller";
import { verifyAccessToken } from "../middlewares/auth.middleware";

const requestRouter = Router();

// 견적 요청 (일반 유저)
requestRouter.post("/", verifyAccessToken, requestController.createRequest);

// 받은 요청 조회 (기사님)
requestRouter.get("/", verifyAccessToken, requestController.getReceivedRequests);

export default requestRouter;
