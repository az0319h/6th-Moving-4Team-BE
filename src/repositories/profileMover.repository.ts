import prisma from "../configs/prisma.config";
import { ErrorMessage } from "../constants/ErrorMessage";
import { BadRequestError, MoverProfile } from "../types";
import { Mover, Prisma } from "@prisma/client";

// 기사님 찾기
async function findById(id: Mover["id"]) {
  const mover = await prisma.mover.findUnique({
    where: { id },
    include: {
      serviceArea: true,
    },
  });

  return { ...mover, userType: "mover" };
}

// 지역 라벨 > 지역 아이디 찾기 (관계형이라서 string > id로 변환해줘야함)
// TODO: 지역 레포단을 만들 필요는 없을 것 같아서 우선 프로필 레포에 작성함
async function findRegionByLabel(user: MoverProfile) {
  const regions = await prisma.region.findMany({
    where: {
      regionName: {
        in: user.serviceArea,
      },
    },
  });
  return regions;
}

// 기사님 프로필 생성/수정
// async function modifyMoverProfile(user: MoverProfile, updateData: Prisma.MoverUpdateInput) {
//   try {
//     const modifiedMoverProfile = await prisma.mover.update({
//       where: { id: user.userId },
//       data: updateData,
//       include: {
//         serviceArea: true,
//       },
//     });

//     // 업데이트 후 다시 조회해서 확인
//     const verification = await prisma.mover.findUnique({
//       where: { id: user.userId },
//       select: {
//         id: true,
//         latitude: true,
//         longitude: true,
//         businessAddress: true,
//       },
//     });

//     return { ...modifiedMoverProfile, userType: "mover" }; // userType은 FE의 header에서 필요
//   } catch (error) {
//     console.error("❌ 데이터베이스 업데이트 에러:", error);

//     // Prisma 에러 상세 정보 출력
//     if (error && typeof error === "object" && "code" in error) {
//       console.error("Prisma 에러 코드:", (error as any).code);
//       console.error("Prisma 에러 메타:", (error as any).meta);
//     }

//     throw new BadRequestError(ErrorMessage.BAD_REQUEST, error);
//   }
// }

export default {
  findById,
  findRegionByLabel,
  // modifyMoverProfile,
};
