import express from "express";
import profileClientController from "../controllers/profileClient.controller";
import { verifyAccessToken } from "../middlewares/auth.middleware";

const profileRouter = express.Router();

/**
 * @file profile.router.ts
 * @description 프로필 관련 라우트 정의 모듈 (프로필 등록, 프로필 수정 등)
 */

// //기사님 프로필 등록과 수정
// profileRouter.patch("/mover", authMi, moverPatchProfile);

// 일반 유저 프로필 등록
profileRouter.patch("/clients", verifyAccessToken, profileClientController.post);

export default profileRouter;
