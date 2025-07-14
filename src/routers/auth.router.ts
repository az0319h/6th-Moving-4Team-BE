import express from "express";
import { moverSignin, moverSingup } from "../controllers/authMover.controller";
// import authMiddleware from "../middlewares/passport/jwtStrategy";
import authController from "../controllers/auth.controller";
import authClientController from "../controllers/authClient.controller";

const authRouter = express.Router();

// 토큰 재생성
authRouter.post("/refresh-token", authController.setRefreshToken);

// 사용자 불러오기
// authRouter.get("/", authMiddleware, authController.getMe);

//기사님 회원가입
authRouter.post("/signup/mover", moverSingup);

//기사님 로그인
authRouter.post("/signin/mover", moverSignin);

// 일반 회원가입 - Local
authRouter.post("/signup/client", authClientController.signUp);

// 일반 로그인 - Local
authRouter.post("/signin/client", authClientController.login);

export default authRouter;
