import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ConflictError, UnauthorizedError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import { generateAccessToken } from "../utils/token.util";

// ✅ refreshToken Api
async function setRefreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. 쿠키에서 refreshToken 가져옴
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedError(ErrorMessage.REFRESHTOKEN_NOT_FOUND);

    // 2. refreshToken 검증
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new ConflictError(ErrorMessage.JWT_SECRET_NOT_FOUND);

    const payload = jwt.verify(refreshToken, secret) as jwt.JwtPayload;

    // 3. 새로운 토큰 설정
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      userType: payload.userType,
    });

    // 4. 반환
    res.status(200).json({ message: "AccessToken 갱신 성공", accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
}

// ✅ 토큰으로 사용자 불러오기
async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.auth;

    if (!user) {
      res.status(401).json({ message: "사용자 인증 정보가 없습니다." });
    }

    res.status(200).json({ message: "사용자 데이터 반환 성공", user });
  } catch (error) {
    next(error);
  }
}

const authController = {
  setRefreshToken,
  getMe,
};

export default authController;
