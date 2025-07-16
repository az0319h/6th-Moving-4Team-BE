import { Request, Response, NextFunction } from "express";
import { clientProfileSchema, ProfilePostDto } from "../dtos/profileClient.dto";
import profileClientService from "../services/profileClient.service";
import { MoveType } from "@prisma/client";

async function post(req: Request<{}, {}, ProfilePostDto>, res: Response, next: NextFunction) {
  try {
    const { userId } = req.auth!;

    // living area 빈 배열 undefined 타입 오류 방지
    const parsedData = clientProfileSchema.parse(req.body);

    const profile = {
      profileImage: parsedData.profileImage,
      serviceType: parsedData.serviceType as MoveType[], // 타입 캐스팅
      livingArea: parsedData.livingArea,
    };

    await profileClientService.create(userId, profile);

    res.status(201).json({ message: "일반 프로필 등록 성공", data: parsedData });
  } catch (error) {
    next(error);
  }
}

const profileClientController = {
  post,
};

export default profileClientController;
