import z from "zod";

// 리뷰 생성 DTO 및 zod 스키마
export const CreateReviewSchema = z.object({
  estimateId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(10),
});

// 리뷰 수정 DTO 및 zod 스키마
export const UpdateReviewschema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  content: z.string().min(1).optional(),
});

// 리뷰 ID 파라미터 DTO 및 zod 스키마
export const ReviewIdParamsSchema = z.object({
  reviewId: z.string().uuid(),
});
