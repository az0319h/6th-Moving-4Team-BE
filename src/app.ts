import "dotenv/config";
import express from "express";
import figlet from "figlet";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./configs/passport.config";
import errorHandler from "./middlewares/errorHandler";
import authRouter from "./routers/auth.router";
import infoRouter from "./routers/info.router";
import { specs, swaggerUi } from "./swagger";
import moverRouter from "./routers/mover.router";
import profileRouter from "./routers/profile.router";
import reviewRouter from "./routers/review.router";
import estimateRouter from "./routers/estimate.router";
import requestRouter from "./routers/request.router";
import { verifyAccessToken } from "./middlewares/auth.middleware";

const app = express();
const PORT = process.env.PORT;

// trust proxy 설정 (쿠키 보안 관련: production 시 필요)
app.set("trust proxy", 1);

// 미들웨어
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// 라우터 등록
app.use("/", infoRouter);
app.use("/auth", authRouter);
app.use("/profile", verifyAccessToken, profileRouter);
app.use("/movers", moverRouter)
app.use("/reviews", verifyAccessToken, reviewRouter);
app.use("/estimates", verifyAccessToken, estimateRouter);
app.use("/requests", requestRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));


// 에러 핸들러
app.use(errorHandler);

app.listen(PORT, () => {
  figlet("Team4 Moving", (err, data) => {
    if (err) {
      console.log("Something went wrong with figlet");
      console.dir(err);
      return;
    }
    console.log(data || `Server started at port ${PORT}`);
  });
});
