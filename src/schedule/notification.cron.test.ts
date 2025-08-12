import cron from "node-cron";
import estimateRepository from "../repositories/estimate.repository";
import { NotificationTemplate } from "../constants/NotificationTemplate";
import notificationService from "../services/notification.service";

jest.mock("node-cron");
jest.mock("date-fns", () => ({
  addDays: jest.fn(),
  format: jest.fn(),
  startOfDay: jest.fn(),
}));
jest.mock("../repositories/estimate.repository");
jest.mock("../services/notification.service");
jest.mock("../constants/NotificationTemplate");

const mockCron = cron as jest.Mocked<typeof cron>;
const mockEstimateRepository = estimateRepository as jest.Mocked<typeof estimateRepository>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockNotificationTemplate = NotificationTemplate as jest.Mocked<typeof NotificationTemplate>;

describe("이사 알림 스케줄러 테스트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  test("NODE_ENV가 test일 때는 cron 스케줄을 등록하지 않아야 한다", () => {
    process.env.NODE_ENV = "test";

    jest.resetModules();
    require("./notification.cron");

    expect(mockCron.schedule).not.toHaveBeenCalled();
  });

  test("필요한 의존성들이 올바르게 import되어야 한다", () => {
    // 모듈이 올바르게 import되었는지 확인
    expect(mockEstimateRepository).toBeDefined();
    expect(mockNotificationService).toBeDefined();
    expect(mockNotificationTemplate).toBeDefined();
    expect(mockCron).toBeDefined();
  });

  test("모듈이 정상적으로 로드되어야 한다", () => {
    // 모듈을 로드할 때 에러가 발생하지 않아야 함
    expect(() => {
      process.env.NODE_ENV = "production";
      jest.resetModules();
      require("./notification.cron");
    }).not.toThrow();
  });
});
