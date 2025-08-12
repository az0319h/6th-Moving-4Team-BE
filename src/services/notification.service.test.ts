import { ErrorMessage } from "../constants/ErrorMessage";
import { NotificationTemplate } from "../constants/NotificationTemplate";
import moverRepository from "../repositories/mover.repository";
import notificationRepository from "../repositories/notification.repository";
import {
  ForbiddenError,
  NotFoundError,
  NotificationPayload,
  NotifyConfirmEstimate,
  NotifyNewEstimate,
  NotifyNewRequest,
} from "../types";
import { parseRegionKeywords } from "../utils/region.util";
import { sendNotificationTo } from "../utils/sse.helper";
import { NotificationType, MoveType } from "@prisma/client";
import notificationService from "./notification.service";

jest.mock("../repositories/mover.repository");
jest.mock("../repositories/notification.repository");
jest.mock("../utils/region.util");
jest.mock("../utils/sse.helper");

const mockMoverRepository = moverRepository as jest.Mocked<typeof moverRepository>;
const mockNotificationRepository = notificationRepository as jest.Mocked<
  typeof notificationRepository
>;
const mockParseRegionKeywords = parseRegionKeywords as jest.MockedFunction<
  typeof parseRegionKeywords
>;
const mockSendNotificationTo = sendNotificationTo as jest.MockedFunction<typeof sendNotificationTo>;

