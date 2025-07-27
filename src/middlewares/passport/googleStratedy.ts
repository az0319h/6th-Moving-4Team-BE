import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import authClientService from "../../services/authClient.service";
import providerMap from "../../utils/providerMap.util";
import { NotFoundError } from "../../types/errors";

const googleStrategyOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/auth/google/callback",
};

// ✅ 인증 함수 실행해서 프로필 정보를 id 코드로 넘김
async function verify(
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: VerifyCallback,
) {
  // enum <-> string 변환
  const providerEnumValue = providerMap[profile.provider];

  // 이메일 없으면 오류 처리
  if (!profile.emails || profile.emails.length === 0) {
    return done(new NotFoundError("구글 이메일 x"));
  }

  // 사용자 데이터
  const user = await authClientService.oAuthCreateOrUpdate({
    provider: providerEnumValue,
    providerId: profile.id,
    email: profile.emails[0]?.value,
    name: profile.displayName,
    phone: "",
  });

  done(null, user); // req.user = user;
}

// ✅ 실행
const googleStrategy = new GoogleStrategy(googleStrategyOptions, verify);

export default googleStrategy;
