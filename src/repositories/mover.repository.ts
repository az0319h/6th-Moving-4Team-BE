import prisma from "../configs/prisma.config";
import { NotFoundError, ServerError } from "../types/errors";
import { SimplifiedMover, MoverDetail } from "../types/mover/mover.type";

// 전체 기사님 리스트 조회
async function fetchMovers(clientId?: string): Promise<SimplifiedMover[]> {
  try {
    const movers = await prisma.mover.findMany({
      include: {
        favorites: clientId ? { where: { clientId }, select: { id: true } } : false,
      },
      orderBy: { createdAt: "desc" },
    });

    return movers.map((mover) => ({
      id: mover.id,
      nickName: mover.nickName,
      serviceType: mover.serviceType,
      career: mover.career,
      averageReviewRating: mover.averageReviewRating,
      reviewCount: mover.reviewCount,
      estimateCount: mover.estimateCount,
      profileImage: mover.profileImage,
      isFavorite: mover.favorites?.length > 0,
    }));
  } catch (error) {
    throw new ServerError("기사님 리스트 조회 중 오류 발생", error);
  }
}

// 기사님 상세 조회
async function fetchMoverDetail(moverId: string, clientId?: string): Promise<MoverDetail> {
  try {
    const mover = await prisma.mover.findUnique({
      where: { id: moverId },
      include: {
        favorites: clientId ? { where: { clientId }, select: { id: true } } : false,
        serviceArea: true,
      },
    });

    if (!mover) throw new NotFoundError("기사님을 찾을 수 없습니다.");

    return {
      id: mover.id,
      nickName: mover.nickName,
      name: mover.name,
      phone: mover.phone,
      profileImage: mover.profileImage,
      career: mover.career,
      serviceType: mover.serviceType,
      serviceArea: mover.serviceArea.map((r) => r.regionName),
      description: mover.description,
      averageReviewRating: mover.averageReviewRating,
      reviewCount: mover.reviewCount,
      estimateCount: mover.estimateCount,
      isFavorite: mover.favorites?.length > 0,
    };
  } catch (error) {
    throw new ServerError("기사님 상세 조회 중 오류 발생", error);
  }
}

// 찜 추가
async function addFavoriteMover(clientId: string, moverId: string) {
  return prisma.favorite.create({
    data: { clientId, moverId },
  });
}

// 찜 삭제
async function removeFavoriteMover(clientId: string, moverId: string) {
  return prisma.favorite.deleteMany({
    where: { clientId, moverId },
  });
}

// 지정
async function designateMover(requestId: string, moverId: string) {
  return await prisma.$transaction([
    prisma.request.update({
      where: { id: requestId },
      data: { isPending: false },
    }),
    prisma.designatedRequest.update({
      where: { requestId_moverId: { requestId, moverId } },
      data: { moverId },
    }),
  ]);
}

export default {
  fetchMovers,
  fetchMoverDetail,
  addFavoriteMover,
  removeFavoriteMover,
  designateMover,
};