describe("SSE 알림 전송 테스트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("알림 전송 및 저장", () => {
    const mockPayload: NotificationPayload = {
      userId: "user-123",
      content: "Test notification",
      type: NotificationType.NEW_ESTIMATE,
      targetId: "estimate-123",
      targetUrl: "/estimates/123",
    };

    test("SSE를 통해 알림을 전송하고 데이터베이스에 저장해야 한다", async () => {
      mockNotificationRepository.createNotification.mockResolvedValue({} as any);

      await notificationService.sendAndSaveNotification(mockPayload);

      expect(mockSendNotificationTo).toHaveBeenCalledWith(mockPayload.userId, {
        content: mockPayload.content,
        type: mockPayload.type,
        targetId: mockPayload.targetId,
        targetUrl: mockPayload.targetUrl,
      });
      expect(mockNotificationRepository.createNotification).toHaveBeenCalledWith(mockPayload);
    });
  });

  describe("알림 목록 조회", () => {
    test("커서와 제한값을 사용하여 알림을 조회해야 한다", async () => {
      const mockNotifications = [
        {
          id: "1",
          content: "Test",
          createdAt: new Date(),
          userId: "user-123",
          type: NotificationType.NEW_ESTIMATE,
          targetId: "estimate-123",
          targetUrl: "/estimates/123",
          isRead: false,
        },
      ];
      const mockResult = {
        notifications: mockNotifications,
        nextCursor: "cursor-456",
        unreadCount: 1,
      };
      mockNotificationRepository.getNotifications.mockResolvedValue(mockResult);

      const result = await notificationService.getNotifications("user-123", "cursor-123", 10);

      expect(mockNotificationRepository.getNotifications).toHaveBeenCalledWith({
        userId: "user-123",
        cursor: "cursor-123",
        limit: 10,
      });
      expect(result).toEqual(mockResult);
    });

    test("커서와 제한값 없이 알림을 조회해야 한다", async () => {
      const mockNotifications = [
        {
          id: "1",
          content: "Test",
          createdAt: new Date(),
          userId: "user-123",
          type: NotificationType.NEW_ESTIMATE,
          targetId: "estimate-123",
          targetUrl: "/estimates/123",
          isRead: false,
        },
      ];
      const mockResult = {
        notifications: mockNotifications,
        nextCursor: null,
        unreadCount: 1,
      };
      mockNotificationRepository.getNotifications.mockResolvedValue(mockResult);

      const result = await notificationService.getNotifications("user-123");

      expect(mockNotificationRepository.getNotifications).toHaveBeenCalledWith({
        userId: "user-123",
        cursor: undefined,
        limit: undefined,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("알림 읽기", () => {
    test("알림을 성공적으로 읽어야 한다", async () => {
      const mockNotification = {
        id: "notification-123",
        userId: "user-123",
        content: "Test",
        type: NotificationType.NEW_ESTIMATE,
        targetId: "estimate-123",
        targetUrl: "/estimates/123",
        isRead: false,
        createdAt: new Date(),
      };
      mockNotificationRepository.getNotification.mockResolvedValue(mockNotification);
      mockNotificationRepository.updateNotification.mockResolvedValue({
        ...mockNotification,
        isRead: true,
        createdAt: new Date(),
      });

      const result = await notificationService.readNotification("notification-123", "user-123");

      expect(mockNotificationRepository.getNotification).toHaveBeenCalledWith("notification-123");
      expect(mockNotificationRepository.updateNotification).toHaveBeenCalledWith(
        "notification-123",
      );
      expect(result).toEqual({ ...mockNotification, isRead: true });
    });

    test("알림을 찾을 수 없을 때 NotFoundError를 발생시켜야 한다", async () => {
      mockNotificationRepository.getNotification.mockResolvedValue(null);

      await expect(
        notificationService.readNotification("notification-123", "user-123"),
      ).rejects.toThrow(NotFoundError);
      await expect(
        notificationService.readNotification("notification-123", "user-123"),
      ).rejects.toThrow(ErrorMessage.NOTIFICATION_NOT_FOUND);
    });

    test("사용자가 알림 소유자가 아닐 때 ForbiddenError를 발생시켜야 한다", async () => {
      const mockNotification = {
        id: "notification-123",
        userId: "user-456",
        content: "Test",
        type: NotificationType.NEW_ESTIMATE,
        targetId: "estimate-123",
        targetUrl: "/estimates/123",
        isRead: false,
        createdAt: new Date(),
      };
      mockNotificationRepository.getNotification.mockResolvedValue(mockNotification);

      await expect(
        notificationService.readNotification("notification-123", "user-123"),
      ).rejects.toThrow(ForbiddenError);
      await expect(
        notificationService.readNotification("notification-123", "user-123"),
      ).rejects.toThrow(ErrorMessage.FORBIDDEN);
    });
  });

  describe("모든 알림 읽기", () => {
    test("사용자의 모든 알림을 읽어야 한다", async () => {
      const mockResult = { count: 5 };
      mockNotificationRepository.updateAll.mockResolvedValue(mockResult);

      const result = await notificationService.readAllNotifications("user-123");

      expect(mockNotificationRepository.updateAll).toHaveBeenCalledWith("user-123");
      expect(result).toEqual(mockResult);
    });
  });

  describe("견적 알림", () => {
    const mockNotifyData: NotifyNewEstimate = {
      clientId: "client-123",
      moverName: "Test Mover",
      moveType: MoveType.SMALL,
      type: NotificationType.NEW_ESTIMATE,
      targetId: "estimate-123",
      targetUrl: "/estimates/123",
    };

    test("새로운 견적에 대한 알림을 전송해야 한다", async () => {
      mockNotificationRepository.createNotification.mockResolvedValue({} as any);

      await notificationService.notifyEstimate(mockNotifyData);

      expect(mockSendNotificationTo).toHaveBeenCalledWith(mockNotifyData.clientId, {
        content: expect.any(String),
        type: mockNotifyData.type,
        targetId: mockNotifyData.targetId,
        targetUrl: mockNotifyData.targetUrl,
      });
      expect(mockNotificationRepository.createNotification).toHaveBeenCalledWith({
        userId: mockNotifyData.clientId,
        content: expect.any(String),
        type: mockNotifyData.type,
        targetId: mockNotifyData.targetId,
        targetUrl: mockNotifyData.targetUrl,
      });
    });

    test("내용이 비어있을 때는 알림을 전송하지 않아야 한다", async () => {
      // 내용이 비어있는 알림 템플릿 반환
      jest.spyOn(NotificationTemplate.NEW_ESTIMATE, "client").mockReturnValue("");

      await notificationService.notifyEstimate(mockNotifyData);

      expect(mockSendNotificationTo).not.toHaveBeenCalled();
      expect(mockNotificationRepository.createNotification).not.toHaveBeenCalled();
    });
  });

  describe("견적 요청 알림", () => {
    const mockRequestData: NotifyNewRequest = {
      clientName: "Test Client",
      fromAddress: "서울시 강남구",
      toAddress: "서울시 서초구",
      moveType: MoveType.SMALL,
      type: NotificationType.NEW_ESTIMATE,
      targetId: "request-123",
      targetUrl: "/requests/123",
    };

    test("서비스 지역의 기사들에게 알림을 전송해야 한다", async () => {
      const mockMovers = [
        { id: "mover-1", name: "Mover 1" },
        { id: "mover-2", name: "Mover 2" },
      ];
      mockParseRegionKeywords.mockReturnValue(["서울시", "강남구", "서초구"]);
      mockMoverRepository.findMoversByServiceArea.mockResolvedValue(mockMovers);
      mockNotificationRepository.createMany.mockResolvedValue({} as any);

      await notificationService.notifyEstimateRequest(mockRequestData);

      expect(mockParseRegionKeywords).toHaveBeenCalledWith(mockRequestData.fromAddress);
      expect(mockParseRegionKeywords).toHaveBeenCalledWith(mockRequestData.toAddress);
      expect(mockMoverRepository.findMoversByServiceArea).toHaveBeenCalledWith([
        "서울시",
        "강남구",
        "서초구",
      ]);

      // SSE 알림 전송 확인
      expect(mockSendNotificationTo).toHaveBeenCalledTimes(2);
      expect(mockSendNotificationTo).toHaveBeenCalledWith("mover-1", {
        content: expect.any(String),
        type: mockRequestData.type,
        role: "mover",
        targetId: mockRequestData.targetId,
        targetUrl: mockRequestData.targetUrl,
      });

      // 데이터베이스 알림 생성 확인
      expect(mockNotificationRepository.createMany).toHaveBeenCalledWith([
        {
          userId: "mover-1",
          content: expect.any(String),
          type: mockRequestData.type,
          targetId: mockRequestData.targetId,
          targetUrl: mockRequestData.targetUrl,
        },
        {
          userId: "mover-2",
          content: expect.any(String),
          type: mockRequestData.type,
          targetId: mockRequestData.targetId,
          targetUrl: mockRequestData.targetUrl,
        },
      ]);
    });

    test("기사 목록이 비어있을 때를 적절히 처리해야 한다", async () => {
      mockParseRegionKeywords.mockReturnValue(["서울시"]);
      mockMoverRepository.findMoversByServiceArea.mockResolvedValue([]);

      await notificationService.notifyEstimateRequest(mockRequestData);

      expect(mockSendNotificationTo).not.toHaveBeenCalled();
      expect(mockNotificationRepository.createMany).toHaveBeenCalledWith([]);
    });
  });

  describe("견적 확정 알림", () => {
    const mockConfirmData: NotifyConfirmEstimate = {
      userId: "user-123",
      clientName: "Test Client",
      moverName: "Test Mover",
      type: NotificationType.ESTIMATE_CONFIRMED,
      targetId: "estimate-123",
      targetUrl: "/estimates/123",
    };

    test("기사에게 고객 이름과 함께 알림을 전송해야 한다", async () => {
      mockNotificationRepository.createNotification.mockResolvedValue({} as any);

      await notificationService.notifyEstimateConfirmed({
        ...mockConfirmData,
        clientName: "Test Client",
        moverName: undefined,
      });

      expect(mockSendNotificationTo).toHaveBeenCalledWith(mockConfirmData.userId, {
        content: expect.any(String),
        type: mockConfirmData.type,
        targetId: mockConfirmData.targetId,
        targetUrl: mockConfirmData.targetUrl,
      });
    });

    test("고객에게 기사 이름과 함께 알림을 전송해야 한다", async () => {
      mockNotificationRepository.createNotification.mockResolvedValue({} as any);

      await notificationService.notifyEstimateConfirmed({
        ...mockConfirmData,
        clientName: undefined,
        moverName: "Test Mover",
      });

      expect(mockSendNotificationTo).toHaveBeenCalledWith(mockConfirmData.userId, {
        content: expect.any(String),
        type: mockConfirmData.type,
        targetId: mockConfirmData.targetId,
        targetUrl: mockConfirmData.targetUrl,
      });
    });

    test("두 이름이 모두 없을 때는 알림을 전송하지 않아야 한다", async () => {
      await notificationService.notifyEstimateConfirmed({
        ...mockConfirmData,
        clientName: undefined,
        moverName: undefined,
      });

      expect(mockSendNotificationTo).not.toHaveBeenCalled();
      expect(mockNotificationRepository.createNotification).not.toHaveBeenCalled();
    });
  });

  describe("견적 반려 알림", () => {
    const mockRejectData: NotifyConfirmEstimate = {
      userId: "user-123",
      clientName: undefined,
      moverName: "Test Mover",
      type: NotificationType.ESTIMATE_REJECTED,
      targetId: "estimate-123",
      targetUrl: "/estimates/123",
    };

    test("견적 반려 알림을 전송해야 한다", async () => {
      mockNotificationRepository.createNotification.mockResolvedValue({} as any);

      await notificationService.notifyEstimateRejcted(mockRejectData);

      expect(mockSendNotificationTo).toHaveBeenCalledWith(mockRejectData.userId, {
        content: expect.any(String),
        type: mockRejectData.type,
        targetId: mockRejectData.targetId,
        targetUrl: mockRejectData.targetUrl,
      });
    });
  });

  describe("이사날 알림", () => {
    const mockEstimate = {
      id: "estimate-123",
      clientId: "client-123",
      moverId: "mover-123",
      requestId: "request-123",
      price: 50000,
      moverStatus: "CONFIRMED" as any,
      isClientConfirmed: true,
      comment: "테스트 견적입니다",
      createdAt: new Date(),
    } as any;

    test("이사날에 고객과 기사 모두에게 알림을 전송해야 한다", async () => {
      mockNotificationRepository.createNotification.mockResolvedValue({} as any);

      await notificationService.notifyMovingDay(mockEstimate, "이사 날짜입니다!");

      expect(mockSendNotificationTo).toHaveBeenCalledTimes(2);
      expect(mockSendNotificationTo).toHaveBeenCalledWith(mockEstimate.clientId, {
        content: "이사 날짜입니다!",
        type: NotificationType.MOVING_DAY,
        targetId: mockEstimate.id,
        targetUrl: `/my-quotes/client/${mockEstimate.id}`,
      });
      expect(mockSendNotificationTo).toHaveBeenCalledWith(mockEstimate.moverId, {
        content: "이사 날짜입니다!",
        type: NotificationType.MOVING_DAY,
        targetId: mockEstimate.id,
        targetUrl: `/my-quotes/mover/${mockEstimate.id}`,
      });

      expect(mockNotificationRepository.createNotification).toHaveBeenCalledTimes(2);
    });
  });
});
