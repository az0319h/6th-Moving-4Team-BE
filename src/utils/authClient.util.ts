import { Client } from "@prisma/client";
import authClientRepository from "../repositories/authClient.repository";
import { ClientProfileRegister } from "../types";

// ✅ 프로필 생성 유효성 검사
export async function validateProfileCreationData(
  userId: Client["id"],
  profile: ClientProfileRegister,
) {
  const existingProfile = await authClientRepository.findById(userId);
}
