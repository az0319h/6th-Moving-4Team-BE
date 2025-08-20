import CommunityRepository from "../repositories/Community.repository";
import { CreateCommunityData, CreateReplyData } from "../types";
import { translateData } from "../utils/translation.util";

async function getAllCommunity(
  offset: number,
  limit: number,
  search?: string,
  targetLang?: string,
) {
  try {
    const communities = await CommunityRepository.findAllCommunity(offset, limit, search);
    const result = {
      success: true,
      data: communities,
    };

    // 번역이 필요한 경우 번역 수행
    if (targetLang) {
      return (await translateData(
        result,
        ["data.communities.content", "data.communities.title", "data.communities.replies.content"],
        targetLang,
      )) as typeof result;
    }

    return result;
  } catch (e) {
    console.log(e);
    throw new Error("커뮤니티 목록 조회 실패");
  }
}

async function getCommunity(id: string, targetLang?: string) {
  try {
    const community = await CommunityRepository.findByIdWithDetails(id);

    if (!community) {
      return {
        success: false,
        message: "존재하지 않는 게시글입니다.",
      };
    }

    const result = {
      success: true,
      data: community,
    };

    // 번역이 필요한 경우 번역 수행
    if (targetLang) {
      return (await translateData(
        result,
        ["data.content", "data.title"],
        targetLang,
      )) as typeof result;
    }

    return result;
  } catch (e) {
    console.log(e);
    throw new Error("게시글을 불러올 수 없습니다.");
  }
}

async function createCommunity(data: CreateCommunityData) {
  try {
    if (!data.clientId && !data.moverId) {
      return {
        success: false,
        message: "로그인이 필요합니다.",
      };
    }

    if (!data.title.trim() || !data.content.trim()) {
      return {
        success: false,
        message: "제목과 내용을 입력해주세요.",
      };
    }

    const newCommunity = await CommunityRepository.create({
      title: data.title.trim(),
      content: data.content.trim(),
      clientId: data.clientId,
      moverId: data.moverId,
    });

    return {
      success: true,
      data: newCommunity,
    };
  } catch (e) {
    console.log(e);
    throw new Error("게시글 작성에 실패했습니다.");
  }
}

async function createReply(data: CreateReplyData) {
  try {
    if (!data.content.trim()) {
      return {
        success: false,
        message: "댓글 내용을 입력해주세요.",
      };
    }

    // 게시글 존재 확인
    const community = await CommunityRepository.findByIdWithDetails(data.communityId);
    if (!community) {
      return {
        success: false,
        message: "존재하지 않는 게시글입니다.",
      };
    }

    // 댓글 생성
    const newReply = await CommunityRepository.createReply({
      content: data.content.trim(),
      communityId: data.communityId,
      clientId: data.clientId,
      moverId: data.moverId,
    });

    return {
      success: true,
      data: newReply,
    };
  } catch (e) {
    console.log(e);
  }
}

async function getRepliesByCommunityId(communityId: string, targetLang?: string) {
  if (!communityId) {
    return {
      success: false,
      message: "커뮤니티 Id가 필요합니다",
    };
  }
  const communities = CommunityRepository.findRepliesByCommunityId(communityId);

  // 번역이 필요한 경우 번역 수행
  if (targetLang) {
    return (await translateData(
      communities,
      ["data.content", "data.title"],
      targetLang,
    )) as typeof communities;
  }

  return communities;
}

async function deleteCommunity(id: string, userId: string, userType: "client" | "mover") {
  try {
    const community = await CommunityRepository.findByIdWithDetails(id);

    if (!community) {
      return {
        success: false,
        message: "존재하지 않는 게시글입니다.",
      };
    }

    const isAuthor =
      (userType === "client" && community.clientId === userId) ||
      (userType === "mover" && community.moverId === userId);

    if (!isAuthor) {
      return {
        success: false,
        message: "본인이 작성한 게시글만 삭제할 수 있습니다.",
      };
    }

    await CommunityRepository.deleteCommunity(id);

    return {
      success: true,
      message: "게시글이 삭제되었습니다.",
    };
  } catch (e) {
    console.log(e);
    throw new Error("게시글 삭제에 실패했습니다.");
  }
}

async function deleteReply(id: string, userId: string, userType: "client" | "mover") {
  try {
    const reply = await CommunityRepository.findByIdReply(id);

    if (!reply) {
      return {
        success: false,
        message: "존재하지 않는 댓글입니다.",
      };
    }

    const isAuthor =
      (userType === "client" && reply.clientId === userId) ||
      (userType === "mover" && reply.moverId === userId);

    if (!isAuthor) {
      return {
        success: false,
        message: "본인이 작성한 게시글만 삭제할 수 있습니다.",
      };
    }

    await CommunityRepository.deleteReply(id);

    return {
      success: true,
      message: "댓글이 삭제되었습니다.",
    };
  } catch (e) {
    console.log(e);
    throw new Error("댓글 삭제에 실패했습니다.");
  }
}

export default {
  getAllCommunity,
  createCommunity,
  createReply,
  getCommunity,
  getRepliesByCommunityId,
  deleteCommunity,
  deleteReply,
};
