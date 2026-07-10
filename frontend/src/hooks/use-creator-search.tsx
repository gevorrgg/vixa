import { useEffect, useMemo, useState } from "react";
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

/**
 * Управляет блоком "Find Creators": рекомендации, когда поле поиска пустое,
 * и live-поиск (debounce 300ms), когда пользователь что-то вводит.
 * toggleFollow — пока чисто оптимистичный (без реального API), как и в оригинале.
 */
export function useCreatorSearch(userId: number | null): UseCreatorSearchResult {
    const [userSearch, setUserSearch] = useState("");
    const [recommendations, setRecommendations] = useState<ApiUserResult[]>([]);
    const [searchResults, setSearchResults] = useState<ApiUserResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    /* рекомендации грузим один раз, когда известен userId */
    useEffect(() => {
        if (!userId) return;

        let cancelled = false;

        (async () => {
            try {
                const res = await apiFetch<{ users: ApiUserResult[] }>(`/api/users/${userId}/recommendations`);
                if (!cancelled) setRecommendations(res.users);
            } catch (err) {
                console.error("Failed to load recommendations", err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    /* live-поиск с debounce */
    useEffect(() => {
        const query = userSearch.trim();

        if (!query) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        setSearchLoading(true);
        let cancelled = false;

        const timeoutId = setTimeout(async () => {
            try {
                const res = await apiFetch<{ users: ApiUserResult[] }>(
                    `/api/users/search?prefix=${encodeURIComponent(query)}&limit=10`,
                );

                console.log(res.users)
                if (!cancelled) setSearchResults(res.users);
            } catch (err) {
                console.error("Failed to search users", err);
                if (!cancelled) setSearchResults([]);
            } finally {
                if (!cancelled) setSearchLoading(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [userSearch]);

    const isSearching = userSearch.trim().length > 0;
    const displayedUsers = isSearching ? searchResults : recommendations;

    async function toggleFollow(targetId: number): Promise<ApiUserResult | undefined> {
        const updater = (list: ApiUserResult[]) =>
            list.map((u) => (u.id === targetId ? { ...u, following: !u.following } : u));

        if (isSearching) {
            setSearchResults(updater);
        } else {
            setRecommendations(updater);
        }

        const source = isSearching ? searchResults : recommendations;
        const target = source.find((u) => u.id === targetId);
        
        await apiFetch(`/users/${userId}/${target?.following ? 'unfollow' : 'follow'}`)

        return target;
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