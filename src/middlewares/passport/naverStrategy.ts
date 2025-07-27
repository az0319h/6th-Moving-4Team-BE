// import { Strategy as NaverStrategy } from "passport-naver";

// import userService from "../../services/userService.js";

// const naverStrategyOptions = {
//   clientID: process.env.NAVER_CLIENT_ID,
//   clientSecret: process.env.NAVER_CLIENT_SECRET,
//   callbackURL: "/auth/naver/callback",
// };

// async function verify(accessToken, refreshToken, profile, done) {
//   const user = await userService.oauthCreateOrUpdate(
//     profile.provider,
//     profile.id,
//     profile._json.email,
//     profile._json.nickname
//   );
//   done(null, user); // req.user = user;
// }

// const naverStrategy = new NaverStrategy(naverStrategyOptions, verify);

// export default naverStrategy;
