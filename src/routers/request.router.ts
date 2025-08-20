import requestController from "../controllers/request.controller";
import { Router } from "express";

const requestRouter = Router();

// 견적 요청 중간 상태 조회
requestRouter.get("/draft", requestController.getDraft);

// 견적 요청 중간 상태 저장/업데이트
requestRouter.patch("/draft", requestController.saveDraft);

// 활성 견적 요청 조회 (일반 유저)
requestRouter.get("/client/active", requestController.getClientActiveRequest);

// 보낸 견적 요청 목록 조회 (일반 유저)
requestRouter.get("/client", requestController.getRequests);

// 받은 요청 상세 조회(기사님)
requestRouter.get("/detail/:id", requestController.getReceivedRequestDetail);

// 기사님 지정 요청 (일반 > 기사)
requestRouter.patch("/movers/:moverId", requestController.designateMover);

// 받은 요청 목록 조회 (기사님)
requestRouter.get("/", requestController.getReceivedRequests);

// 견적 요청 (일반 유저)
requestRouter.post("/", requestController.createRequest);

// 견적 요청 상세 조회
requestRouter.get("/:id", requestController.getRequest);

// 견적 요청 취소 (일반 유저)
requestRouter.delete("/:id", requestController.cancelRequest);

export default requestRouter;
