import { z } from "zod";
import { ConflictError } from "../types";
import {
  checkClientSignUpInfo,
  checkMoverSignInInfo,
  checkMoverSignUpInfo,
  optionalAuth,
  validateReq,
} from "./auth.middleware";
import { ErrorMessage } from "../constants/ErrorMessage";
import authMoverRepository from "../repositories/authMover.repository";
import bcrypt from "bcrypt";
import authClientRepository from "../repositories/authClient.repository";
import jwt from "jsonwebtoken";

// 1단계 공통 setUp - 테스트 환경 설정 (각 describe에서 모두 필요해서 최상단에 모아서 작성함)
jest.mock("../repositories/authMover.repository");
jest.mock("../repositories/authClient.repository");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const mockBcryptCompare = bcrypt.compare as unknown as jest.Mock<
  Promise<boolean>,
  [string, string]
>;
const mockJwtVerify = jwt.verify as jest.Mock;

let req: any;
let res: any;
let next: jest.Mock;

// 필요한 함수 모킹
const mockGetMoverByEmail = authMoverRepository.getMoverByEmail as jest.MockedFunction<
  typeof authMoverRepository.getMoverByEmail
>;
const mockGetMoverByPhone = authMoverRepository.getMoverByPhone as jest.MockedFunction<
  typeof authMoverRepository.getMoverByPhone
>;
const mockFindByEmailRaw = authClientRepository.findByEmailRaw as jest.MockedFunction<
  typeof authClientRepository.findByEmailRaw
>;
const mockFindByPhone = authClientRepository.findByPhone as jest.MockedFunction<
  typeof authClientRepository.findByPhone
>;

