import { Client, Provider } from "@prisma/client";

// 일반 회원가입 자료 구조 : DB에 저장
export interface SignUpDataLocal {
  email: string;
  name: string;
  phone: string;
  password: string;
}

// 일반 로그인 자료 구조 : DB
export interface LoginDataLocal {
  email: string;
  hashedPassword: string;
}

// 소셜 로그인
export interface SignUpDataSocial {
  provider: Provider;
  providerId: string;
  email: string;
  name?: string;
  phone?: string;
}

export interface SignInDataSocial {
  accessToken: string;
  refreshToken: string;
  user: SignUpDataSocial & { userType: string };
}

//기사님 회원가입할 때 필요한 값 (컨트롤러, 서비스 단)
export type CreateMoverInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

//기사님 회원가입할 때 필요한 값 (레포지토리 단)
export type CreateMoverInputwithHash = {
  name: string;
  email: string;
  phone: string;
  password: string;
  hashedPassword: string;
};

//기사님 로그인할 때 필요한 값 (컨트롤러, 서비스 단)
export type GetMoverInput = {
  email: string;
  password: string;
};
