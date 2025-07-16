/**
 * @file auth.service.ts
 * @description
 * - 인증 로직을 처리하는 서비스 계층 모듈
 * - repository에서 데이터를 조회하고, 암호화/토큰 관련 유틸 함수 사용
 *
 */

import authRepository from "../repositories/authMover.repository";
import { ConflictError, NotFoundError, UnauthorizedError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import { createMoverInput, getMoverInput } from "../types/mover/auth/authMover.type";
import { hashPassword } from "../utils/auth.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import bcrypt from "bcrypt";

//기사님 생성
async function createMover(user: createMoverInput) {
  const existedEmail = await authRepository.findMoverByEmail(user.email);
  const existedPhone = await authRepository.findMoverByPhone(user.phone);

  const fieldErrors: Record<string, string> = {};

  if (existedEmail) {
    fieldErrors.email = ErrorMessage.ALREADY_EXIST_EMAIL;
  }
  if (existedPhone) {
    fieldErrors.phone = ErrorMessage.ALREADY_EXIST_PHONE;
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new ConflictError("중복 정보로 인한 회원가입 실패: ", fieldErrors);
  }
  const hashedPassword = await hashPassword(user.password);
  const createdMover = await authRepository.saveMover({
    ...user,
    hashedPassword,
  });

  const accessToken = generateAccessToken({
    userId: createdMover.id,
    email: createdMover.email,
    name: createdMover.name,
    userType: createdMover.userType,
  });
  const refreshToken = generateRefreshToken({
    userId: createdMover.id,
    email: createdMover.email,
    name: createdMover.name,
    userType: createdMover.userType,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      userId: createdMover.id,
      email: createdMover.email,
      name: createdMover.name,
      userType: createdMover.userType,
    },
  };
}

//기사님 조회(로그인)
async function getMoverByEmail(user: getMoverInput) {
  //사용자 조회
  const mover = await authRepository.findMoverByEmail(user.email);
  if (!mover) {
    throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
  }

  //비밀번호 대조
  const isPasswordValid = await bcrypt.compare(user.password, mover.hashedPassword!);
  if (!isPasswordValid) {
    throw new UnauthorizedError(ErrorMessage.PASSWORD_NOT_MATCH);
  }

  //토큰 생성
  const accessToken = generateAccessToken({
    userId: mover.id,
    email: mover.email,
    name: mover.name,
    userType: mover.userType,
  });
  const refreshToken = generateRefreshToken({
    userId: mover.id,
    email: mover.email,
    name: mover.name,
    userType: mover.userType,
  });

  return {
    user: {
      userId: mover.id,
      email: mover.email,
      name: mover.name,
      userType: mover.userType,
    },
    accessToken,
    refreshToken,
  };
}

export default {
  createMover,
  getMoverByEmail,
};
