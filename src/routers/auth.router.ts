import authController from "../controllers/auth.controller";
import authClientController from "../controllers/authClient.controller";
import { moverSignin, moverSignup, moverWithdraw } from "../controllers/authMover.controller";
import { deleteUserSchema, signInSchema, signUpSchema } from "../dtos/auth.dto";
import {
  checkClientSignUpInfo,
  checkMoverSignInInfo,
  checkMoverSignUpInfo,
  checkMoverWithdrawInfo,
  validateReq,
  verifyAccessToken,
} from "../middlewares/auth.middleware";
import express from "express";
import passport from "passport";

const authRouter = express.Router();

// 토큰 재생성
authRouter.post("/refresh-token", authController.setRefreshToken);

// 사용자 불러오기
authRouter.get("/", verifyAccessToken, authController.getMe);

// 기사님 회원가입 - Local
authRouter.post("/signup/mover", validateReq(signUpSchema), checkMoverSignUpInfo, moverSignup);

// 기사님 로그인 - Local
authRouter.post("/signin/mover", validateReq(signInSchema), checkMoverSignInInfo, moverSignin);

// 기사님 회원탈퇴 - Local
authRouter.delete(
  "/delete/mover",
  verifyAccessToken,
  validateReq(deleteUserSchema),
  checkMoverWithdrawInfo,
  moverWithdraw,
);

// Client 회원가입 - Local
authRouter.post(
  "/signup/client",
  validateReq(signUpSchema),
  checkClientSignUpInfo,
  authClientController.signUp,
);

// Client 로그인 - Local
authRouter.post("/signin/client", validateReq(signInSchema), authClientController.login);

// Client 회원탈퇴 - Local // TODO: 작성 예정
// authRouter.delete(
//   "/delete/client",
//   verifyAccessToken,
//   validateReq(deleteUserSchema),
//   checkMoverWithdrawInfo,
// );

// 구글 로그인
authRouter.get("/google", (req, res, next) => {
  const userType = (req.query.userType as string) || "client";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: userType,
  })(req, res, next);
});

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.signInEasily,
);

// 카카오 로그인
authRouter.get("/kakao", (req, res, next) => {
  const userType = (req.query.userType as string) || "client";
  passport.authenticate("kakao", {
    scope: ["account_email"],
    state: userType,
  })(req, res, next);
});

authRouter.get(
  "/kakao/callback",
  passport.authenticate("kakao", { session: false }),
  authController.signInEasily,
);

// 네이버 로그인
authRouter.get("/naver", (req, res, next) => {
  const userType = (req.query.userType as string) || "client";
  passport.authenticate("naver", {
    scope: ["name", "email", "mobile"],
    state: userType,
  })(req, res, next);
});

authRouter.get(
  "/naver/callback",
  passport.authenticate("naver", { session: false }),
  authController.signInEasily,
);

export default authRouter;
