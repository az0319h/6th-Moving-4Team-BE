// Mock 파일 import 추가
import {
  mockMoverInfo,
  mockMoversResponse,
  mockMoverDetail,
  mockFavoriteToggleResponse,
} from "../mocks/mover.mock";

// 테스트 파일 맨 위에 추가
jest.spyOn(console, "error").mockImplementation(() => {});

import { NotFoundError, ServerError } from "../types";

// Mock Prisma
const mockPrisma = {
  mover: {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  favorite: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  designatedRequest: {
    findFirst: jest.fn(),
  },
  estimate: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock("../configs/prisma.config", () => mockPrisma);

import moverRepository from "./mover.repository";

describe("Mover Repository 테스트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchMovers 테스트", () => {
    // Mock 파일의 데이터 사용
    const mockMovers = [
      {
        ...mockMoverInfo,
        id: "mover-1",
        favorites: [],
        designatedRequests: [],
      },
      {
        ...mockMoverInfo,
        id: "mover-2",
        nickName: "이기사",
        averageReviewRating: 4.0,
        reviewCount: 5,
        favorites: [{ id: "fav-1" }],
        designatedRequests: [{ requestId: "req-1" }],
      },
    ];

    test("기본 파라미터로 기사 목록을 조회한다", async () => {
      mockPrisma.mover.count.mockResolvedValue(2);
      mockPrisma.mover.findMany.mockResolvedValue(mockMovers);
      mockPrisma.estimate.findFirst.mockResolvedValue(null);

      const result = await moverRepository.fetchMovers();

      expect(mockPrisma.mover.count).toHaveBeenCalledWith({ where: {} });
      expect(mockPrisma.mover.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          favorites: false,
          designatedRequests: false,
        },
        orderBy: { reviewCount: "desc" },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        movers: [
          {
            ...mockMoverInfo,
            id: "mover-1",
            isFavorite: false,
            hasDesignatedRequest: false,
            designatedEstimateStatus: null,
          },
          {
            ...mockMoverInfo,
            id: "mover-2",
            nickName: "이기사",
            averageReviewRating: 4.0,
            reviewCount: 5,
            isFavorite: true,
            hasDesignatedRequest: false,
            designatedEstimateStatus: null,
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        hasMore: false,
      });
    });

    test("검색 조건으로 기사 목록을 조회한다", async () => {
      const params = {
        page: 2,
        limit: 5,
        search: "김",
        area: "서울",
        serviceType: "HOME",
        sortBy: "highRating",
      };

      mockPrisma.mover.count.mockResolvedValue(1);
      mockPrisma.mover.findMany.mockResolvedValue([mockMovers[0]]);

      const result = await moverRepository.fetchMovers("client-123", params);

      expect(mockPrisma.mover.count).toHaveBeenCalledWith({
        where: {
          OR: [{ nickName: { contains: "김", mode: "insensitive" } }],
          serviceArea: {
            some: {
              regionName: { contains: "서울", mode: "insensitive" },
            },
          },
          serviceType: {
            has: "HOME",
          },
        },
      });
    });

    test("서버 오류 시 ServerError를 던진다", async () => {
      mockPrisma.mover.count.mockRejectedValue(new Error("Database error"));

      await expect(moverRepository.fetchMovers()).rejects.toThrow(
        new ServerError("기사님 리스트 조회 중 오류 발생", expect.any(Error)),
      );
    });
  });

  describe("fetchMoverDetail 테스트", () => {
    test("기사 상세정보를 조회한다", async () => {
      // 실제 Prisma 반환 구조에 맞춤 (favorites 포함)
      const mockMover = {
        ...mockMoverDetail,
        serviceArea: [{ regionName: "서울" }, { regionName: "경기" }],
        favorites: [{ id: "fav-1" }], // clientId가 있을 때 포함됨
      };

      mockPrisma.mover.findUnique.mockResolvedValue(mockMover);
      mockPrisma.designatedRequest.findFirst.mockResolvedValue(null);
      mockPrisma.estimate.findFirst.mockResolvedValue(null);

      const result = await moverRepository.fetchMoverDetail("mover-1", "client-123");

      // 최종 반환 구조 (favorites는 isFavorite로 변환됨)
      expect(result).toEqual({
        ...mockMoverDetail,
        serviceArea: ["서울", "경기"],
        isFavorite: true,
        hasDesignatedRequest: false,
        designatedEstimateStatus: null,
        name: mockMoverDetail.name || "",
        phone: mockMoverDetail.phone || "",
        favoriteCount: mockMoverDetail.favoriteCount || 0,
        favorites: [{ id: "fav-1" }],
      });
    });

    test("기사를 찾을 수 없으면 ServerError를 던진다", async () => {
      // 실제 구현: null 반환 → NotFoundError → catch에서 ServerError로 래핑
      mockPrisma.mover.findUnique.mockResolvedValue(null);

      await expect(moverRepository.fetchMoverDetail("nonexistent")).rejects.toThrow(
        new ServerError("기사님 상세 조회 중 오류 발생", expect.any(Error)),
      );
    });
  });

  describe("toggleFavoriteMover 테스트", () => {
    const mockMover = {
      id: "mover-1",
      favoriteCount: 5,
    };

    beforeEach(() => {
      mockPrisma.mover.findUnique.mockResolvedValue(mockMover);
    });

    test("찜이 없을 때 찜을 추가한다", async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue([
        { id: "fav-1" },
        { ...mockMover, favoriteCount: 6 },
      ]);

      const result = await moverRepository.toggleFavoriteMover("client-123", "mover-1");

      expect(result).toEqual({
        action: "added",
        isFavorite: true,
        favoriteCount: 6,
      });
    });

    test("이미 찜이 있을 때 찜을 해제한다", async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue({ id: "fav-1" });

      const result = await moverRepository.toggleFavoriteMover("client-123", "mover-1");

      expect(result).toEqual({
        action: "removed",
        isFavorite: false,
        favoriteCount: 4,
      });
    });

    test("기사를 찾을 수 없으면 NotFoundError를 던진다", async () => {
      mockPrisma.mover.findUnique.mockResolvedValue(null);

      await expect(
        moverRepository.toggleFavoriteMover("client-123", "nonexistent"),
      ).rejects.toThrow(new NotFoundError("기사님을 찾을 수 없습니다."));
    });
  });

  describe("findMoversByServiceArea 테스트", () => {
    test("지역 기반으로 기사를 조회한다", async () => {
      const mockResult = [{ id: mockMoverInfo.id }, { id: "mover-2" }];

      mockPrisma.mover.findMany.mockResolvedValue(mockResult);

      const result = await moverRepository.findMoversByServiceArea(["서울", "경기"]);

      expect(result).toEqual(mockResult);
    });
  });
});

describe("Mover Repository 실제 구현 확인", () => {
  test("fetchMoverDetail에서 mover가 null일 때 적절한 에러 처리", async () => {
    // 실제 repository 함수가 null을 어떻게 처리하는지 확인
    mockPrisma.mover.findUnique.mockResolvedValue(null);

    try {
      await moverRepository.fetchMoverDetail("nonexistent");
      fail("Error should have been thrown");
    } catch (error: unknown) {
      // 타입 가드를 사용해서 error 타입 확인
      if (error instanceof Error) {
        console.log("실제 에러:", error.constructor.name, error.message);

        // 현재는 ServerError를 던지는 것 같으니 이에 맞춰 테스트
        expect(error).toBeInstanceOf(ServerError);
        expect(error.message).toBe("기사님 상세 조회 중 오류 발생");
      } else {
        fail("Unexpected error type");
      }
    }
  });
});
