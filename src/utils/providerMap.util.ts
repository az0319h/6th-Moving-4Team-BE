import { Provider } from "@prisma/client";

// ✅ string <-> enum 변환
const providerMap: Record<string, Provider> = {
  google: Provider.GOOGLE,
  kakao: Provider.KAKAO,
  naver: Provider.NAVER,
};

export default providerMap;
