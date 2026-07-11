import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/api-client";
import type { ApiProfile, ApiStats, ApiVideo } from "../components/streamvibe/profile/types/profile.types";

type UseViewedUserProfileResult = {
    profile: ApiProfile | null;
    stats: ApiStats;
    videos: ApiVideo[];
    loading: boolean;
    /** Локально (оптимистично) сдвигает счётчик подписчиков на delta, не дожидаясь рефетча статы. */
    adjustFollowersCount: (delta: number) => void;
};

export function useViewedUserProfile(targetUserId: number | null): UseViewedUserProfileResult {
    const [profile, setProfile] = useState<ApiProfile | null>(null);
    const [stats, setStats] = useState<ApiStats>({ videosCount: 0, followersCount: 0, totalViews: 0 });
    const [videos, setVideos] = useState<ApiVideo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!targetUserId) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const [p, s, v] = await Promise.all([
                    apiFetch<ApiProfile>(`/api/users/${targetUserId}/profile`),
                    apiFetch<ApiStats>(`/api/users/${targetUserId}/stats`),
                    apiFetch<{ videos: ApiVideo[] }>(`/api/videos/${targetUserId}`),
                ]);
                if (!cancelled) {
                    setProfile(p);
                    setStats(s);
                    setVideos(v.videos);
                }
            } catch (err) {
                console.error("Failed to load viewed user profile", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [targetUserId]);

    const adjustFollowersCount = useCallback((delta: number) => {
        setStats((prev) => ({
            ...prev,
            followersCount: Math.max(0, prev.followersCount + delta),
        }));
    }, []);

    return { profile, stats, videos, loading, adjustFollowersCount };
}