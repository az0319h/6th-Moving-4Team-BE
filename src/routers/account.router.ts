import accountMoverController from "../controllers/accountMover.controller";
import { editAccountMoverSchema } from "../dtos/mover.dto";
import { validateReq } from "../middlewares/auth.middleware";
import { checkMoverAccountInfo } from "../middlewares/account.middleware";
import { Router } from "express";
import { basicInfoUpdateLimit } from "../middlewares/rateLimits.middleware";

const accountRouter = Router();

// 기사님 기본정보 수정
accountRouter.patch(
  "/edit/mover",
  validateReq(editAccountMoverSchema),
  basicInfoUpdateLimit,
  checkMoverAccountInfo,
  accountMoverController.editAccountMover,
);

export default accountRouter;
