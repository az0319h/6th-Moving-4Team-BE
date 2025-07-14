import { Client } from "@prisma/client";
import estimateRepository from "../repositories/estimate.repository";
import { BadRequestError } from "../types/errors";

// 작성 가능한 리뷰 목록
async function getWritableEstimates(clientId: Client["id"], page: number, limit: number) {
  if (!clientId) {
    throw new BadRequestError("clientId가 필요합니다.");
  }
  const offset = (page - 1) * limit;
  return estimateRepository.findWritableEstimatesByClientId(clientId, offset, limit, page);
}

// 데기 중인 견적서 조회
async function getPendingEstimates(clientId: Client["id"]) {
  const requests = await estimateRepository.findPendingEstimatesByClientId(clientId);

  return Promise.all(
    requests.map(async (req) => {
      const designatedMoverIds = req.designatedRequest.map((d) => d.moverId);

      const estimates = await Promise.all(
        req.estimate.map(async (e) => {
          const isDesignated = designatedMoverIds.includes(e.moverId);
          const isFavorited = await estimateRepository.isFavoritMover(clientId, e.moverId);

          return {
            estimateId: e.id,
            moverId: e.mover.id,
            moverName: e.mover.name,
            moverNickName: e.mover.nickName,
            profileImage: e.mover.profileImage,
            comment: e.comment,
            price: e.price,
            created: e.createdAt,
            isDesignated,
            isFavorited,
          };
        }),
      );

      return {
        requestId: req.id,
        moveDate: req.moveDate,
        fromAddress: req.fromAddress,
        toAddress: req.toAddress,
        estimates,
      };
    }),
  );
}

export default {
  getWritableEstimates,
  getPendingEstimates,
};
