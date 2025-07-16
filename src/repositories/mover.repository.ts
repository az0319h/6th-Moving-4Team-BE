// repositories/mover.repository.ts (백엔드 페이지네이션 지원)
import prisma from "../configs/prisma.config";
import { NotFoundError, ServerError } from "../types/errors";
import { SimplifiedMover, MoverDetail } from "../types/mover/mover.type";

interface GetMoversParams {
  page?: number;
  limit?: number;
  search?: string;
  area?: string;
  serviceType?: string;
  sortBy?: string;
}

interface GetMoversResponse {
  movers: SimplifiedMover[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 전체 기사님 리스트 조회 (페이지네이션 지원)
async function fetchMovers(clientId?: string, params: GetMoversParams = {}): Promise<GetMoversResponse> {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      area,
      serviceType,
      sortBy = 'mostReviewed'
    } = params;

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const whereCondition: any = {};

    if (search) {
      whereCondition.OR = [
        { nickName: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (area && area !== 'all') {
      whereCondition.serviceArea = {
        some: {
          regionName: { contains: area, mode: 'insensitive' }
        }
      };
    }

    if (serviceType && serviceType !== 'all') {
      whereCondition.serviceType = {
        has: serviceType
      };
    }

    // 정렬 조건 구성
    let orderBy: any = { createdAt: "desc" };
    
    switch (sortBy) {
      case 'mostReviewed':
        orderBy = { reviewCount: 'desc' };
        break;
      case 'highRating':
        orderBy = { averageReviewRating: 'desc' };
        break;
      case 'highExperience':
        orderBy = { career: 'desc' };
        break;
      case 'mostBooked':
        orderBy = { estimateCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // 전체 개수 조회
    const total = await prisma.mover.count({ where: whereCondition });

    // 데이터 조회
    const movers = await prisma.mover.findMany({
      where: whereCondition,
      include: {
        favorites: clientId ? { where: { clientId }, select: { id: true } } : false,
      },
      orderBy,
      skip,
      take: limit,
    });

    const simplifiedMovers: SimplifiedMover[] = movers.map((mover) => ({
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

    const hasMore = skip + limit < total;

    return {
      movers: simplifiedMovers,
      total,
      page,
      limit,
      hasMore,
    };
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

// 찜 상태 조회
export async function findFavorite(clientId: string, moverId: string) {
  return prisma.favorite.findUnique({
    where: {
      clientId_moverId: {
        clientId,
        moverId,
      },
    },
  });
}

// 찜 추가
export async function addFavoriteMover(clientId: string, moverId: string) {
  return prisma.favorite.create({
    data: { clientId, moverId },
  });
}

// 찜 삭제
export async function removeFavoriteMover(clientId: string, moverId: string) {
  return prisma.favorite.delete({
    where: {
      clientId_moverId: {
        clientId,
        moverId,
      },
    },
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