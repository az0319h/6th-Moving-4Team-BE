import { MoveType } from "@prisma/client";

export interface GetReceivedRequestsQuery {
  moveType?: string;
  serviceArea?: string;
  isDesignated?: string;
  keyword?: string;
  sort?: "moveDate" | "requestedAt";
  limit?: string;
  cursor?: string;
  moverId: string;
}

export interface GetFilteredRequestsInput {
  moveType?: MoveType[];
  serviceAreaList?: string[];
  isDesignated?: boolean;
  keyword?: string;
  sort?: "moveDate" | "requestedAt";
  limit?: number;
  cursor?: string;
  moverId: string;
}
