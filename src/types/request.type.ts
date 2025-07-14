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
