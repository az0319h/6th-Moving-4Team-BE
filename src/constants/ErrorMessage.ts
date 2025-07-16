export const ErrorMessage = {
  // Not Found
  USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",
  ACCESSTOKEN_NOT_FOUND: "accessToken을 찾을 수 없습니다.",
  REFRESHTOKEN_NOT_FOUND: "refreshToken을 찾을 수 없습니다.",
  JWT_SECRET_NOT_FOUND: "jwt 시크릿키를 찾을 수 없습니다.",
  JWT_EXPIRES_IN_NOT_FOUND: "jwt 유효기간을 찾을 수 없습니다.",

  // Not Match
  PASSWORD_NOT_MATCH: "비밀번호가 일치하지 않습니다.",
  PASSWORD_CONFIRMATION_NOT_MATCH: "비밀번호 확인 결과가 일치하지 않습니다.",

  // Already Exist
  ALREADY_EXIST_EMAIL: "이미 사용 중인 이메일입니다.",
  ALREADY_EXIST_NICKNAME: "이미 사용 중인 닉네임입니다.",
  ALREADY_EXIST_PHONE: "이미 사용 중인 전화번호입니다.",
  ALREADY_EXIST_PROFILE: "이미 등록된 프로필입니다.",

  // Invalid
  INVALID_EMAIL: "잘못된 이메일입니다.",
  INVALID_INPUT: "유효한 필수 정보를 입력해주세요.",
  INVALID_ACCESS_TOKEN: "유효하지 않은 accessToken입니다.",
  INVALID_REFRESH_TOKEN: "유효하지 않은 refreshToken입니다.",

  UNAUTHORIZED: "인증되지 않은 사용자입니다.",
  FORBIDDEN: "요청한 작업을 수행하기 위한 권한이 없습니다.",
  BAD_REQUEST: "잘못된 요청입니다.",

  // 회원가입 추가
  NO_EMAIL: "이메일을 입력해 주세요.",
  NO_NAME: "이름을 입력해 주세요.",
  NO_PHONE: "전화번호를 입력해 주세요.",
  NO_PASSWORD: "비밀번호를 입력해 주세요.",
  PASSWORD_LENGTH_LIMIT: "비밀번호를 최소 8자 이상 입력해 주세요.",
  PASSWORD_REGEX: "문자와 숫자를 섞어 비밀번호를 작성해 주세요.",
  NAME_LENGTH_LIMIT: "이름을 4자 이내로 입력해 주세요.",
  PHONE_REGEX: "전화번호는 9~11자 사이의 숫자여야 합니다.",

  // 프로필 추가
  NO_CLIENT_PROFILE: "프로필 사진, 이용 서비스, 내가 사는 지역 중 하나 이상 선택하셔야 합니다.",
};
