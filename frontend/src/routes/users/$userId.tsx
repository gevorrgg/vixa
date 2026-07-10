import {
    createFileRoute,
    useLocation,
} from "@tanstack/react-router";
import { UserProfilePage } from "../../components/streamvibe/UserProfilePage";

export const Route = createFileRoute("/users/$userId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { userId } = Route.useParams();
    const location = useLocation();

    const state = location.state as {
        initialFollowing?: boolean;
    };

    return (
        <UserProfilePage
            userId={Number(userId)}
            initialFollowing={state.initialFollowing ?? null}
        />
    );
}