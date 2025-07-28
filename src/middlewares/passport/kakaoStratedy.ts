import { Strategy as KakaoStrategy, Profile } from "passport-kakao";
import providerMap from "../../utils/providerMap.util";
import { NotFoundError } from "../../types/errors";
import authClientService from "../../services/authClient.service";

const kakaoStrategyOptions = {
  clientID: process.env.KAKAO_CLIENT_ID!,
  clientSecret: process.env.KAKAO_CLIENT_SECRET!,
  callbackURL: "/auth/kakao/callback",
};

// ✅ 인증 함수 실행해서 프로필 정보를 id 코드로 넘김
async function verify(
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: (error: any, user?: any) => void,
) {
  // enum <-> string 변환
  const providerEnumValue = providerMap[profile.provider];

  // 데이터 형태 변환
  const kakaoAccount = profile._json?.kakao_account;
  const email = kakaoAccount?.email;

  // 이메일 없으면 오류 처리
  if (!email) {
    return done(new NotFoundError("카카오 이메일 x"));
  }

  // 사용자 데이터
  const userInfo = await authClientService.oAuthCreateOrUpdate({
    provider: providerEnumValue,
    providerId: profile.id.toString(),
    email: profile._json.kakao_account.email,
    // name: "",
    // phone: "",
  });

  done(null, userInfo); // req.user = user;
}

// ✅ 실행
const kakaoStrategy = new KakaoStrategy(kakaoStrategyOptions, verify);

export default kakaoStrategy;
