// services/mover.service.ts (페이지네이션 지원)
import moverRepository from "../repositories/mover.repository";
import { BadRequestError, ForbiddenError } from "../types/errors";

interface GetMoversParams {
  page?: number;
  limit?: number;
  search?: string;
  area?: string;
  serviceType?: string;
  sortBy?: string;
}

// 전체 기사님 리스트 조회
async function getMovers(clientId?: string, params: GetMoversParams = {}) {
  // 페이지네이션 파라미터 검증
  const { page = 1, limit = 10 } = params;
  
  if (page < 1) throw new BadRequestError("페이지는 1 이상이어야 합니다.");
  if (limit < 1 || limit > 100) throw new BadRequestError("limit은 1-100 사이여야 합니다.");

  return moverRepository.fetchMovers(clientId, params);
}

// 기사님 상세 조회
async function getMoverDetail(moverId: string, clientId?: string) {
  if (!moverId) throw new BadRequestError("moverId가 필요합니다.");
  return moverRepository.fetchMoverDetail(moverId, clientId);
}

// 찜하기
async function favoriteMover(clientId: string, moverId: string) {
  if (!clientId || !moverId)
    throw new BadRequestError("clientId 또는 moverId가 필요합니다.");

  return moverRepository.addFavoriteMover(clientId, moverId);
}

// 찜 취소
async function unfavoriteMover(clientId: string, moverId: string) {
  if (!clientId || !moverId)
    throw new BadRequestError("clientId 또는 moverId가 필요합니다.");

  return moverRepository.removeFavoriteMover(clientId, moverId);
}

// 기사 지정
async function designateMover(clientId: string, requestId: string, moverId: string) {
  if (!clientId || !requestId || !moverId)
    throw new BadRequestError("필수 값 누락");

  return moverRepository.designateMover(requestId, moverId);
}

export default {
  getMovers,
  getMoverDetail,
  favoriteMover,
  unfavoriteMover,
  designateMover,
};