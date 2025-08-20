import profileClientController from "../controllers/client.controller";
import profileMoverController from "../controllers/profileMover.controller";
import { MoverProfileSchema } from "../dtos/mover.dto";
import { validateReq, verifyAccessToken } from "../middlewares/auth.middleware";
import { Router } from "express";
import { checkMoverProfileInfo } from "../middlewares/profile.middleware";
import { profileUpdateLimit } from "../middlewares/rateLimits.middleware";

const profileRouter = Router();

// 기사님 프로필 생성&수정
profileRouter.patch(
  "/mover",
  verifyAccessToken,
  validateReq(MoverProfileSchema),
  checkMoverProfileInfo,
  profileMoverController.moverPatchProfile,
);

// 일반 회원 프로필 등록 & 수정
profileRouter.patch(
  "/clients",
  verifyAccessToken,
  profileUpdateLimit,
  profileClientController.update,
);

export default profileRouter;
