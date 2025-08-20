import notificationController from "../controllers/notification.controller";
import { Router } from "express";

const notificationRouter = Router();

// SSE 연결
notificationRouter.get("/stream", notificationController.sendNotification);

// 알림 조회
notificationRouter.get("/", notificationController.getNotifications);

// 알림 읽기
notificationRouter.patch("/:id", notificationController.readNotification);

// 모든 알림 읽기
notificationRouter.patch("/", notificationController.readAllNotifications);

export default notificationRouter;
