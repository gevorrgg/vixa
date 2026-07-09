import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/api-client";
import type { ApiProfile, ApiStats, ApiVideo } from "../components/streamvibe/profile/types/profile.types";

type UseProfileDataResult = {
    profile: ApiProfile | null;
    stats: ApiStats;
    videos: ApiVideo[];
    setVideos: React.Dispatch<React.SetStateAction<ApiVideo[]>>;
    refreshAll: (uid: number) => Promise<void>;
    refreshVideos: () => Promise<void>;
    deleteVideo: (videoId: number) => Promise<void>;
};

/**
 * Инкапсулирует получение профиля/статистики/видео пользователя
 * и операции над ними (обновление, удаление видео).
 */
export function useProfileData(userId: number | null): UseProfileDataResult {
    const [profile, setProfile] = useState<ApiProfile | null>(null);
    const [stats, setStats] = useState<ApiStats>({ videosCount: 0, followersCount: 0, totalViews: 0 });
    const [videos, setVideos] = useState<ApiVideo[]>([]);

    const refreshAll = useCallback(async (uid: number) => {
        const [p, s, v] = await Promise.all([
            apiFetch<ApiProfile>(`/api/users/${uid}/profile`),
            apiFetch<ApiStats>(`/api/users/${uid}/stats`),
            apiFetch<{ videos: ApiVideo[] }>(`/api/users/${uid}/videos`),
        ]);
        setProfile(p);
        setStats(s);
        setVideos(v.videos);
    }, []);

    useEffect(() => {
        if (userId) void refreshAll(userId);
    }, [userId, refreshAll]);

    const refreshVideos = useCallback(async () => {
        if (!userId) return;
        const [s, v] = await Promise.all([
            apiFetch<ApiStats>(`/api/users/${userId}/stats`),
            apiFetch<{ videos: ApiVideo[] }>(`/api/users/${userId}/videos`),
        ]);
        setStats(s);
        setVideos(v.videos);
    }, [userId]);

    const deleteVideo = useCallback(
        async (videoId: number) => {
            if (!userId) return;

            await apiFetch(`/api/users/${userId}/videos/${videoId}`, { method: "DELETE" });

            const deletedVideo = videos.find((v) => v.id === videoId);

            setVideos((prev) => prev.filter((v) => v.id !== videoId));

            setStats((prev) => ({
                ...prev,
                videosCount: Math.max(0, prev.videosCount - 1),
                totalViews: deletedVideo ? Math.max(0, prev.totalViews - Number(deletedVideo.views)) : 0,
            }));
        },
        [userId, videos],
    );

    return { profile, stats, videos, setVideos, refreshAll, refreshVideos, deleteVideo };
}