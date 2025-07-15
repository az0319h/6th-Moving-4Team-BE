import { MoveType } from "@prisma/client";

// 일반 회원가입 자료 구조 : DB에 저장
export interface SignUpDataLocal {
  email: string;
  name: string;
  phone: string;
  hashedPassword: string;
}

// 일반 로그인 자료 구조 : DB
export interface LoginDataLocal {
  email: string;
  hashedPassword: string;
}

//
export interface SignUpFormSocial {
  email: string;
  name: string;
  phone: string;
  provider: "KAKAO" | "GOOGLE";
  providerId: string;
}

export type ISignUpForm = SignUpDataLocal | SignUpFormSocial;

// 프로필 등록
export interface ClientProfileRegister {
  profileImage?: string;
  serviceType?: MoveType[];
  livingArea?: string[];
}
