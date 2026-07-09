import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users/$userId")({
    component: UserProfilePage,
});

function UserProfilePage() {
    const { userId } = Route.useParams();

    return (
        <div>
            <h1>User profile</h1>
            <p>User ID: {userId}</p>
        </div>
    );
}