import { PrismaClient, MoveType, EstimateStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 기존 데이터 삭제 (견적/클라이언트 관련만)
  // await prisma.estimate.deleteMany();
  // await prisma.request.deleteMany();
  // await prisma.client.deleteMany();

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 클라이언트 생성
  const client1 = await prisma.client.create({
    data: {
      email: "client1@test.com",
      name: "김클라이언트",
      phone: "01099990001", // 기존 DB에 없는 값으로!
      hashedPassword,
      profileImage: "https://example.com/client1.jpg",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      email: "client2@test.com",
      name: "이클라이언트",
      phone: "01087654021",
      hashedPassword,
      profileImage: "https://example.com/client2.jpg",
    },
  });

  // client100~client104 수동 생성
  const client100 = await prisma.client.create({
    data: {
      email: "client100@test.com",
      name: "클라이언트100",
      phone: "01000100100",
      hashedPassword,
      profileImage: "https://example.com/client100.jpg",
    },
  });
  const client101 = await prisma.client.create({
    data: {
      email: "client101@test.com",
      name: "클라이언트101",
      phone: "01000100101",
      hashedPassword,
      profileImage: "https://example.com/client101.jpg",
    },
  });
  const client102 = await prisma.client.create({
    data: {
      email: "client102@test.com",
      name: "클라이언트102",
      phone: "01000100102",
      hashedPassword,
      profileImage: "https://example.com/client102.jpg",
    },
  });
  const client103 = await prisma.client.create({
    data: {
      email: "client103@test.com",
      name: "클라이언트103",
      phone: "01000100103",
      hashedPassword,
      profileImage: "https://example.com/client103.jpg",
    },
  });
  const client104 = await prisma.client.create({
    data: {
      email: "client104@test.com",
      name: "클라이언트104",
      phone: "01000100104",
      hashedPassword,
      profileImage: "https://example.com/client104.jpg",
    },
  });
  console.log("👥 Created clients: client1, client2, client100~client104");

  // mover100~mover104 수동 생성
  const mover100 = await prisma.mover.create({
    data: {
      email: "mover100@test.com",
      name: "박기사100",
      nickName: "박이사100",
      phone: "01010010000",
      hashedPassword,
      profileImage: "https://example.com/mover100.jpg",
      career: 5,
      introduction: "안전하고 신속한 이사 서비스 제공합니다.",
      description: "5년 경력의 전문 이사 기사입니다.",
    },
  });
  const mover101 = await prisma.mover.create({
    data: {
      email: "mover101@test.com",
      name: "박기사101",
      nickName: "박이사101",
      phone: "01010010001",
      hashedPassword,
      profileImage: "https://example.com/mover101.jpg",
      career: 4,
      introduction: "친절하고 꼼꼼한 이사 서비스",
      description: "4년 경력의 신뢰할 수 있는 기사입니다.",
    },
  });
  const mover102 = await prisma.mover.create({
    data: {
      email: "mover102@test.com",
      name: "박기사102",
      nickName: "박이사102",
      phone: "01010010002",
      hashedPassword,
      profileImage: "https://example.com/mover102.jpg",
      career: 3,
      introduction: "합리적인 가격의 이사 서비스",
      description: "3년 경력의 합리적인 기사입니다.",
    },
  });
  const mover103 = await prisma.mover.create({
    data: {
      email: "mover103@test.com",
      name: "박기사103",
      nickName: "박이사103",
      phone: "01010010003",
      hashedPassword,
      profileImage: "https://example.com/mover103.jpg",
      career: 2,
      introduction: "빠르고 정확한 이사 서비스",
      description: "2년 경력의 빠른 기사입니다.",
    },
  });
  const mover104 = await prisma.mover.create({
    data: {
      email: "mover104@test.com",
      name: "박기사104",
      nickName: "박이사104",
      phone: "01010010004",
      hashedPassword,
      profileImage: "https://example.com/mover104.jpg",
      career: 1,
      introduction: "신입이지만 열정 가득한 기사입니다.",
      description: "1년 경력의 신입 기사입니다.",
    },
  });
  console.log("🚚 Created movers: mover100~mover104");

  // 견적 요청 생성 (예시)
  const request1 = await prisma.request.create({
    data: {
      clientId: client1.id,
      moveType: MoveType.SMALL,
      moveDate: new Date("2025-01-15"),
      fromAddress: "서울특별시 강남구 테헤란로 123",
      toAddress: "서울특별시 서초구 강남대로 456",
      isPending: true,
    },
  });

  const request2 = await prisma.request.create({
    data: {
      clientId: client2.id,
      moveType: MoveType.HOME,
      moveDate: new Date("2025-01-20"),
      fromAddress: "서울특별시 마포구 와우산로 123",
      toAddress: "서울특별시 성동구 왕십리로 456",
      isPending: true,
    },
  });

  const request3 = await prisma.request.create({
    data: {
      clientId: client100.id,
      moveType: MoveType.OFFICE,
      moveDate: new Date("2025-01-25"),
      fromAddress: "서울특별시 종로구 종로 123",
      toAddress: "서울특별시 중구 을지로 456",
      isPending: true,
    },
  });

  console.log("📋 Created requests");

  // 견적 생성 (예시)
  const estimate1 = await prisma.estimate.create({
    data: {
      clientId: client1.id,
      moverId: mover100.id,
      requestId: request1.id,
      price: 50000,
      moverStatus: EstimateStatus.CONFIRMED,
      isClientConfirmed: false,
      comment: "안전하고 신속하게 이사해드리겠습니다. 5만원에 진행하겠습니다.",
    },
  });

  const estimate2 = await prisma.estimate.create({
    data: {
      clientId: client2.id,
      moverId: mover101.id,
      requestId: request2.id,
      price: 45000,
      moverStatus: EstimateStatus.CONFIRMED,
      isClientConfirmed: false,
      comment: "4만 5천원에 친절하게 이사해드리겠습니다.",
    },
  });

  const estimate3 = await prisma.estimate.create({
    data: {
      clientId: client100.id,
      moverId: mover102.id,
      requestId: request3.id,
      price: 80000,
      moverStatus: EstimateStatus.CONFIRMED,
      isClientConfirmed: false,
      comment: "가정 이사는 8만원에 진행하겠습니다.",
    },
  });

  console.log("💰 Created estimates");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
