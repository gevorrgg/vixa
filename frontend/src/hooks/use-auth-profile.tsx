import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api-client";
import type { ApiProfile } from "../components/streamvibe/profile/types/profile.types";

/**
 * Только профиль (без stats/videos) — нужен, чтобы TopBar показывал
 * аватар/имя авторизованного пользователя даже когда мы смотрим чужую страницу.
 */
export function useAuthProfile(authUserId: number | null): ApiProfile | null {
    const [profile, setProfile] = useState<ApiProfile | null>(null);

    useEffect(() => {
        if (!authUserId) {
            setProfile(null);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const p = await apiFetch<ApiProfile>(`/api/users/${authUserId}/profile`);
                if (!cancelled) setProfile(p);
            } catch (err) {
                console.error("Failed to load auth user profile", err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [authUserId]);

    return profile;
}