/**
 * @file auth.repository.ts
 * @description
 * 인증 관련 유저 데이터를 다루는 repository 모듈
 *
 * service 파일에서 사용 시:
 * import authRepository from "../repositories/auth.repository";
 *
 * const user = await authRepository.findByEmail(email);
 *
 */

import { Mover } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { createMoverInputwithHash } from "../types/mover/auth/authMover.type";

//기사님 생성
async function saveMover(user: createMoverInputwithHash) {
  const createdMover = await prisma.mover.create({
    data: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      hashedPassword: user.hashedPassword,
    },
  });

  return { ...createdMover, userType: "mover", profileCompleted: false }; //userType은 FE의 header에서 필요
}

//이메일로 기사님 조회
async function findMoverByEmail(email: Mover["email"]) {
  const mover = await prisma.mover.findUnique({
    where: {
      email,
    },
  });

  if (!mover) return null;

  return { ...mover, userType: "mover" }; //userType은 FE의 header에서 필요
}

//전화번호로 기사님 조회
async function findMoverByPhone(phone: Mover["phone"]) {
  return await prisma.mover.findUnique({
    where: {
      phone,
    },
  });
}

export default {
  saveMover,
  findMoverByEmail,
  findMoverByPhone,
};
