import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { apiFetch } from "../../lib/api-client";

async function getMe() {
    try {
        return await apiFetch("/api/auth/me");
    } catch {
        return null;
    }
}

export const Route = createFileRoute("/_authenticated")({
    ssr: false,
    beforeLoad: async () => {
        const user = await getMe();

        if (!user) {
            throw redirect({ to: "/auth" });
        }

        return { user };
    },
    component: () => <Outlet />,
});