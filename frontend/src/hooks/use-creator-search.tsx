import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api-client";
import type { ApiUserResult } from "../components/streamvibe/profile/types/profile.types";

type UseCreatorSearchResult = {
    userSearch: string;
    setUserSearch: (value: string) => void;
    isSearching: boolean;
    searchLoading: boolean;
    displayedUsers: ApiUserResult[];
    toggleFollow: (targetId: number) => Promise<ApiUserResult | undefined>;
};

export function useCreatorSearch(
    userId: number | null,
): UseCreatorSearchResult {
    const [userSearch, setUserSearch] = useState("");
    const [recommendations, setRecommendations] = useState<ApiUserResult[]>([]);
    const [searchResults, setSearchResults] = useState<ApiUserResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;

        let cancelled = false;

        async function loadRecommendations() {
            try {
                const res = await apiFetch<{ users: ApiUserResult[] }>(
                    `/api/users/${userId}/recommendations`,
                );

                if (!cancelled) {
                    setRecommendations(res.users);
                }
            } catch (error) {
                console.error("Failed to load recommendations", error);
            }
        }

        loadRecommendations();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    useEffect(() => {
        const query = userSearch.trim();

        if (!query) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        let cancelled = false;

        setSearchLoading(true);

        const timeoutId = window.setTimeout(async () => {
            try {
                const res = await apiFetch<{ users: ApiUserResult[] }>(
                    `/api/users/search?prefix=${encodeURIComponent(query)}&limit=10`,
                );

                if (!cancelled) {
                    setSearchResults(res.users);
                }
            } catch (error) {
                console.error("Failed to search users", error);

                if (!cancelled) {
                    setSearchResults([]);
                }
            } finally {
                if (!cancelled) {
                    setSearchLoading(false);
                }
            }
        }, 300);

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, [userSearch]);

    const isSearching = userSearch.trim().length > 0;

    const displayedUsers = isSearching
        ? searchResults
        : recommendations;

    async function toggleFollow(
        targetId: number,
    ): Promise<ApiUserResult | undefined> {
        const source = isSearching
            ? searchResults
            : recommendations;

        const target = source.find((user) => user.id === targetId);

        if (!target) {
            console.error(`User with id ${targetId} was not found`);
            return undefined;
        }

        const nextFollowing = !target.following;

        const updateUser = (users: ApiUserResult[]) =>
            users.map((user) =>
                user.id === targetId
                    ? {
                          ...user,
                          following: nextFollowing,
                          followers:
                              user.followers +
                              (nextFollowing ? 1 : -1),
                      }
                    : user,
            );

        const rollbackUser = (users: ApiUserResult[]) =>
            users.map((user) =>
                user.id === targetId ? target : user,
            );

        // Обновляем оба списка, потому что один пользователь
        // может одновременно находиться в рекомендациях и поиске.
        setRecommendations(updateUser);
        setSearchResults(updateUser);

        try {
            await apiFetch(
                `/api/users/${targetId}/${nextFollowing ? "follow" : "unfollow"}`,
                {
                    method: nextFollowing ? "POST" : "DELETE",
                },
            );

            return {
                ...target,
                following: nextFollowing,
                followers:
                    target.followers +
                    (nextFollowing ? 1 : -1),
            };
        } catch (error) {
            // Откатываем оптимистичное изменение при ошибке сервера.
            setRecommendations(rollbackUser);
            setSearchResults(rollbackUser);

            console.error("Failed to toggle follow status", error);
            return undefined;
        }
    }

    return {
        userSearch,
        setUserSearch,
        isSearching,
        searchLoading,
        displayedUsers,
        toggleFollow,
    };
}