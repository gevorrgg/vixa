import { useMemo, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { clearAuthSession, getStoredAuthSession } from "../../lib/api-client";
import { Toast, useToast } from "./Toast";
import { VideoPlayerModal } from "./VideoPlayerModal";

import { TopBar } from "../ui/topbar";
import { ProfileSidebar } from "../ui/profile-sidebar";
import { VideoGrid } from "../ui/videogrid";
import { CreatorsPanel } from "../ui/creatorspanel";
import { SubscribeButton } from "../ui/subscribe-button";

import { useCurrentUserId } from "../../hooks/use-current-userId";
import { useAuthProfile } from "../../hooks/use-auth-profile";
import { useViewedUserProfile } from "../../hooks/use-viewd-user-profile";
import { useFollowStatus } from "../../hooks/use-follow-status";
import { useCreatorSearch } from "../../hooks/use-creator-search";

import { FILTER_CHIPS } from "./profile/constants/profile.constants";
import { gradFromId } from "./profile/utils/format";
import type { ApiVideo } from "./profile/types/profile.types";


type UserProfilePageProps = {
    /** id профиля, который открыт — приходит из роута /users/$userId */
    userId: number;
    initialFollowing: boolean | null;
};

export function UserProfilePage({ userId: viewedUserId, initialFollowing }: UserProfilePageProps) {
    const navigate = useNavigate();
    const { toast, showToast } = useToast();

    const [authSession, setAuthSession] = useState(() => getStoredAuthSession());
    const authUserId = useCurrentUserId();

    /* топбар — всегда про авторизованного пользователя, не про того, чей профиль открыт */
    const authProfile = useAuthProfile(authUserId);

    /* профиль/статистика/видео просматриваемого пользователя — read-only */
    const { profile, stats, videos, adjustFollowersCount } = useViewedUserProfile(viewedUserId);

    /* при загрузке страницы узнаём, подписан ли auth-юзер на этого человека */
    const { following, toggleFollow } = useFollowStatus(viewedUserId, initialFollowing);

    /* рекомендации всегда авторизованного пользователя и не зависят от открытого профиля */
    const {
        userSearch,
        setUserSearch,
        isSearching,
        searchLoading,
        displayedUsers,
        toggleFollow: toggleRecommendationFollow,
    } = useCreatorSearch(authUserId);

    const [selectedVideo, setSelectedVideo] = useState<ApiVideo | null>(null);
    const [activeFilter, setActiveFilter] = useState("all");

    const filtered = useMemo(
        () => (activeFilter === "all" ? videos : videos.filter((v) => v.category === activeFilter)),
        [videos, activeFilter],
    );

    const viewedAvatarGrad = useMemo(() => (viewedUserId ? gradFromId(viewedUserId) : ""), [viewedUserId]);
    const authAvatarGrad = useMemo(() => (authUserId ? gradFromId(authUserId) : ""), [authUserId]);

    function handleSignOut() {
        clearAuthSession();
        setAuthSession(null);
        navigate({ to: "/auth", replace: true });
    }



    async function handleToggleFollow() {
        const willFollow = !following;

        // оптимистично двигаем счётчик подписчиков в ProfileSidebar
        adjustFollowersCount(willFollow ? 1 : -1);

        try {
            await toggleFollow();

            const name = profile?.name ?? profile?.username ?? "user";

            showToast(
                willFollow
                    ? `Following ${name}!`
                    : `Unfollowed ${name}`
            );
        } catch (error) {
            // откатываем счётчик, если сервер отклонил запрос
            adjustFollowersCount(willFollow ? -1 : 1);

            console.error(error);
            showToast("Failed to update follow status");
        }
    }

    async function handleToggleRecommendationFollow(targetId: number) {
        const target = displayedUsers.find((user) => user.id === targetId);

        if (!target) {
            showToast("User not found");
            return;
        }

        const willFollow = !target.following;
        const name = target.name ?? target.username ?? "user";

        try {
            await toggleRecommendationFollow(targetId);

            showToast(
                willFollow
                    ? `Following ${name}!`
                    : `Unfollowed ${name}`,
            );
        } catch (error) {
            console.error("Failed to update follow status", error);
            showToast("Failed to update follow status");
        }
    }

    return (
        <div className="app-shell">
            <TopBar
                isAuthenticated={!!authSession}
                profile={authProfile}
                avatarGrad={authAvatarGrad}
                onOpenOwnProfile={() => navigate({ to: `/` })}
                onSignOut={handleSignOut}
                onSignIn={() => navigate({ to: "/auth" })}
            />

            <ProfileSidebar
                profile={profile}
                stats={stats}
                avatarGrad={viewedAvatarGrad}
                showNav={false}
                actionButton={<SubscribeButton subscribed={following} onToggle={handleToggleFollow} />}
            />

            <main id="main">
                <div className="main-header">
                    <div className="main-title">
                        {profile?.name || profile?.username || "User"}'s Videos{" "}
                        <span className="video-count-label">{filtered.length} published</span>
                    </div>
                </div>

                <div className="filter-chips">
                    {FILTER_CHIPS.map(([k, l]) => (
                        <div
                            key={k}
                            className={`chip${activeFilter === k ? " active" : ""}`}
                            onClick={() => setActiveFilter(k)}
                        >
                            {l}
                        </div>
                    ))}
                </div>

                <VideoGrid
                    videos={filtered}
                    showActions={false}
                    onDelete={() => { }}
                    onOpenVideo={(video) => setSelectedVideo(video)}
                />
            </main>

            <CreatorsPanel
                userSearch={userSearch}
                onUserSearchChange={setUserSearch}
                isSearching={isSearching}
                searchLoading={searchLoading}
                displayedUsers={displayedUsers}
                onToggleFollow={handleToggleRecommendationFollow}
                onOpenUser={(user) =>
                    navigate({
                        to: "/users/$userId",
                        params: {
                            userId: String(user.id),
                        },
                        state: {
                            initialFollowing: user.following,
                        },
                    })
                }
            />

            {selectedVideo && (
                <VideoPlayerModal video={selectedVideo} userId={authUserId} onClose={() => setSelectedVideo(null)} />
            )}

            <Toast message={toast} />
        </div>
    );
}