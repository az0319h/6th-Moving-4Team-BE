import prisma from "../configs/prisma.config";
import { ClientProfileRegister } from "../types";
import { Client, MoveType } from "@prisma/client";

// ✅ 사용자 반환 (id로)
async function findById(id: Client["id"]) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      livingArea: true,
    },
  });
}

// ✅ 프로필 생성
async function create(userId: Client["id"], profile: ClientProfileRegister) {
  try {
    //serviceType에 [user.serviceType]가 안 먹혀서 돌려씀
    const serviceTypes: MoveType[] | undefined = profile.serviceType
      ? profile.serviceType.map((type) => MoveType[type as keyof typeof MoveType])
      : undefined;

    // Client 반환
    const newProfile = await prisma.client.update({
      where: { id: userId }, // 조건: 로그인한 사용자

      data: {
        profileImage: profile.profileImage,
        serviceType: serviceTypes,
        livingArea: profile.livingArea
          ? {
              connect: profile.livingArea.map((regionId) => ({ id: regionId })),
            }
          : undefined,
      },
    });

    return { newProfile, userType: "client", profileCompleted: true };
  } catch (error) {
    console.error("일반 프로필 등록 시 오류 발생", error);
  }
}

const profileClientRepository = {
  findById,
  create,
};

export default profileClientRepository;
