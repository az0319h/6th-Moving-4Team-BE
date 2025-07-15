import { Client } from "@prisma/client";
import { ClientProfileRegister } from "../types";
import profileClientRepository from "../repositories/profileClient.repository";

import { ConflictError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";

async function create(userId: Client["id"], user: ClientProfileRegister) {
  // 기존 프로필 등록했는지 확인 + 사용자 식별
  const existingProfile = await profileClientRepository.findById(userId);

  // 이미 등록했으면 오류
  const isRegistered =
    existingProfile?.profileImage != null ||
    (existingProfile?.serviceType && existingProfile.serviceType.length > 0) ||
    (existingProfile?.livingArea && existingProfile.livingArea.length > 0);

  if (isRegistered) throw new ConflictError(ErrorMessage.ALREADY_EXIST_PROFILE);

  // 반환
  const newProfile = await profileClientRepository.create(userId, user);

  return { newProfile, userType: "client", profileCompleted: true };
}

const profileClientService = {
  create,
};

export default profileClientService;
