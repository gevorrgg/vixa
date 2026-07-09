import { useEffect, useState } from "react";
import { getStoredAuthSession, getStoredAuthUser } from "../lib/api-client";

/**
 * Достаёт id текущего пользователя из сохранённой сессии,
 * с фолбэком на getStoredAuthUser().
 */
export function useCurrentUserId(): number | null {
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const session = getStoredAuthSession();
        const storedUserId = typeof session?.user?.id === "number" ? session.user.id : null;

        if (storedUserId) {
            setUserId(storedUserId);
            return;
        }

        const fallbackUser = getStoredAuthUser();
        const derivedUserId = typeof fallbackUser?.id === "number" ? fallbackUser.id : null;
        if (derivedUserId) {
            setUserId(derivedUserId);
        }
    }, []);

    return userId;
}