// validateReq 함수
describe("프론트의 요청을 검증한다 ", () => {
  // 테스트용 스키마
  const mockSchema = z.object({
    name: z.string().min(2),
  });

  const middleware = validateReq(mockSchema);

  beforeEach(() => {
    jest.clearAllMocks();

    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("유효한 요청이면 다음 미들웨어를 실행한다", () => {
    //  1단계 setUp - 테스트 준비
    req.body = { name: "김무빙" }; // 유효한 요청

    // 2단계 exercise - 테스트 실행
    middleware(req, res, next);

    //3단계 assertion - 결과 검증
    expect(req.body).toEqual({ name: "김무빙" });
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(); // 에러 없이 호출되는지 확인

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("잘못된 요청이면 에러와 에러 메세지를 전달한다", () => {
    req.body = { name: "a" }; // 잘못된 요청

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toBe("잘못된 정보로 인한 요청 실패");
  });
});

// checkMoverSignUpInfo 함수
describe("(기사) 회원가입 시 이메일과 전화번호를 DB와 대조한다", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        email: "test@naver.com",
        phone: "01012345678",
      },
    };
    res = {};
    next = jest.fn();
  });

  test("이메일, 전화번호가 중복이 아니면 다음 미들웨어를 실행한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockGetMoverByEmail.mockResolvedValue(null); // 중복 이메일 존재하지 않음
    mockGetMoverByPhone.mockResolvedValue(null); // 중복 전화번호 존재하지 않음

    // 2단계 exercise - 테스트 실행
    await checkMoverSignUpInfo(req, res, next);

    //3단계 assertion - 결과 검증
    expect(mockGetMoverByEmail).toHaveBeenCalledWith(req.body.email);
    expect(mockGetMoverByPhone).toHaveBeenCalledWith(req.body.phone);
    expect(next).toHaveBeenCalledWith(); // 에러 인자 없이 호출됨

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("이메일이 중복이면 에러와 에러 메세지를 전달한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockGetMoverByEmail.mockResolvedValue({ id: "1", email: req.body.email } as any); // 중복 이메일 존재 함
    mockGetMoverByPhone.mockResolvedValue(null); // 중복 전화번호 존재하지 않음

    // 2단계 exercise - 테스트 실행
    await checkMoverSignUpInfo(req, res, next);

    //3단계 assertion - 결과 검증
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toBe("중복 정보로 인한 회원가입 실패");
    expect(error.data).toHaveProperty("email");

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("전화번호가 중복이면 에러와 에러 메세지를 전달한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockGetMoverByEmail.mockResolvedValue(null); // 중복 이메일 존재하지 않음
    mockGetMoverByPhone.mockResolvedValue({ id: "1", email: req.body.phone } as any); // 중복 전화번호 존재 함

    // 2단계 exercise - 테스트 실행
    await checkMoverSignUpInfo(req, res, next);

    //3단계 assertion - 결과 검증
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toBe("중복 정보로 인한 회원가입 실패");
    expect(error.data).toHaveProperty("phone");

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("이메일, 전화번호가 중복이면 에러와 에러 메세지를 전달한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockGetMoverByEmail.mockResolvedValue({ id: "1", email: req.body.email } as any); // 중복 이메일 존재 함
    mockGetMoverByPhone.mockResolvedValue({ id: "1", email: req.body.phone } as any); // 중복 전화번호 존재 함

    // 2단계 exercise - 테스트 실행
    await checkMoverSignUpInfo(req, res, next);

    //3단계 assertion - 결과 검증
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.data).toHaveProperty("email");
    expect(error.data).toHaveProperty("phone");

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("레포지토리 호출 중 에러 발생 시 에러와 에러 메세지를 전달한다", async () => {
    mockGetMoverByEmail.mockRejectedValue(new Error("DB 에러"));
    mockGetMoverByPhone.mockResolvedValue(null);

    await checkMoverSignUpInfo(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("DB 에러");
  });
});

// checkMoverSignInInfo 함수
describe("(기사) 로그인 시 이메일과 비밀번호를 DB와 대조한다", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        email: "test@naver.com",
        password: "password123",
      },
    };
    res = {};
    next = jest.fn();
  });

  test("존재하는 사용자고 비밀번호가 맞으면 다음 미들웨어를 실행한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockGetMoverByEmail.mockResolvedValue({
      email: req.body!.email,
      hashedPassword: "hashed_password",
    } as any);

    mockBcryptCompare.mockResolvedValue(true);

    // 2단계 exercise - 테스트 실행
    await checkMoverSignInInfo(req, res, next);

    //3단계 assertion - 결과 검증
    expect(mockGetMoverByEmail).toHaveBeenCalledWith(req.body!.email);
    expect(mockBcryptCompare).toHaveBeenCalledWith(req.body!.password, "hashed_password");
    expect(next).toHaveBeenCalledWith();

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("사용자가 존재하지 않으면 에러와 에러 메세지를 전달한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockGetMoverByEmail.mockResolvedValue(null);

    // 2단계 exercise - 테스트 실행
    await checkMoverSignInInfo(req, res, next);

    //3단계 assertion - 결과 검증
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toBe("사용자를 찾을 수 없습니다.");
    expect(error.data).toHaveProperty("email");

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("비밀번호가 틀리면 에러와 에러 메세지를 전달한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockGetMoverByEmail.mockResolvedValue({
      email: req.body!.email,
      hashedPassword: "hashed_password",
    } as any);

    mockBcryptCompare.mockResolvedValue(false);

    // 2단계 exercise - 테스트 실행
    await checkMoverSignInInfo(req, res, next);

    //3단계 assertion - 결과 검증
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toBe(ErrorMessage.PASSWORD_NOT_MATCH);
    expect(error.data).toHaveProperty("password");

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("레포지토리 호출 중 에러 발생 시 에러와 에러 메세지를 전달한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockGetMoverByEmail.mockRejectedValue(new Error("DB 에러"));

    // 2단계 exercise - 테스트 실행
    await checkMoverSignInInfo(req, res, next);

    //3단계 assertion - 결과 검증
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("DB 에러");

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });
});

