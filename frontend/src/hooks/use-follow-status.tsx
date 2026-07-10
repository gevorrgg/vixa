import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api-client";

type UseFollowStatusResult = {
    following: boolean;
    loading: boolean;
    toggleFollow: () => Promise<void>;
};

export function useFollowStatus(
    targetUserId: number | null,
    initialFollowing: boolean | null,
): UseFollowStatusResult {
    const [following, setFollowing] = useState(initialFollowing ?? false);
    const [loading, setLoading] = useState(initialFollowing === null);

    useEffect(() => {
        if (!targetUserId) {
            setFollowing(false);
            setLoading(false);
            return;
        }

        if (initialFollowing !== null) {
            setFollowing(initialFollowing);
            setLoading(false);
            return;
        }

        let cancelled = false;

        setLoading(true);

        async function loadFollowStatus() {
            try {
                const res = await apiFetch<{ following: boolean }>(
                    `/api/users/${targetUserId}/follow-status`,
                );

                if (!cancelled) {
                    setFollowing(res.following);
                }
            } catch (err) {
                console.error("Failed to load follow status", err);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadFollowStatus();

        return () => {
            cancelled = true;
        };
    }, [targetUserId, initialFollowing]);

    async function toggleFollow() {
        if (!targetUserId) {
            return;
        }

        const next = !following;

        setFollowing(next);

        try {
            await apiFetch(
                `/api/users/${targetUserId}/${next ? "follow" : "unfollow"}`,
                {
                    method: next ? "POST" : "DELETE",
                },
            );
        } catch (err) {
            setFollowing(!next);
            console.error("Failed to toggle follow", err);
            throw err;
        }
    }

    return {
        following,
        loading,
        toggleFollow,
    };
}