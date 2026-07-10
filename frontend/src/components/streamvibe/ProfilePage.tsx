import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { clearAuthSession, getStoredAuthSession } from "../../lib/api-client";
import { UploadModal } from "./UploadModal";
import { EditProfileModal } from "./EditProfileModal";
import { Toast, useToast } from "./Toast";
import { VideoPlayerModal } from "./VideoPlayerModal";

import { TopBar } from "../ui/topbar";
import { ProfileSidebar } from "../ui/profile-sidebar";
import { VideoGrid } from "../ui/videogrid";
import { CreatorsPanel } from "../ui/creatorspanel";

import { useCurrentUserId } from "../../hooks/use-current-userId";
import { useProfileData } from "../../hooks/use-profile-data";
import { useCreatorSearch } from "../../hooks/use-creator-search";

import { FILTER_CHIPS } from "../streamvibe/profile/constants/profile.constants";
import { gradFromId } from "../streamvibe/profile/utils/format";
import type { ApiUserResult, ApiVideo } from "../streamvibe/profile/types/profile.types";

export function ProfilePage() {
    const navigate = useNavigate();
    const { toast, showToast } = useToast();

    const [authSession, setAuthSession] = useState(() => getStoredAuthSession());
    const userId = useCurrentUserId();

    const { profile, stats, videos, refreshAll, refreshVideos, deleteVideo } = useProfileData(userId);
    const { userSearch, setUserSearch, isSearching, searchLoading, displayedUsers, toggleFollow } =
        useCreatorSearch(userId);

    const [selectedVideo, setSelectedVideo] = useState<ApiVideo | null>(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [uploadOpen, setUploadOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const filtered = useMemo(
        () => (activeFilter === "all" ? videos : videos.filter((v) => v.category === activeFilter)),
        [videos, activeFilter],
    );

    const avatarGrad = useMemo(() => (userId ? gradFromId(userId) : ""), [userId]);

    function handleSignOut() {
        clearAuthSession();
        setAuthSession(null);
        navigate({ to: "/auth", replace: true });
    }

  async function handleToggleFollow(targetId: number) {
    const target = displayedUsers.find((user) => user.id === targetId);

    if (!target) {
        showToast("User not found");
        return;
    }

    const willFollow = !target.following;
    const name = target.name ?? target.username ?? "user";

    try {
        await toggleFollow(targetId);

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


    async function handleDeleteVideo(videoId: number) {
        try {
            await deleteVideo(videoId);
            showToast("Video deleted successfully");
        } catch (error) {
            showToast("Failed to delete video");
            console.error(error);
        }
    }

    return (
        <div className="app-shell">
            <TopBar
                isAuthenticated={!!authSession}
                profile={profile}
                avatarGrad={avatarGrad}
                onOpenOwnProfile={() => navigate({ to: `/` })}
                onSignOut={handleSignOut}
                onSignIn={() => navigate({ to: "/auth" })}
            />

            <ProfileSidebar
                profile={profile}
                stats={stats}
                avatarGrad={avatarGrad}
                actionButton={
                    <button className="btn-edit" onClick={() => setEditOpen(true)}>
                        Edit Profile
                    </button>
                }
            />

            <main id="main">
                <div className="main-header">
                    <div className="main-title">
                        My Videos <span className="video-count-label">{filtered.length} published</span>
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

                <VideoGrid videos={filtered} onDelete={handleDeleteVideo} onOpenVideo={(video) => setSelectedVideo(video)} />
            </main>

            <CreatorsPanel
                userSearch={userSearch}
                onUserSearchChange={setUserSearch}
                isSearching={isSearching}
                searchLoading={searchLoading}
                displayedUsers={displayedUsers}
                onToggleFollow={handleToggleFollow}
                onOpenUser={(u) => {
                    console.log(u)

                    navigate({
                        to: `/users/${u.id}`,
                        params: {
                            userId: String(u.id)
                        },
                        state: {
                            initialFollowing: u.following
                        }
                    })
                }
                }
            />

            <button id="btn-new" onClick={() => setUploadOpen(true)}>
                <span className="plus">＋</span> New Video
            </button>

            {uploadOpen && userId && (
                <UploadModal
                    userId={userId}
                    onClose={() => setUploadOpen(false)}
                    onPublished={async () => {
                        setUploadOpen(false);
                        setActiveFilter("all");
                        await refreshVideos();
                        showToast("🎬 Video published successfully!");
                    }}
                    onError={(m) => showToast(m)}
                />
            )}

            {editOpen && userId && profile && (
                <EditProfileModal
                    userId={userId}
                    profile={profile}
                    avatarGrad={avatarGrad}
                    onClose={() => setEditOpen(false)}
                    onSaved={async () => {
                        setEditOpen(false);
                        await refreshAll(userId);
                        showToast("✅ Profile updated!");
                    }}
                    onError={(m) => showToast(m)}
                />
            )}

            {selectedVideo && (
                <VideoPlayerModal video={selectedVideo} userId={userId} onClose={() => setSelectedVideo(null)} />
            )}

            <Toast message={toast} />
        </div>
    );
}