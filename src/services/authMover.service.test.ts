import { Mover, Provider } from "@prisma/client";
import { ErrorMessage } from "../constants/ErrorMessage";
import authMoverRepository from "../repositories/authMover.repository";
import { filterSensitiveUserData, hashPassword } from "../utils/auth.util";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import authMoverService from "./authMover.service";
import { BadRequestError, NotFoundError } from "../types";

type MoverWithUserType = Mover & { userType: "mover" | "client" };

// 공통 모킹 함수 및 변수
jest.mock("../repositories/authMover.repository");
jest.mock("../utils/token.util");
jest.mock("../utils/auth.util");

const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockSaveMover = authMoverRepository.saveMover as jest.MockedFunction<
  typeof authMoverRepository.saveMover
>;
const mockGenerateAccessToken = generateAccessToken as jest.MockedFunction<
  typeof generateAccessToken
>;
const mockGenerateRefreshToken = generateRefreshToken as jest.MockedFunction<
  typeof generateRefreshToken
>;
const mockGetMoverByEmail = authMoverRepository.getMoverByEmail as jest.MockedFunction<
  (email: string) => Promise<Partial<Mover> | null>
>;
const mockCreateOrUpdate = authMoverRepository.createOrUpdate as jest.MockedFunction<
  typeof authMoverRepository.createOrUpdate
>;
const mockFilterSensitiveUserData = filterSensitiveUserData as jest.Mock;

// createMover 함수
describe("createMover 정상 동작", () => {
  // 1단계 - 공통 setUp
  const mockUser = {
    id: "1",
    email: "test@test.com",
    name: "홍길동",
    phone: "01012345678",
    password: "password123",
  };

  const mockCreatedMover = {
    id: "mock-id-123",
    email: "test@example.com",
    name: "홍길동",
    phone: "01012345678",
    userType: "mover",
    isProfileCompleted: false,
  } as unknown as MoverWithUserType;

  //1단계(setUp)과 4단계(teardown) 공용
  beforeEach(() => {
    jest.clearAllMocks();

    mockSaveMover.mockResolvedValue(mockCreatedMover); // userType과 관련
    mockGenerateAccessToken.mockReturnValue("mockedAccessToken");
    mockGenerateRefreshToken.mockReturnValue("mockedRefreshToken");
  });

  test("비밀번호 해싱 함수가 호출된다", async () => {
    // 2단계 exercise - 테스트 실행
    await authMoverService.createMover(mockUser);

    //3단계 assertion - 결과 검증
    expect(mockHashPassword).toHaveBeenCalledWith(mockUser.password);
  });

  test("'Mover'유저가 생성된다", async () => {
    // 1단계 - setUp
    mockHashPassword.mockResolvedValue("hashed_pw");

    // 2단계 exercise - 테스트 실행
    await authMoverService.createMover(mockUser);

    // 3단계 assertion - 결과 검증
    expect(mockSaveMover).toHaveBeenCalledWith({
      hashedPassword: "hashed_pw",
      ...mockUser,
    });
  });

  test("accessToken 생성 함수가 호출된다", async () => {
    // 2단계 exercise - 테스트 실행
    await authMoverService.createMover(mockUser);

    //3단계 assertion - 결과 검증
    expect(mockGenerateAccessToken).toHaveBeenCalledWith({
      userId: mockCreatedMover.id,
      email: mockCreatedMover.email,
      name: mockCreatedMover.name,
      userType: mockCreatedMover.userType,
      isProfileCompleted: mockCreatedMover.isProfileCompleted,
    });
  });

  test("refreshToken 생성 함수가 호출된다", async () => {
    // 2단계 exercise - 테스트 실행
    await authMoverService.createMover(mockUser);

    //3단계 assertion - 결과 검증
    expect(mockGenerateRefreshToken).toHaveBeenCalledWith({
      userId: mockCreatedMover.id,
      email: mockCreatedMover.email,
      name: mockCreatedMover.name,
      userType: mockCreatedMover.userType,
      isProfileCompleted: mockCreatedMover.isProfileCompleted,
    });
  });

  test("Mover'유저를 생성하고 유저 정보를 반환한다", async () => {
    // 2단계 exercise - 테스트 실행
    const result = await authMoverService.createMover(mockUser);

    //3단계 assertion - 결과 검증
    expect(result).toEqual({
      accessToken: "mockedAccessToken",
      refreshToken: "mockedRefreshToken",
      user: {
        userId: mockCreatedMover.id,
        email: mockCreatedMover.email,
        name: mockCreatedMover.name,
        phone: mockCreatedMover.phone,
        userType: mockCreatedMover.userType,
        isProfileCompleted: mockCreatedMover.isProfileCompleted,
      },
    });
  });
});

