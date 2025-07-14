import {
  PrismaClient,
  Provider,
  MoveType,
  EstimateStatus,
  NotificationType,
  Region,
  Client,
  Mover,
  Estimate,
  Review,
  Notification,
  Favorite,
  Request,
  DesignatedRequest,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const REGIONS: string[] = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충북",
  "충남",
  "세종",
  "대전",
  "전북",
  "전남",
  "광주",
  "경북",
  "경남",
  "대구",
  "울산",
  "부산",
  "제주",
];

async function main(): Promise<void> {
  // 외래키 의존성 역순으로 삭제
  await prisma.$executeRawUnsafe(`
  TRUNCATE TABLE "Favorite", "Notification", "Review", "Estimate", "DesignatedRequest", "Request", "Mover", "Client", "Region"
  RESTART IDENTITY CASCADE;
`);

  // 1. Region 데이터 생성 (17개)
  const regionRecords: Region[] = await Promise.all(
    REGIONS.map((regionName) => prisma.region.create({ data: { regionName } })),
  );

  // 2. Client 10명 생성 (지역 순환, 비밀번호 해시)
  const clients: Client[] = [];
  for (let i = 0; i < 10; i++) {
    const plainPassword = `password${i + 1}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const client: Client = await prisma.client.create({
      data: {
        email: `client${i + 1}@example.com`,
        name: `고객${i + 1}`,
        phone: `0101234567${i}`,
        hashedPassword: hashedPassword,
        provider: Provider.LOCAL,
        serviceType: [MoveType.HOME],
        livingArea: { connect: [{ id: regionRecords[i % regionRecords.length].id }] },
      },
    });
    clients.push(client);
  }

  // 3. Mover 10명 생성 (지역 순환, 비밀번호 해시)
  const movers: Mover[] = [];
  for (let i = 0; i < 10; i++) {
    const plainPassword = `moverpassword${i + 1}`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const mover: Mover = await prisma.mover.create({
      data: {
        email: `mover${i + 1}@example.com`,
        name: `기사${i + 1}`,
        nickName: `이사짱${i + 1}`,
        phone: `0108765432${i}`,
        hashedPassword: hashedPassword,
        provider: Provider.LOCAL,
        serviceType: [MoveType.HOME, MoveType.OFFICE],
        serviceArea: { connect: [{ id: regionRecords[i % regionRecords.length].id }] },
        introduction: `${i + 1}년 경력의 이사 전문가`,
        description: "친절하고 꼼꼼한 서비스 제공",
      },
    });
    movers.push(mover);
  }

  // 4. Request 10건 생성
  const requests: Request[] = [];
  for (let i = 0; i < 10; i++) {
    const request: Request = await prisma.request.create({
      data: {
        clientId: clients[i].id,
        moveType: MoveType.HOME,
        moveDate: new Date(`2025-08-${String(i + 1).padStart(2, "0")}T09:00:00.000Z`),
        fromAddress: `서울 강남구 테헤란로 ${i + 1}`,
        toAddress: `경기 성남시 분당구 판교로 ${i + 1}`,
        isPending: true,
      },
    });
    requests.push(request);
  }

  // 5. DesignatedRequest 10건 생성
  const designatedRequests: DesignatedRequest[] = [];
  for (let i = 0; i < 10; i++) {
    const designatedRequest: DesignatedRequest = await prisma.designatedRequest.create({
      data: {
        requestId: requests[i].id,
        moverId: movers[i].id,
      },
    });
    designatedRequests.push(designatedRequest);
  }

  // 6. Estimate 10건 생성 (각 client, mover 1:1 매칭)
  const estimates: Estimate[] = [];
  for (let i = 0; i < 10; i++) {
    const estimate: Estimate = await prisma.estimate.create({
      data: {
        clientId: clients[i].id,
        moverId: movers[i].id,
        requestId: requests[i].id,
        price: 250000 + i * 10000,
        moverStatus: EstimateStatus.CONFIRMED,
        isClientConfirmed: false,
        comment: "엘리베이터 있음, 짐 많음",
      },
    });
    estimates.push(estimate);
  }

  // 7. Review 10건 생성 (각 estimate별 1:1)
  const reviews: Review[] = [];
  for (let i = 0; i < 10; i++) {
    const review: Review = await prisma.review.create({
      data: {
        rating: 5 - (i % 3),
        content: `정말 만족스러운 이사였습니다! 리뷰 ${i + 1}`,
        clientId: clients[i].id,
        moverId: movers[i].id,
        estimateId: estimates[i].id,
      },
    });
    reviews.push(review);
  }

  // 8. Notification 10건 생성
  const notifications: Notification[] = [];
  for (let i = 0; i < 10; i++) {
    const notification: Notification = await prisma.notification.create({
      data: {
        clientId: clients[i].id,
        moverId: movers[i].id,
        content: `새로운 견적이 도착했습니다. 알림 ${i + 1}`,
        isRead: false,
        type: NotificationType.NEW_ESTIMATE,
      },
    });
    notifications.push(notification);
  }

  // 9. Favorite 10건 생성 (client, mover 1:1)
  const favorites: Favorite[] = [];
  for (let i = 0; i < 10; i++) {
    const favorite: Favorite = await prisma.favorite.create({
      data: {
        clientId: clients[i].id,
        moverId: movers[i].id,
      },
    });
    favorites.push(favorite);
  }

  console.log("🌱 Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
