import { MoveType, Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { CreateRequestDto } from "../dtos/request.dto";

type GetFilteredRequestsInput = {
  moveType?: MoveType[];
  serviceArea?: string;
  isDesignated?: boolean;
  keyword?: string;
  sort?: "moveDate" | "requestedAt";
  limit?: number;
  cursor?: string;
  moverId: string;
};

// 견적 요청 (일반 유저)
async function createEstimateRequest(request: CreateRequestDto, clientId: string) {
  return await prisma.request.create({
    data: {
      ...request,
      client: {
        connect: {
          id: clientId,
        },
      },
    },
  });
}

// 받은 요청 조회 (기사님)
async function getFilteredRequests({
  moveType,
  serviceArea,
  isDesignated,
  keyword,
  sort,
  limit,
  cursor,
  moverId,
}: GetFilteredRequestsInput) {
  const where: Prisma.RequestWhereInput = {
    ...(moveType && { moveType: { in: moveType } }),
    ...(serviceArea && {
      OR: [
        {
          fromAddress: { contains: serviceArea },
        },
        { toAddress: { contains: serviceArea } },
      ],
    }),
    ...(isDesignated === true && {
      designatedRequest: {
        some: {
          mover: {
            id: moverId,
          },
        },
      },
    }),
    ...(keyword && {
      client: {
        name: {
          contains: keyword,
          mode: "insensitive",
        },
      },
    }),
  };

  const orderBy: Prisma.RequestOrderByWithRelationInput = {
    requestedAt: sort === "requestedAt" ? "desc" : "asc",
  };

  const args = {
    where,
    orderBy,
    take: limit ?? 6,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    include: {
      designatedRequest: true,
      client: {
        select: {
          name: true,
        },
      },
    },
  } satisfies Prisma.RequestFindManyArgs;

  type RequestWithIncludes = Prisma.RequestGetPayload<typeof args>;

  const requests: RequestWithIncludes[] = await prisma.request.findMany(args);

  const result = requests.map(({ designatedRequest, client, ...rest }) => ({
    ...rest,
    isDesignated: designatedRequest.map((dr) => dr.moverId).includes(moverId),
    clientName: client.name,
  }));

  const nextCursor = requests.length === limit ? requests[requests.length - 1].id : null;

  return {
    result,
    nextCursor,
  };
}

export default {
  createEstimateRequest,
  getFilteredRequests,
};
