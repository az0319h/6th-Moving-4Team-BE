import prisma from "../configs/prisma.config";
import { CreateCommunityData, CreateReplyData } from "../types";

async function findAllCommunity(offset: number, limit: number, search?: string) {
  const skip = (offset - 1) * limit;

  const whereCondition = search
    ? {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            content: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const [communities, totalCount] = await prisma.$transaction([
    prisma.community.findMany({
      where: whereCondition,
      include: {
        client: {
          select: {
            name: true,
            profileImage: true,
          },
        },
        mover: {
          select: {
            nickName: true,
            profileImage: true,
          },
        },
        replies: {
          include: {
            client: {
              select: {
                name: true,
                profileImage: true,
              },
            },
            mover: {
              select: {
                nickName: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.community.count({
      where: whereCondition,
    }),
  ]);

  const formattedCommunities = communities.map((community) => ({
    id: community.id,
    title: community.title,
    content: community.content,
    createdAt: community.createdAt,
    updatedAt: community.updatedAt,
    clientId: community.clientId,
    moverId: community.moverId,
    userNickname: community.client?.name || community.mover?.nickName || "익명",
    profileImg: community.client?.profileImage || community.mover?.profileImage || null,
    replies: community.replies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      communityId: reply.communityId,
      clientId: reply.clientId,
      moverId: reply.moverId,
      userNickname: reply.client?.name || reply.mover?.nickName || "익명",
      profileImg: reply.client?.profileImage || reply.mover?.profileImage || null,
    })),
  }));

  return {
    communities: formattedCommunities,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    searchKeyword: search || null,
  };
}

async function create(data: CreateCommunityData) {
  return await prisma.community.create({
    data: {
      title: data.title,
      content: data.content,
      clientId: data.clientId || null,
      moverId: data.moverId || null,
    },
  });
}

async function createReply(data: CreateReplyData) {
  return await prisma.reply.create({
    data: {
      content: data.content,
      communityId: data.communityId,
      clientId: data.clientId || null,
      moverId: data.moverId || null,
    },
  });
}

async function findByIdWithDetails(id: string) {
  const community = await prisma.community.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      clientId: true,
      moverId: true,
      client: {
        select: {
          name: true,
          profileImage: true,
        },
      },
      mover: {
        select: {
          nickName: true,
          profileImage: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });
  if (!community) return null;

  return {
    id: community.id,
    title: community.title,
    content: community.content,
    createdAt: community.createdAt,
    updatedAt: community.updatedAt,
    clientId: community.clientId,
    moverId: community.moverId,
    userNickname: community.client?.name || community.mover?.nickName || "익명",
    profileImg: community.client?.profileImage || community.mover?.profileImage || null,
    replyCount: community._count.replies,
  };
}

async function findRepliesByCommunityId(communityId: string) {
  const replies = await prisma.reply.findMany({
    where: { communityId },
    include: {
      client: { select: { id: true, name: true, profileImage: true } },
      mover: { select: { id: true, name: true, profileImage: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return replies.map((reply) => ({
    id: reply.id,
    content: reply.content,
    createdAt: reply.createdAt,
    clientId: reply.clientId,
    moverId: reply.moverId,
    communityId: reply.communityId,
    userNickname: reply.client?.name || reply.mover?.name || "익명",
    profileImg: reply.client?.profileImage || reply.mover?.profileImage || null,
  }));
}

async function deleteCommunity(id: string) {
  return await prisma.community.delete({
    where: { id },
  });
}

async function findByIdReply(id: string) {
  return prisma.reply.findUnique({
    where: { id },
  });
}

async function deleteReply(id: string) {
  return await prisma.reply.delete({
    where: { id },
  });
}

export default {
  findAllCommunity,
  create,
  createReply,
  findByIdWithDetails,
  findRepliesByCommunityId,
  deleteCommunity,
  deleteReply,
  findByIdReply,
};
