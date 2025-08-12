import reviewService from "./review.service";
import reviewRepository from "../repositories/review.repository";
import estimateRepository from "../repositories/estimate.repository";
import prisma from "../configs/prisma.config";
import { BadRequestError, ForbiddenError, NotFoundError, ValidationError } from "../types";
import { MoveType, Review } from "@prisma/client";

// reviewRepository 모킹
jest.mock("../repositories/review.repository");
const mockedReviewRepository = reviewRepository as jest.Mocked<typeof reviewRepository>;

// estimateRepository 모킹
jest.mock("../repositories/estimate.repository");
const mockedEstimateRepository = estimateRepository as jest.Mocked<typeof estimateRepository>;

// prisma 트랜잭션 모킹
jest.mock("../configs/prisma.config", () => ({
  $transaction: jest.fn(),
}));
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe("reviewService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMyReviews", () => {
    test("내가 작성한 리뷰 목록과 페이지네이션 정보를 정상 반환해야 한다", async () => {
      // Setup
      const clientId = "client-uuid";
      const page = 1;
      const limit = 6;
      const offset = 0;
      const mockReviews = [
        {
          id: "review1",
          rating: 5,
          content: "Great",
          createdAt: new Date(),
          moverId: "mover1",
          mover: { nickName: "Nick", profileImage: "url" },
          estimate: {
            price: 10000,
            request: {
              moveType: MoveType.HOME,
              moveDate: new Date(),
              designatedRequests: [{ moverId: "mover1" }],
            },
          },
        },
      ];
      const total = 10;

      mockedReviewRepository.findReviewsByClientId.mockResolvedValue({
        reviews: mockReviews,
        total,
      });

      // Exercise
      const result = await reviewService.getMyReviews(clientId, page, limit);

      // Assertion
      expect(mockedReviewRepository.findReviewsByClientId).toHaveBeenCalledWith(
        clientId,
        offset,
        limit,
      );
      expect(result.total).toBe(total);
      expect(result.reviews[0]).toHaveProperty("id", "review1");
      expect(result.pagination).toEqual({
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    });

    test("page와 limit이 1 미만이면 기본값으로 보정된다", async () => {
      // Setup
      mockedReviewRepository.findReviewsByClientId.mockResolvedValue({ reviews: [], total: 0 });

      // Exercise
      const result = await reviewService.getMyReviews("clientId", 0, 0);

      // Assertion
      expect(mockedReviewRepository.findReviewsByClientId).toHaveBeenCalledWith("clientId", 0, 6);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(6);
    });
  });

  describe("createReview", () => {
    test("정상 케이스: 리뷰를 생성하고 mover 리뷰 통계가 업데이트 된다", async () => {
      // Setup
      const dto = {
        estimateId: "estimate1",
        rating: 5,
        content: "Excellent service",
      };
      const clientId = "client-uuid";

      mockedEstimateRepository.getEstimateMoverId.mockResolvedValue({ moverId: "mover-uuid" });
      mockedReviewRepository.findReviewByEstimateId.mockResolvedValue(null);

      const createdReview = { id: "review1", ...dto } as Review;
      const mockTransactionCallback = jest.fn(async (tx) => createdReview);

      (mockedPrisma.$transaction as jest.Mock).mockImplementation(mockTransactionCallback);

      // Exercise
      const result = await reviewService.createReview(dto, clientId);

      // Assertion
      expect(mockedEstimateRepository.getEstimateMoverId).toHaveBeenCalledWith(dto.estimateId);
      expect(mockedReviewRepository.findReviewByEstimateId).toHaveBeenCalledWith(dto.estimateId);
      expect(mockedPrisma.$transaction).toHaveBeenCalled();
      expect(result).toBe(createdReview);
    });

    test("견적이 존재하지 않으면 BadRequestError가 발생한다", async () => {
      // Setup
      mockedEstimateRepository.getEstimateMoverId.mockResolvedValue(null);

      // Exercise & Assertion
      await expect(
        reviewService.createReview({ estimateId: "nonexist", rating: 5, content: "A" }, "client1"),
      ).rejects.toThrow(BadRequestError);
    });

    test("이미 리뷰가 있으면 ValidationError가 발생한다", async () => {
      // Setup
      mockedEstimateRepository.getEstimateMoverId.mockResolvedValue({ moverId: "mover1" });
      mockedReviewRepository.findReviewByEstimateId.mockResolvedValue({
        id: "reviewExist",
      } as Review);

      // Exercise & Assertion
      await expect(
        reviewService.createReview({ estimateId: "exist", rating: 4, content: "B" }, "client1"),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("updateReview", () => {
    test("리뷰가 존재하고 클라이언트 권한이 있으면 정상 수정한다", async () => {
      // Setup
      const reviewId = "review1";
      const clientId = "client1";
      const data = { rating: 4, content: "Updated" };

      const existingReview = { id: reviewId, clientId, moverId: "mover1" } as Review;
      mockedReviewRepository.findReviewById.mockResolvedValue(existingReview);
      (mockedPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => fn({}));

      const updatedReview = { ...existingReview, ...data };
      mockedReviewRepository.updateReviewTx.mockResolvedValue(updatedReview);

      // Exercise
      const result = await reviewService.updateReview(reviewId, clientId, data);

      // Assertion
      expect(mockedReviewRepository.findReviewById).toHaveBeenCalledWith(reviewId);
      expect(mockedPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(updatedReview);
    });

    test("리뷰가 없으면 NotFoundError가 발생한다", async () => {
      // Setup
      mockedReviewRepository.findReviewById.mockResolvedValue(null);

      // Exercise & Assertion
      await expect(reviewService.updateReview("nonexist", "client1", {})).rejects.toThrow(
        NotFoundError,
      );
    });

    test("clientId가 다르면 ForbiddenError가 발생한다", async () => {
      // Setup
      const review = { id: "r1", clientId: "otherClient", moverId: "mover1" } as Review;
      mockedReviewRepository.findReviewById.mockResolvedValue(review);

      // Exercise & Assertion
      await expect(reviewService.updateReview("r1", "client1", {})).rejects.toThrow(ForbiddenError);
    });

    test("reviewId 없이 호출하면 BadRequestError가 발생한다", async () => {
      // Exercise & Assertion
      // @ts-expect-error
      await expect(reviewService.updateReview(null, "client1", {})).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  describe("deleteReview", () => {
    test("리뷰 존재 및 권한 확인 후 성공적으로 삭제 처리", async () => {
      // Setup
      const reviewId = "review1";
      const clientId = "client1";
      const existingReview = { id: reviewId, clientId, moverId: "mover1" } as Review;
      mockedReviewRepository.findReviewById.mockResolvedValue(existingReview);
      (mockedPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => fn({}));

      mockedReviewRepository.deleteReviewTx.mockResolvedValue({
        id: reviewId,
        createdAt: new Date(),
        rating: 5,
        content: "Some content",
        clientId: "client1",
        moverId: "mover1",
        estimateId: "estimate1",
      });

      // Exercise
      await reviewService.deleteReview(reviewId, clientId);

      // Assertion
      expect(mockedReviewRepository.findReviewById).toHaveBeenCalledWith(reviewId);
      expect(mockedPrisma.$transaction).toHaveBeenCalled();
      expect(mockedReviewRepository.deleteReviewTx).toHaveBeenCalled();
    });

    test("리뷰가 없으면 NotFoundError가 발생한다", async () => {
      // Setup
      mockedReviewRepository.findReviewById.mockResolvedValue(null);

      // Exercise & Assertion
      await expect(reviewService.deleteReview("nonexist", "client1")).rejects.toThrow(
        NotFoundError,
      );
    });

    test("권한 없으면 ForbiddenError가 발생한다", async () => {
      // Setup
      mockedReviewRepository.findReviewById.mockResolvedValue({
        id: "r1",
        clientId: "other",
        moverId: "m1",
      } as Review);

      // Exercise & Assertion
      await expect(reviewService.deleteReview("r1", "client1")).rejects.toThrow(ForbiddenError);
    });

    test("reviewId 없이 호출하면 BadRequestError가 발생한다", async () => {
      // Exercise & Assertion
      // @ts-expect-error
      await expect(reviewService.deleteReview(null, "client1")).rejects.toThrow(BadRequestError);
    });
  });

  describe("getMoverReviews", () => {
    test("기사님 리뷰 목록과 페이지네이션 정보 정상 반환", async () => {
      // Setup
      const moverId = "mover1";
      const page = 1;
      const limit = 6;
      const offset = 0;
      const mockReviews = [
        {
          id: "r1",
          rating: 5,
          content: "Nice job",
          createdAt: new Date(),
          client: { name: "ClientName" },
          estimate: {
            price: 20000,
            request: {
              moveType: MoveType.OFFICE,
              moveDate: new Date(),
              designatedRequests: [{ moverId }],
            },
          },
        },
      ];
      const total = 5;

      mockedReviewRepository.findReviewsByMoverId.mockResolvedValue({
        reviews: mockReviews,
        total,
      });

      // Exercise
      const result = await reviewService.getMoverReviews(moverId, page, limit);

      // Assertion
      expect(mockedReviewRepository.findReviewsByMoverId).toHaveBeenCalledWith(
        moverId,
        offset,
        limit,
      );
      expect(result.reviews.length).toBeGreaterThan(0);
      expect(result.pagination.totalPages).toBe(Math.ceil(total / limit));
    });

    test("page, limit이 1 미만이면 기본값으로 보정", async () => {
      // Setup
      mockedReviewRepository.findReviewsByMoverId.mockResolvedValue({ reviews: [], total: 0 });

      // Exercise
      const result = await reviewService.getMoverReviews("moverId", 0, 0);

      // Assertion
      expect(mockedReviewRepository.findReviewsByMoverId).toHaveBeenCalledWith("moverId", 0, 6);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(6);
    });
  });

  describe("getWritableReviews", () => {
    test("작성 가능한 견적 목록과 페이지네이션 정보 정상 반환", async () => {
      // Setup
      const clientId = "clientId";
      const page = 1;
      const limit = 6;
      const offset = 0;
      const mockEstimates = [
        {
          id: "est1",
          moverId: "m1",
          mover: {
            nickName: "Nick",
            profileImage: "url",
          },
          price: 10000,
          request: {
            moveType: MoveType.HOME,
            moveDate: new Date(),
            designatedRequests: [{ moverId: "m1" }],
          },
        },
      ];

      const total = 3;

      mockedEstimateRepository.findWritableEstimatesByClientId.mockResolvedValue({
        estimates: mockEstimates,
        total,
      });

      // Exercise
      const result = await reviewService.getWritableReviews(clientId, page, limit);

      // Assertion
      expect(mockedEstimateRepository.findWritableEstimatesByClientId).toHaveBeenCalledWith(
        clientId,
        offset,
        limit,
      );
      expect(result.estimates[0]).toHaveProperty("estimateId", "est1");
      expect(result.total).toBe(total);
      expect(result.pagination.totalPages).toBe(Math.ceil(total / limit));
    });

    test("page, limit이 1 미만일 때 기본값 적용", async () => {
      // Setup
      mockedEstimateRepository.findWritableEstimatesByClientId.mockResolvedValue({
        estimates: [],
        total: 0,
      });

      // Exercise
      const result = await reviewService.getWritableReviews("clientId", 0, 0);

      // Assertion
      expect(mockedEstimateRepository.findWritableEstimatesByClientId).toHaveBeenCalledWith(
        "clientId",
        0,
        6,
      );
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(6);
    });
  });
});
