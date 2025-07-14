import { MoveType } from "@prisma/client";
import { CreateRequestDto } from "../dtos/request.dto";
import requestRepository from "../repositories/request.repository";
import { GetReceivedRequestsQuery } from "../types";

// 견적 요청 (일반 유저)
async function createRequest({
  request,
  clientId,
}: {
  request: CreateRequestDto;
  clientId: string;
}) {
  return await requestRepository.createEstimateRequest(request, clientId);
}

// 받은 요청 조회 (기사님)
async function getReceivedRequests(query: GetReceivedRequestsQuery) {
  const { moveType, isDesignated, serviceArea, keyword, sort, limit = 6, cursor, moverId } = query;
  const serviceAreaList = serviceArea?.split(",").map((v) => v.trim()) ?? [];

  return await requestRepository.getFilteredRequests({
    moveType: moveType
      ?.split(",")
      .filter((v: string) => ["SMALL", "HOME", "OFFICE"].includes(v)) as MoveType[],
    isDesignated: isDesignated === "true" ? true : isDesignated === "false" ? false : undefined,
    serviceAreaList,
    keyword,
    sort,
    limit: Number(limit),
    cursor,
    moverId,
  });
}

export default {
  createRequest,
  getReceivedRequests,
};
