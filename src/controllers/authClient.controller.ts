import { Request, Response, NextFunction } from "express";
import authClientService from "../services/authClient.service";
import { SignInRequestDTO, SignUpRequestDTO } from "../dtos/auth.dto";
import { NotFoundError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";

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
async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;

    if (!user) throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);

    res.status(200).json({ message: "구글 로그인 성공", data: user });
  } catch (error) {
    next(error);
  }
}

const authClientController = { signUp, login, googleLogin };

export default authClientController;
