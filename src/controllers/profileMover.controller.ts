import { ErrorMessage } from "../constants/ErrorMessage";
import { MoverProfileDto } from "../dtos/mover.dto";
import profileMoverService from "../services/profileMover.service";
import { NotFoundError } from "../types";
import { filterSensitiveUserData } from "../utils/auth.util";
import { NextFunction, Request, Response } from "express";

// 기사님 프로필 수정
// async function moverPatchProfile(
//   req: Request<{}, {}, MoverProfileDto>,
//   res: Response,
//   next: NextFunction,
// ) {
//   try {
//     const { userId } = req.auth!;

//     console.log("=== 백엔드 컨트롤러 DEBUG ===");
//     console.log("요청 본문:", req.body);
//     console.log("위치 정보 확인:", {
//       latitude: req.body.latitude,
//       longitude: req.body.longitude,
//       businessAddress: req.body.businessAddress,
//       타입확인: {
//         latitude: typeof req.body.latitude,
//         longitude: typeof req.body.longitude,
//         businessAddress: typeof req.body.businessAddress,
//       },
//     });

//     // 위치 정보 숫자 변환 (문자열로 전송될 수 있음)
//     const profileData = {
//       ...req.body,
//       latitude: req.body.latitude !== undefined ? Number(req.body.latitude) : undefined,
//       longitude: req.body.longitude !== undefined ? Number(req.body.longitude) : undefined,
//     };

//     console.log("변환된 프로필 데이터:", {
//       ...profileData,
//       // 민감한 정보는 로그에서 제외하고 위치 정보만 확인
//       latitude: profileData.latitude,
//       longitude: profileData.longitude,
//       businessAddress: profileData.businessAddress,
//     });

//     const updatedMoverProfile = await profileMoverService.modifyMoverProfile({
//       ...profileData,
//       userId,
//     });

//     if (!updatedMoverProfile) {
//       throw new NotFoundError(ErrorMessage.PROFILE_NOT_FOUND);
//     }

//     const { accessToken, refreshToken, ...rest } = updatedMoverProfile;

//     const filteredMoverProfile = filterSensitiveUserData(rest);

//     console.log("=== 응답 데이터 확인 ===");
//     console.log("응답 위치 정보:", {
//       latitude: filteredMoverProfile.latitude,
//       longitude: filteredMoverProfile.longitude,
//       businessAddress: filteredMoverProfile.businessAddress,
//     });

//     res.status(200).json({ ...filteredMoverProfile, accessToken, refreshToken });
//   } catch (error) {
//     console.error("❌ moverPatchProfile 에러:", error);
//     next(error);
//   }
// }

export default {
  // moverPatchProfile,
};
