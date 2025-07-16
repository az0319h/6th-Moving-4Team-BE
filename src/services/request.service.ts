import { MoveType } from "@prisma/client";
import { CreateRequestDto } from "../dtos/request.dto";
import requestRepository from "../repositories/request.repository";
import { GetReceivedRequestsQuery } from "../types";
import { BadRequestError } from "../types/errors";
import { ErrorMessage } from "../constants/ErrorMessage";
import { CreateRequestSchema } from "../schemas/request.schema";

// 견적 요청 (일반 유저)
async function createRequest({
  request,
  clientId,
}: {
  request: CreateRequestDto;
  clientId: string;
}) {
  if (!clientId) {
    throw new BadRequestError(ErrorMessage.BAD_REQUEST);
  }

  const parseResult = CreateRequestSchema.safeParse(request);
  if (!parseResult.success) {
    const errorMessage = parseResult.error.errors[0]?.message ?? ErrorMessage.INVALID_INPUT;
    throw new BadRequestError(errorMessage);
  }

  return await requestRepository.createEstimateRequest(parseResult.data, clientId);
}

// 받은 요청 조회 (기사님)
async function getReceivedRequests(query: GetReceivedRequestsQuery) {
  const { moveType, isDesignated, serviceArea, keyword, sort, limit = 6, cursor, moverId } = query;

  if (!moverId) {
    throw new BadRequestError(ErrorMessage.BAD_REQUEST);
  }

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
