import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api-client";

type UseFollowStatusResult = {
    following: boolean;
    loading: boolean;
    toggleFollow: () => Promise<void>;
};

/**
 * Upon mounting, it makes an API request to check whether the currently
 * authenticated user is subscribed to `targetUserId`—this is necessary
 * to immediately display the correct state of the Follow/Subscribed button.
 * `toggleFollow` — optimistic update with rollback on error.
 */
export function useFollowStatus(targetUserId: number | null): UseFollowStatusResult {
    const [following, setFollowing] = useState(false);
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
                // ожидаемый контракт бэка: { following: boolean }
                const res = await apiFetch<{ following: boolean }>(`/api/users/${targetUserId}/follow-status`);
                if (!cancelled) setFollowing(res.following);
            } catch (err) {
                console.error("Failed to load follow status", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [targetUserId]);

    async function toggleFollow() {
        if (!targetUserId) return;

        const next = !following;
        setFollowing(next); // оптимистичное обновление UI

        try {
            await apiFetch(`/api/users/${targetUserId}/${next ? "follow" : "unfollow"}`, { method: "POST" });
        } catch (err) {
            setFollowing(!next); // откат при ошибке запроса
            console.error("Failed to toggle follow", err);
            throw err;
        }
    }

    return { following, loading, toggleFollow };
}