import { ErrorMessage } from "../constants/ErrorMessage";
import authClientRepository from "../repositories/authClient.repository";
import { LoginDataLocal, SignUpDataLocal, SignUpDataSocial } from "../types";
import { BadRequestError, NotFoundError } from "../types/errors";
import { filterSensitiveUserData, hashPassword, verifyPassword } from "../utils/auth.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";

// ✅ 회원가입 - Local
async function create(client: SignUpDataLocal) {
  // 비밀번호 해시
  const hashedPassword = await hashPassword(client.password);

  const newClient = await authClientRepository.create({
    ...client,
    password: hashedPassword,
  });

  // 토큰 넣음
  const accessToken = generateAccessToken({
    userId: newClient.id,
    email: newClient.email,
    name: newClient.name!,
    userType: newClient.userType,
  });
  const refreshToken = generateRefreshToken({
    userId: newClient.id,
    email: newClient.email,
    name: newClient.name!,
    userType: newClient.userType,
  });

  // 비밀번호와 전화번호 빼고 반환
  const user = filterSensitiveUserData(newClient);
  return { accessToken, refreshToken, user };
}

// ✅ 로그인 - Local
async function loginWithLocal({ email, hashedPassword }: LoginDataLocal) {
  const client = await authClientRepository.findByEmail(email);

  if (!client) {
    throw new NotFoundError(ErrorMessage.USER_NOT_FOUND);
  }

  // 비밀번호 확인 유효성 검사
  await verifyPassword(hashedPassword, client.hashedPassword as string);

  // 토큰 넣음
  const accessToken = generateAccessToken({
    userId: client.id,
    email: client.email,
    name: client.name!,
    userType: client.userType,
  });

  const refreshToken = generateRefreshToken({
    userId: client.id,
    email: client.email,
    name: client.name!,
    userType: client.userType,
  });

  // 비밀번호와 전화번호 빼고 반환
  const user = filterSensitiveUserData(client);
  return { accessToken, refreshToken, user };
}

// ✅ 소셜 로그인
async function oAuthCreateOrUpdate(data: SignUpDataSocial) {
  // 1. 이메일로 사용자가 있는지 찾음
  const { email, ...rest } = data;
  const existingUser = await authClientRepository.findByEmailRaw(email);

  // 2. 이미 존재하는 사용자면 없는 정보 추가: email 넘기는지 여부 확인 필요
  let user;
  if (existingUser) {
    if (existingUser.provider !== data.provider)
      throw new BadRequestError(`이미 ${existingUser.provider}로 가입된 이메일입니다.`);
    user = await authClientRepository.update(existingUser.id, rest);
  } else {
    // 3. 없으면 자료 자체를 새로 생성
    user = await authClientRepository.save(data);
  }

  // 토큰 넣음: userType에서 오류 내서 hard coding함
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    name: user.name!,
    userType: "client",
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    name: user.name!,
    userType: "client",
  });

  user = filterSensitiveUserData(user);
  console.log(user);
  return { accessToken, refreshToken, user };
}

const authClientService = { create, loginWithLocal, oAuthCreateOrUpdate };

export default authClientService;
