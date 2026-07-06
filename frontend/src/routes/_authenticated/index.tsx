import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/streamvibe/ProfilePage";

export const Route = createFileRoute("/_authenticated/")(
    {
    head: () => ({
        meta: [
            { title: "Your Channel — StreamVibe" },
            { name: "description", content: "Manage your videos, edit your profile, and grow your channel on StreamVibe." },
            { property: "og:title", content: "Your Channel — StreamVibe" },
            { property: "og:description", content: "Manage your videos and grow your channel on StreamVibe." },
        ],
    }),
    component: ProfilePage,
});