import profileMoverRespository from "../repositories/profileMover.repository";
import { MoverProfile } from "../types";
import { generateAccessToken, generateRefreshToken } from "../utils/token.util";
import { MoveType, Prisma } from "@prisma/client";

// 기사님 프로필 생성과 수정
// async function modifyMoverProfile(user: MoverProfile) {
//   // 업데이트할 데이터 목록
//   const updateData: Prisma.MoverUpdateInput = {
//     profileImage: user.image,
//     nickName: user.nickName,
//     career: user.career,
//     introduction: user.introduction,
//     description: user.description,
//     isProfileCompleted: true,
//   };

//   // latitude와 longitude가 모두 제공된 경우에만 위치 정보 업데이트
//   if (user.latitude !== undefined && user.longitude !== undefined) {
//     updateData.latitude = user.latitude;
//     updateData.longitude = user.longitude;
//     updateData.businessAddress = user.businessAddress || null;
//   } else if (user.latitude !== undefined || user.longitude !== undefined) {
//     // 하나만 제공된 경우 둘 다 null로 설정 (일관성 유지)
//     updateData.latitude = null;
//     updateData.longitude = null;
//     updateData.businessAddress = null;
//   } else {
//     console.log(" 위치 정보가 제공되지 않음 - 기존 값 유지");
//   }

//   // businessAddress만 단독으로 제공된 경우 처리
//   if (
//     user.businessAddress !== undefined &&
//     user.latitude === undefined &&
//     user.longitude === undefined
//   ) {
//     updateData.businessAddress = user.businessAddress;
//   }

//   // 서비스 종류
//   if (user.serviceType && user.serviceType.length > 0) {
//     updateData.serviceType = {
//       set: user.serviceType as MoveType[],
//     };
//   }

//   // 서비스 지역
//   if (user.serviceArea && user.serviceArea.length > 0) {
//     const matchedRegions = await profileMoverRespository.findRegionByLabel(user);

//     updateData.serviceArea = {
//       set: matchedRegions.map((region) => ({ id: region.id })),
//     };
//   }

//   // mover 정보 조회를 profileMoverRepository로 변경
//   const mover = await profileMoverRespository.findById(user.userId);

//   if (!mover || !mover.id || !mover.email) {
//     throw new Error("필수 사용자 정보를 찾을 수 없습니다.");
//   }

//   // 프로필 등록 시 토큰 재발급
//   const accessToken = generateAccessToken({
//     userId: mover.id,
//     email: mover.email,
//     name: mover.name || null, // null 허용
//     userType: "mover",
//     isProfileCompleted: true,
//   });
//   const refreshToken = generateRefreshToken({
//     userId: mover.id,
//     email: mover.email,
//     name: mover.name || null, // null 허용
//     userType: "mover",
//     isProfileCompleted: true,
//   });

//   const updatedMover = await profileMoverRespository.modifyMoverProfile(user, updateData);

//   return { ...updatedMover, accessToken, refreshToken };
// }

export default {
  // modifyMoverProfile,
};
