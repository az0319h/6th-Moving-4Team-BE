import { Request, Response, NextFunction } from "express";
import authClientService from "../services/authClient.service";
import { SignInRequestDTO, SignUpRequestDTO } from "../dtos/auth.dto";
import { NotFoundError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import { SignInDataSocial } from "../types";

// ✅ 일반 회원가입
async function signUp(req: Request<{}, {}, SignUpRequestDTO>, res: Response, next: NextFunction) {
  try {
    const client = await authClientService.create(req.body);

    res.status(201).json({ message: "Client 일반 회원가입 성공", data: client });
  } catch (error) {
    next(error);
  }
}

// ✅ 일반 로그인
async function login(req: Request<{}, {}, SignInRequestDTO>, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const loginData = {
      email,
      hashedPassword: password,
    };

    const client = await authClientService.loginWithLocal(loginData);
    res.status(200).json({ message: "Client 일반 로그인 성공", data: client });
  } catch (error) {
    next(error);
  }
}

// ✅ 구글 로그인
async function loginByGoogle(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken, user } = req.user as unknown as SignInDataSocial;

    if (!user) throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
    console.log("!!!", user);

    res.cookie("accessToken", accessToken, {
      httpOnly: false, // 프론트에서 읽을 거면 false
      secure: false, // 개발 중일 땐 false, 배포는 true
      sameSite: "lax",
      maxAge: 1000 * 60 * 60, // 1시간
      path: "/",
    });

    // 데이터 받자마자 프론트로 넘김
    const redirectUrl = new URL("http://localhost:3000/mover-search");

    redirectUrl.searchParams.set("accessToken", accessToken);
    redirectUrl.searchParams.set("refreshToken", refreshToken);
    redirectUrl.searchParams.set("name", user.name || "");
    redirectUrl.searchParams.set("email", user.email || "");

    //기존 메인 창에 토큰 전달 후 창 닫기
    res.redirect(redirectUrl.toString());
  } catch (error) {
    next(error);
  }
}

const authClientController = { signUp, login, loginByGoogle };

export default authClientController;
