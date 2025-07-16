/**
 * @file auth.controller.ts
 * @description
 * - 인증 관련 HTTP 요청을 처리하는 컨트롤러
 * - named export 사용
 *
 */

import { NextFunction, Request, Response } from "express";
import authService from "../services/authMover.service";
import { MoverSigninDto, MoverSignupDto, signUpMoverSchema } from "../dtos/auth/authMover.dto";
import { loginClientSchema } from "../dtos/authClient.dto";

//기사님 회원가입
async function moverSingup(
  req: Request<{}, {}, MoverSignupDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    //req.body 유효성 검사
    const parsedData = signUpMoverSchema.parse(req.body);

    const signUpData = {
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone,
      password: parsedData.password,
    };

    const mover = await authService.createMover(signUpData);

    res.status(201).json({ message: "Mover 일반 회원가입 성공", data: mover });
  } catch (error) {
    next(error);
  }
}

//기사님 로그인
async function moverSignin(
  req: Request<{}, {}, MoverSigninDto>,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsedData = loginClientSchema.parse(req.body);

    const loginData = {
      email: parsedData.email,
      password: parsedData.password,
    };

    const mover = await authService.getMoverByEmail(loginData);
    res.status(200).json({ message: "Mover 일반 로그인 성공", data: mover });
  } catch (error) {
    next(error);
  }
}

export { moverSingup, moverSignin };
