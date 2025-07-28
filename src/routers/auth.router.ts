import express from "express";
import { moverSignin, moverSingup } from "../controllers/authMover.controller";
import authController from "../controllers/auth.controller";
import authClientController from "../controllers/authClient.controller";
import {
  checkClientSignUpInfo,
  checkMoverSignInInfo,
  checkMoverSignUpInfo,
  validateReq,
  verifyAccessToken,
} from "../middlewares/auth.middleware";
import { signInSchema, signUpSchema } from "../dtos/auth.dto";
import passport from "passport";

const authRouter = express.Router();

// 토큰 재생성
authRouter.post("/refresh-token", authController.setRefreshToken);

// 사용자 불러오기
authRouter.get("/", verifyAccessToken, authController.getMe);

//기사님 회원가입 - Local
authRouter.post("/signup/mover", validateReq(signUpSchema), checkMoverSignUpInfo, moverSingup); // <- 수경 님 여기 Singup / Signup 오타 발견했어요.

//기사님 로그인 - Local
authRouter.post("/signin/mover", validateReq(signInSchema), checkMoverSignInInfo, moverSignin);

// Client 회원가입 - Local
authRouter.post(
  "/signup/client",
  validateReq(signUpSchema),
  checkClientSignUpInfo,
  authClientController.signUp,
);

// Client 로그인 - Local
authRouter.post("/signin/client", validateReq(signInSchema), authClientController.login);

// Client 구글 로그인
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] })); // 구글창 이동
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authClientController.loginByGoogle,
); // 진짜 구글 로그인

export default authRouter;