// checkClientSignUpInfo 함수
describe("(일반 유저) 회원가입 시 이메일과 전화번호를 DB와 대조한다)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        email: "test@naver.com",
        password: "password123",
        phone: "01012345678",
      },
    };
    res = {};
    next = jest.fn();
  });

  test("이메일, 전화번호가 중복이 아니면 다음 미들웨어를 실행한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockFindByEmailRaw.mockResolvedValue(null);
    mockFindByPhone.mockResolvedValue(null);

    // 2단계 exercise - 테스트 실행
    await checkClientSignUpInfo(req, res, next);

    //3단계 assertion - 결과 검증
    expect(mockFindByEmailRaw).toHaveBeenCalledWith("test@naver.com");
    expect(mockFindByPhone).toHaveBeenCalledWith("01012345678");
    expect(next).toHaveBeenCalledWith();

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("이메일이 중복이면 에러와 에러 메세지를 전달한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockFindByEmailRaw.mockResolvedValue({
      id: "1",
      email: req.body.email,
      provider: "LOCAL",
    } as any);
    mockFindByPhone.mockResolvedValue(null);

    // 2단계 exercise - 테스트 실행
    await checkClientSignUpInfo(req, res, next);

    //3단계 assertion - 결과 검증
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toContain("중복 정보로 인한 회원가입 실패");
    expect(error.data).toHaveProperty("email", ErrorMessage.ALREADY_EXIST_EMAIL);

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("전화번호가 중복이면 에러와 에러 메세지를 전달한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockFindByEmailRaw.mockResolvedValue(null);
    mockFindByPhone.mockResolvedValue({ id: "1", phone: req.body.phone } as any);

    // 2단계 exercise - 테스트 실행
    await checkClientSignUpInfo(req, res, next);

    //3단계 assertion - 결과 검증
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toContain("중복 정보로 인한 회원가입 실패");
    expect(error.data).toHaveProperty("phone", ErrorMessage.ALREADY_EXIST_PHONE);

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("이메일, 전화번호가 중복이면 에러와 에러 메세지를 전달한다", async () => {
    //  1단계 setUp - 테스트 준비
    mockFindByEmailRaw.mockResolvedValue({
      id: "1",
      email: req.body.email,
      provider: "LOCAL",
    } as any);
    mockFindByPhone.mockResolvedValue({ id: "1", phone: req.body.phone } as any);

    // 2단계 exercise - 테스트 실행
    await checkClientSignUpInfo(req, res, next);

    //3단계 assertion - 결과 검증
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toContain("중복 정보로 인한 회원가입 실패");
    expect(error.data).toHaveProperty("email", ErrorMessage.ALREADY_EXIST_EMAIL);
    expect(error.data).toHaveProperty("phone", ErrorMessage.ALREADY_EXIST_PHONE);

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });
});

// optionalAuth 함수
describe("토큰의 유효성에 따라 정보를 반환한다", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
  });

  test("토큰이 유효할 때 req.auth에 decoded 정보가 담긴다", () => {
    //  1단계 setUp - 테스트 준비
    const fakeToken = "Bearer valid.token.here";
    const decoded = { id: "user123", role: "client" };

    req.headers = {
      authorization: fakeToken,
    };

    mockJwtVerify.mockReturnValue(decoded);

    // 2단계 exercise - 테스트 실행
    optionalAuth(req, res, next);

    //3단계 assertion - 결과 검증
    expect(mockJwtVerify).toHaveBeenCalledWith("valid.token.here", expect.any(String));
    expect(req.auth).toEqual(decoded);
    expect(next).toHaveBeenCalledWith(); // 에러 없이 진행

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("Authorization 헤더가 없을 때 다음 미들웨어를 실행한다", () => {
    //  1단계 setUp - 테스트 준비
    req.headers = {};

    // 2단계 exercise - 테스트 실행
    optionalAuth(req, res, next);

    //3단계 assertion - 결과 검증
    expect(mockJwtVerify).not.toHaveBeenCalled();
    expect(req.auth).toBeUndefined();
    expect(next).toHaveBeenCalledWith();

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });

  test("잘못된 토큰일 경우 에러와 에러 메세지를 전달한다", () => {
    //  1단계 setUp - 테스트 준비
    const fakeToken = "Bearer invalid.token.here";
    const error = new Error("invalid token");

    req.headers = {
      authorization: fakeToken,
    };

    mockJwtVerify.mockImplementation(() => {
      throw error;
    });

    // 2단계 exercise - 테스트 실행
    optionalAuth(req, res, next);

    //3단계 assertion - 결과 검증
    expect(mockJwtVerify).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);

    //4단계 teardown - 테스트 정리 (외부 자원을 사용하지 않아서 생략함)
  });
});