// setMoverByEmail 함수
describe("setMoverByEmail 정상 동작", () => {
  // 1단계 - 공통 setUp
  const mockUser = {
    email: "test@test.com",
    password: "password123",
  };

  const mockExistedMover = {
    id: "1",
    email: "test@test.com",
    name: "홍길동",
    phone: "01012345678",
    userType: "mover",
    isProfileCompleted: false,
    nickName: "HKD",
  };

  const expectedTokenPayload = {
    userId: mockExistedMover.id,
    email: mockExistedMover.email,
    name: mockExistedMover.name,
    userType: mockExistedMover.userType,
    isProfileCompleted: mockExistedMover.isProfileCompleted,
  };

  const expectedUserResponse = {
    userId: mockExistedMover.id,
    email: mockExistedMover.email,
    name: mockExistedMover.name,
    nickName: mockExistedMover.nickName,
    userType: mockExistedMover.userType,
    phone: mockExistedMover.phone,
    isProfileCompleted: mockExistedMover.isProfileCompleted,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetMoverByEmail.mockResolvedValue(mockExistedMover);
  });

  test("'Mover'유저가 조회된다", async () => {
    // 2단계 exercise - 테스트 실행
    await authMoverService.setMoverByEmail(mockUser);

    //3단계 assertion - 결과 검증
    expect(mockGetMoverByEmail).toHaveBeenCalledWith(mockUser.email);
  });

  test("'Mover'유저가 없으면 에러를 띄운다", async () => {
    // 1단계 setUp - 테스트 준비
    mockGetMoverByEmail.mockResolvedValue(null);

    // 2단계(테스트 실행), 3단계 (결과 검증)
    await expect(authMoverService.setMoverByEmail(mockUser)).rejects.toMatchObject({
      message: ErrorMessage.USER_NOT_FOUND,
      name: "Not Found",
    });
  });

  test("accessToken 생성 함수가 호출된다", async () => {
    // 2단계 exercise - 테스트 실행
    await authMoverService.setMoverByEmail(mockUser);

    //3단계 assertion - 결과 검증
    expect(mockGenerateAccessToken).toHaveBeenCalledWith(expectedTokenPayload);
  });

  test("refreshToken 생성 함수가 호출된다", async () => {
    // 2단계 exercise - 테스트 실행
    await authMoverService.setMoverByEmail(mockUser);

    //3단계 assertion - 결과 검증
    expect(mockGenerateRefreshToken).toHaveBeenCalledWith(expectedTokenPayload);
  });

  test("'Mover'유저 정보를 조회하고 반환한다", async () => {
    //1단계 setUp
    mockGenerateAccessToken.mockReturnValue("mockAccessToken");
    mockGenerateRefreshToken.mockReturnValue("mockRefreshToken");

    // 2단계 exercise - 테스트 실행
    const result = await authMoverService.setMoverByEmail(mockUser);

    //3단계 assertion - 결과 검증
    expect(result).toEqual({
      accessToken: "mockAccessToken",
      refreshToken: "mockRefreshToken",
      user: expectedUserResponse,
    });
  });
});

// oAuthCreateOrUpdate 함수
describe("oAuthCreateOrUpdate 정상 동작", () => {
  // 1단계 - 공통 setUp
  const mockSocialUser = {
    id: "1",
    provider: Provider.GOOGLE,
    providerId: "A1B2C3D4E5",
    email: "test@test.com",
    name: "홍길동",
    phone: "01012345678",
  };

  // 유저정보 필터 후 결과 값 비교하기 때문에 미리 필터한 값을 변수로 지정해둠
  const mockFilteredUser = mockFilterSensitiveUserData(mockSocialUser);

  // 갱신되길 기대하는 값
  const expectedUpdatePayload = {
    id: mockSocialUser.id,
    provider: mockSocialUser.provider,
    providerId: mockSocialUser.providerId,
    name: mockSocialUser.name,
    email: mockSocialUser.email,
    phone: mockSocialUser.phone,
  };

  // 생성되길 기대하는 값
  const expectedCreatePayload = {
    provider: mockSocialUser.provider,
    providerId: mockSocialUser.providerId,
    name: mockSocialUser.name,
    email: mockSocialUser.email,
    phone: mockSocialUser.phone,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetMoverByEmail.mockResolvedValue(null);
  });

  test("'Mover'유저 조회 함수가 호출된다", async () => {
    // 2단계 exercise - 테스트 실행
    await authMoverService.oAuthCreateOrUpdate(mockSocialUser);

    //3단계 assertion - 결과 검증
    expect(mockGetMoverByEmail).toHaveBeenCalled();
  });

  test("기존 유저의 provider가 일치하지 않으면 에러를 던진다", async () => {
    // 1단계 - setUp
    mockGetMoverByEmail.mockResolvedValueOnce({
      ...mockSocialUser,
      provider: Provider.KAKAO, // 다른 provider
    });

    // 2단계(테스트 실행), 3단계 (결과 검증)
    await expect(authMoverService.oAuthCreateOrUpdate(mockSocialUser)).rejects.toThrow(
      BadRequestError,
    );
  });

  test("기존 유저면서 providerId가 일치하면 유저 정보를 업데이트한다 (provider, providerId, name, phone, email)", async () => {
    // 1단계 - setUp
    mockGetMoverByEmail.mockResolvedValue({
      id: mockSocialUser.id,
      provider: mockSocialUser.provider,
      providerId: mockSocialUser.providerId,
      email: mockSocialUser.email,
    });

    // 2단계 - 테스트 실행
    const result = await authMoverService.oAuthCreateOrUpdate(mockSocialUser);

    // 3단계 - 검증
    expect(mockCreateOrUpdate).toHaveBeenCalledWith(expectedUpdatePayload);
    expect(result).toEqual(mockFilteredUser);
  });

  test("존재하지 않는 유저라면 유저를 생성한다", async () => {
    // 2단계 - 테스트 실행
    const result = await authMoverService.oAuthCreateOrUpdate(mockSocialUser);

    // 3단계 - 검증
    expect(mockCreateOrUpdate).toHaveBeenCalledWith(expectedCreatePayload);
    expect(result).toEqual(mockFilteredUser);
  });
});
