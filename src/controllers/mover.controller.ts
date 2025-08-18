import moverService from "../services/mover.service";
import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../types";

// async function getMovers(req: Request, res: Response, next: NextFunction) {
//   try {
//     const {
//       page = "1",
//       limit = "10",
//       search,
//       area,
//       serviceType,
//       sortBy = "mostReviewed",
//       latitude,
//       longitude,
//       radius = "10",
//     } = req.query;

//     const targetLang = typeof req.query.targetLang === "string" ? req.query.targetLang : undefined;

//     const params = {
//       page: parseInt(page as string, 10),
//       limit: parseInt(limit as string, 10),
//       search: search as string,
//       area: area as string,
//       serviceType: serviceType as string,
//       sortBy: sortBy as string,
//       // 위치 기반 검색 파라미터 처리
//       latitude: latitude ? parseFloat(latitude as string) : undefined,
//       longitude: longitude ? parseFloat(longitude as string) : undefined,
//       radius: parseInt(radius as string, 10),
//     };

//     const result = await moverService.getMovers(req.auth?.userId, params, targetLang);

//     res.status(200).json(result);
//   } catch (error) {
//     console.error("❌❌❌ getMovers 에러 발생 ❌❌❌");

//     // TypeScript 안전한 에러 처리
//     if (error instanceof Error) {
//       console.error("에러 타입:", error.constructor.name);
//       console.error("에러 메시지:", error.message);
//       console.error("에러 스택:", error.stack);
//     } else {
//       console.error("알 수 없는 에러:", error);
//     }

//     // Prisma 에러인 경우 (any로 타입 단언)
//     const prismaError = error as any;
//     if (prismaError?.code) {
//       console.error("Prisma 에러 코드:", prismaError.code);
//       console.error("Prisma 메타:", prismaError.meta);
//     }

//     next(error);
//   }
// }

// async function getMoverDetail(req: Request, res: Response, next: NextFunction) {
//   try {
//     const targetLang = typeof req.query.targetLang === "string" ? req.query.targetLang : undefined;
//     const result = await moverService.getMoverDetail(
//       req.params.moverId,
//       req.auth?.userId,
//       targetLang,
//     );
//     res.status(200).json(result);
//   } catch (error) {
//     console.error("❌ getMoverDetail 에러:", error);
//     next(error);
//   }
// }

// 새로운 토글 엔드포인트
async function toggleFavoriteMover(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await moverService.toggleFavoriteMover(req.auth!.userId, req.params.moverId);

    const message = result.action === "added" ? "찜 추가 성공" : "찜 해제 성공";

    res.status(200).json({
      message,
      action: result.action,
      isFavorite: result.isFavorite,
      favoriteCount: result.favoriteCount,
    });
  } catch (error) {
    console.error("❌ 찜 토글 오류:", error);
    next(error);
  }
}

// 기사님 본인 프로필 조회
// async function getMoverProfile(req: Request, res: Response, next: NextFunction) {
//   try {
//     // userType 체크
//     if (req.auth?.userType !== "mover") {
//       throw new ForbiddenError("기사 계정만 접근 가능합니다.");
//     }

//     const moverId = req.auth!.userId;
//     const targetLang = typeof req.query.targetLang === "string" ? req.query.targetLang : undefined;
//     const result = await moverService.getMoverProfile(moverId, targetLang);

//     res.status(200).json({
//       message: "기사님 프로필 조회 성공",
//       data: result,
//     });
//   } catch (error) {
//     console.error("❌ getMoverProfile 에러:", error);
//     next(error);
//   }
// }

export default {
  // getMovers,
  // getMoverDetail,
  toggleFavoriteMover,
  // getMoverProfile,
};
