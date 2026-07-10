export type ApiVideo = {
    id: number;
    title: string;
    category: string;
    views: string;
    date: string;
    duration: string;
    emoji: string;
    grad: number;
    thumbnailUrl: string | null;
    contentUrl: string;
    likes: number;
};

export type ApiProfile = {
    id: number;
    username: string;
    name: string | null;
    bio: string | null;
    gender: string | null;
    location: string | null;
    website: string | null;
    avatarUrl: string | null;
};

export type ApiStats = {
    videosCount: number;
    followersCount: number;
    totalViews: number;
};

// search 
export type ApiUserResult = {
    id: number;
    username: string;
    name: string | null;
    avatarUrl: string | null;
    followers: number;
    following: boolean;
};