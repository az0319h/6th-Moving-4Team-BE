import { Client, Prisma, Review, Mover } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { ServerError, ValidationError } from "../types/errors";

//내가 작성한 리뷰 목록 조회
async function findReviewsByClientId(
  clientId: Client["id"],
  offset: number,
  limit: number,
  page: number,
) {
  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { clientId },
        select: {
          id: true,
          rating: true,
          content: true,
          createdAt: true,
          moverId: true,
          mover: { select: { nickName: true, profileImage: true } },
          estimate: {
            select: {
              price: true,
              request: {
                select: {
                  moveType: true,
                  moveDate: true,
                  designatedRequest: { select: { moverId: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.review.count({ where: { clientId } }),
    ]);

    const result = reviews.map((e) => ({
      id: e.id,
      rating: e.rating,
      content: e.content,
      createdAt: e.createdAt,
      moverNickname: e.mover.nickName,
      moverProfileImage: e.mover.profileImage,
      price: e.estimate.price,
      moveType: e.estimate.request.moveType,
      moveDate: e.estimate.request.moveDate,
      isDesignatedEstimate:
        Array.isArray(e.estimate.request.designatedRequest) &&
        e.estimate.request.designatedRequest.some((dr) => dr.moverId === e.moverId),
    }));

    return {
      reviews: result,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new ServerError("리뷰 조회 중 서버 오류가 발생했습니다.", error);
  }
}

// 리뷰 평점 및 카운팅
async function _updateMoverReviewStatsTx(moverId: Mover["id"], tx: Prisma.TransactionClient) {
  const stats = await tx.review.aggregate({
    where: { moverId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await tx.mover.update({
    where: { id: moverId },
    data: {
      averageReviewRating: stats._avg.rating ?? 0,
      reviewCount: stats._count.rating,
    },
  });
}

// 리뷰 작성
async function createReview(data: Prisma.ReviewCreateInput, moverId: Mover["id"]) {
  try {
    const estimateId = data.estimate.connect?.id;
    if (!estimateId) {
      throw new ValidationError("estimateId가 필요합니다.");
    }

    const existing = await prisma.review.findUnique({
      where: { estimateId },
    });
    if (existing) {
      throw new ValidationError("이미 리뷰가 등록된 견적입니다.");
    }

    return await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({ data });
      await _updateMoverReviewStatsTx(moverId, tx);
      return review;
    });
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ServerError("리뷰 등록 중 서버 오류가 발생했습니다.", error);
  }
}

// id로 리뷰 찾기
async function findReviewById(reviewId: Review["id"]) {
  try {
    return await prisma.review.findUnique({ where: { id: reviewId } });
  } catch (error) {
    throw new ServerError("리뷰 조회 중 서버 오류가 발생했습니다.", error);
  }
}

// 리뷰 수정
async function updateReview(
  reviewId: Review["id"],
  data: Partial<Pick<Review, "rating" | "content">>,
) {
  try {
    const review = await findReviewById(reviewId);
    if (!review) throw new ValidationError("리뷰를 찾을 수 없습니다.");
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id: reviewId },
        data,
      });
      await _updateMoverReviewStatsTx(review.moverId, tx);
      return updated;
    });
  } catch (error) {
    throw new ServerError("리뷰 수정 중 서버 오류가 발생했습니다.", error);
  }
}

// 리뷰 삭제
async function deleteReview(reviewId: Review["id"]) {
  try {
    const review = await findReviewById(reviewId);
    if (!review) throw new ValidationError("리뷰를 찾을 수 없습니다.");
    return await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await _updateMoverReviewStatsTx(review.moverId, tx);
    });
  } catch (error) {
    throw new ServerError("리뷰 삭제 중 서버 오류가 발생했습니다.", error);
  }
}

export default {
  findReviewsByClientId,
  createReview,
  findReviewById,
  updateReview,
  deleteReview,
};
