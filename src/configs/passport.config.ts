/**
 * @file passport.config.ts
 * @description 소셜 로그인을 위한 Passport 전략 설정 정의
 */

import passport from "passport";
import googleStrategy from "../middlewares/passport/googleStratedy";
import kakaoStrategy from "../middlewares/passport/kakaoStratedy";

passport.use("google", googleStrategy);
passport.use("kakao", kakaoStrategy);
