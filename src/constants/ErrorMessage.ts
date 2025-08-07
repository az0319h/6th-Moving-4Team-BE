export const ErrorMessage = {
  // Not Found
  USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",
  REGION_NOT_FOUND: "존재하지 않는 지역입니다.",
  NOTIFICATION_NOT_FOUND: "알림이 존재하지 않습니다.",
  ACCESSTOKEN_NOT_FOUND: "accessToken을 찾을 수 없습니다.",
  REFRESHTOKEN_NOT_FOUND: "refreshToken을 찾을 수 없습니다.",
  JWT_SECRET_NOT_FOUND: "jwt 시크릿키를 찾을 수 없습니다.",
  JWT_EXPIRES_IN_NOT_FOUND: "jwt 유효기간을 찾을 수 없습니다.",
  PROFILE_NOT_FOUND: "프로필 수정에 실패했습니다.",
  DRAFT_NOT_FOUND: "견적 요청 초안이 존재하지 않습니다.",
  REQUEST_NOT_FOUND: "견적 요청을 찾을 수 없습니다.",

  // Not Match
  PASSWORD_NOT_MATCH: "비밀번호가 일치하지 않습니다.",
  PASSWORD_CONFIRMATION_NOT_MATCH: "비밀번호 확인 결과가 일치하지 않습니다.",
  PROFILE_NOT_MATCH: "등록된 프로필이 없습니다.",
  CHECK_BOTH_PASSWORD: "새 비밀번호와 새 비밀번호 확인을 모두 입력해주세요.",

  // Already Exist
  ALREADY_EXIST_EMAIL: "이미 사용 중인 이메일입니다.",
  ALREADY_EXIST_NICKNAME: "이미 사용 중인 닉네임입니다.",
  ALREADY_EXIST_PHONE: "이미 사용 중인 전화번호입니다.",
  ALREADY_EXIST_PROFILE: "이미 등록된 프로필입니다.",
  ALREADY_EXIST_USER: "이미 가입한 사용자입니다.",
  ALREADY_EXIST_REQUEST: "이미 진행 중인 견적 요청이 있습니다.",
  ALREADY_EXIST_WITH_SOCIAL: "이미 간편 회원가입한 유저입니다.",

  // Invalid
  INVALID_EMAIL: "잘못된 이메일입니다.",
  INVALID_INPUT: "유효한 필수 정보를 입력해주세요.",
  INVALID_ACCESS_TOKEN: "유효하지 않은 accessToken입니다.",
  INVALID_REFRESH_TOKEN: "유효하지 않은 refreshToken입니다.",

  UNAUTHORIZED: "인증되지 않은 사용자입니다.",
  FORBIDDEN: "요청한 작업을 수행하기 위한 권한이 없습니다.",
  BAD_REQUEST: "잘못된 요청입니다.",

  // Failed
  FALIED_CANCEL_REQUEST: "확정된 견적은 취소할 수 없습니다.",

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
  NO_CLIENT_PROFILE: "이용 서비스와 내가 사는 지역을 선택해야 합니다.",
  NO_SERVICE_TYPE: "서비스 유형을 1개 이상 선택해야 합니다.",
  NO_REGION: "지역을 1개 이상 선택해야 합니다.",
  MAX_REGION: "지역은 3개까지 선택할 수 있습니다.",
  NEW_PASSWORD_CONFIRMATION_NOT_MATCH: "새 비밀번호 확인 결과가 일치하지 않습니다.",
};
