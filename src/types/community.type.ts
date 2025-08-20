export interface CreateCommunityData {
  title: string;
  content: string;
  clientId?: string;
  moverId?: string;
}

export interface CreateReplyData {
  content: string;
  communityId: string;
  clientId?: string;
  moverId?: string;
}
