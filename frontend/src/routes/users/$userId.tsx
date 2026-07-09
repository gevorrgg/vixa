import { createFileRoute } from "@tanstack/react-router";
import { UserProfilePage } from "../../components/streamvibe/UserProfilePage";

export const Route = createFileRoute("/users/$userId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { userId } = Route.useParams();
    return <UserProfilePage userId={Number(userId)} />;
}