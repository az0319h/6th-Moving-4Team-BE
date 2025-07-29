import cron from "node-cron";
import estimateRepository from "../repositories/estimate.repository";
import { NotificationTemplate } from "../constants/NotificationTemplate";
import notificationService from "../services/notification.service";
import { addDays, startOfDay } from "date-fns";

cron.schedule("0 0 * * *", async () => {
  console.log("🕖 Running moving day notification at 9AM");
  const now = new Date();
  const today = startOfDay(now); // UTC 기준 오늘 00:00:00
  const tomorrow = addDays(today, 1);
  const dayAftertomorrow = addDays(today, 2);

  const [todayMoves, tomorrowMoves] = await Promise.all([
    estimateRepository.findEstimateByMoveDate(today, tomorrow),
    estimateRepository.findEstimateByMoveDate(tomorrow, dayAftertomorrow),
  ]);
  console.log("오늘 이사 견적 수: ", todayMoves.length);
  console.log("내일 이사 견적 수: ", tomorrowMoves.length);

  // 당일 이사 알림
  await Promise.all(
    todayMoves.map((estimate) => {
      const content = NotificationTemplate.MOVING_DAY(
        estimate.request.fromAddress,
        estimate.request.toAddress,
        0,
      );
      return notificationService.notifyMovingDay(estimate, content);
    }),
  );

  // 내일 이사 알림
  await Promise.all(
    tomorrowMoves.map((estimate) => {
      const content = NotificationTemplate.MOVING_DAY(
        estimate.request.fromAddress,
        estimate.request.toAddress,
        1,
      );
      return notificationService.notifyMovingDay(estimate, content);
    }),
  );
});
