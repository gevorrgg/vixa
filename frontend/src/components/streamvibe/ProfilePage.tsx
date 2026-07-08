import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { apiFetch, clearAuthSession, getStoredAuthSession, getStoredAuthUser } from "../../lib/api-client";
import { UploadModal } from "./UploadModal";
import { EditProfileModal } from "./EditProfileModal";
import { Toast, useToast } from "./Toast";
import { VideoPlayerModal } from "./VideoPlayerModal";

/* ── constants ports of the original script ─────────────────────────── */
const GRADIENTS = [
    "linear-gradient(135deg,#a259ff,#ff5c87)",
    "linear-gradient(135deg,#00d4ff,#a259ff)",
    "linear-gradient(135deg,#ff5c87,#ffa45c)",
    "linear-gradient(135deg,#2dde98,#00d4ff)",
    "linear-gradient(135deg,#ffa45c,#ff5c87)",
    "linear-gradient(135deg,#a259ff,#00d4ff)",
];

const TAGS: Record<string, { label: string; cls: string }> = {
    music: { label: "Music", cls: "tag-cyan" },
    gaming: { label: "Gaming", cls: "tag-green" },
    tutorial: { label: "Tutorial", cls: "tag-blue" },
    vlog: { label: "Vlog", cls: "tag-pink" },
    other: { label: "Other", cls: "tag-purple" },
};

const USERS = [
    { name: "Mia Chen", handle: "@mia_creates", subs: "212K", color: "#a259ff", init: "M", following: false },
    { name: "Jordan Lee", handle: "@jordantech", subs: "88K", color: "#ff5c87", init: "J", following: false },
    { name: "Sam Torres", handle: "@samvisuals", subs: "1.4M", color: "#00d4ff", init: "S", following: true },
    { name: "Priya Kapoor", handle: "@priyabeats", subs: "340K", color: "#2dde98", init: "P", following: false },
    { name: "Luca Romano", handle: "@lucaromano", subs: "57K", color: "#ffa45c", init: "L", following: false },
    { name: "Aiko Tanaka", handle: "@aikocreates", subs: "920K", color: "#ff5c87", init: "A", following: false },
];

const TRENDING = [
    { title: "AI Generated Art – Prompt Engineering Secrets", views: "1.2M", emoji: "🎨", grad: 4 },
    { title: "100 Days of Code – Final Results", views: "892K", emoji: "💻", grad: 0 },
    { title: "Street Food Tour – Tokyo Night Market", views: "2.1M", emoji: "🍜", grad: 2 },
    { title: "Minimal Room Makeover on $200 Budget", views: "544K", emoji: "🏡", grad: 3 },
];

/* ── types ──────────────────────────────────────────────────────────── */
export type ApiVideo = {
    id: number;
    title: string;
    category: string;
    views: string;
    date: string;
    duration: string;
    emoji: string;
    grad: number;
    thumbnailUrl: string | null;
    contentUrl: string
};

export type ApiProfile = {
    id: number;
    username: string;
    name: string | null;
    bio: string | null;
    gender: string | null;
    location: string | null;
    website: string | null;
    avatarUrl: string | null;
};

type ApiStats = { videosCount: number; followersCount: number; totalViews: number };

/* ── helpers ────────────────────────────────────────────────────────── */
function hash(str: string): number {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
function gradFromId(id: number): string {
    return `hsl(${hash(`${id}`) % 360}, 70%, 60%)`;
}
function initialsOf(name: string): string {
    return (
        name
            .trim()
            .split(/\s+/)
            .map((w) => w[0] ?? "")
            .slice(0, 2)
            .join("")
            .toUpperCase() || "?"
    );
}
function humanReadable(n: number): string {
    if (n < 1000) return String(n);
    if (n < 1_000_000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    if (n < 1_000_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
}

/* ── main ───────────────────────────────────────────────────────────── */
export function ProfilePage() {
    const navigate = useNavigate();
    const { toast, showToast } = useToast();

    const [userId, setUserId] = useState<number | null>(null);
    const [profile, setProfile] = useState<ApiProfile | null>(null);
    const [stats, setStats] = useState<ApiStats>({ videosCount: 0, followersCount: 0, totalViews: 0 });
    const [videos, setVideos] = useState<ApiVideo[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<ApiVideo | null>(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [uploadOpen, setUploadOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [userSearch, setUserSearch] = useState("");
    const [userList, setUserList] = useState(USERS);


    /* ── load auth + data ─────────────────────────────────────────────── */
    useEffect(() => {
        const session = getStoredAuthSession();


        const storedUserId =
            typeof session?.user?.id === "number" ? session.user.id : null

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

    const refreshAll = useCallback(async (uid: number) => {
        const [p, s, v] = await Promise.all([
            apiFetch<ApiProfile>(`/api/users/${uid}/profile`),
            apiFetch<ApiStats>(`/api/users/${uid}/stats`),
            apiFetch<{ videos: ApiVideo[] }>(`/api/users/${uid}/videos`),
        ]);
        setProfile(p);
        setStats(s);
        setVideos(v.videos);
    }, []);

    useEffect(() => {
        if (userId) void refreshAll(userId);
    }, [userId, refreshAll]);

    const refreshVideos = useCallback(async () => {
        if (!userId) return;
        const [s, v] = await Promise.all([
            apiFetch<ApiStats>(`/api/users/${userId}/stats`),
            apiFetch<{ videos: ApiVideo[] }>(`/api/users/${userId}/videos`),
        ]);
        setStats(s);
        setVideos(v.videos);
    }, [userId]);

    /* ── computed ─────────────────────────────────────────────────────── */
    const filtered = useMemo(
        () => (activeFilter === "all" ? videos : videos.filter((v) => v.category === activeFilter)),
        [videos, activeFilter],
    );

    const filteredUsers = useMemo(() => {
        const q = userSearch.toLowerCase();
        return userList.filter(
            (u) => u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q),
        );
    }, [userList, userSearch]);

    const avatarGrad = useMemo(() => (userId ? gradFromId(userId) : ""), [userId]);
    const displayName = profile?.name || profile?.username || "";

    /* ── handlers ─────────────────────────────────────────────────────── */
    function handleSignOut() {
        clearAuthSession();
        navigate({ to: "/auth", replace: true });
    }

    function toggleFollow(idx: number) {
        setUserList((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], following: !next[idx].following };
            showToast(next[idx].following ? `Following ${next[idx].name}!` : `Unfollowed ${next[idx].name}`);
            return next;
        });
    }

    /* ── render ───────────────────────────────────────────────────────── */
    if (!userId || !profile) {
        return (
            <div className="loading-screen">
                <div className="logo">Stream<span>Vibe</span></div>
            </div>
        );
    }

    return (
        <div className="app-shell">
            {/* TOP BAR */}
            <header id="topbar">
                <div className="logo">Stream<span>Vibe</span></div>
                <button className="btn-signout" onClick={handleSignOut}>Sign out</button>
            </header>

            {/* SIDEBAR */}
            <aside id="sidebar">
                <div className="profile-card">
                    <div className="avatar-wrap">
                        <div
                            className="avatar"
                            style={
                                profile.avatarUrl
                                    ? { background: "none" }
                                    : { background: avatarGrad }
                            }
                        >
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="" />
                            ) : (
                                initialsOf(displayName)
                            )}
                        </div>
                        <span className="online-dot" />
                    </div>
                    <div className="profile-name">{displayName}</div>
                    <div className="profile-handle">@{profile.username} · Creator</div>
                    {profile.bio && <div className="profile-bio-display">{profile.bio}</div>}
                    <div className="profile-meta-row">
                        {profile.location && <span className="meta-item">{profile.location}</span>}
                        {profile.website && (
                            <span className="meta-item">
                                <a href={/^https?:\/\//.test(profile.website) ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer">
                                    🔗 {profile.website.replace(/^https?:\/\//, "")}
                                </a>
                            </span>
                        )}
                    </div>
                    <div className="profile-stats">
                        <div className="stat"><div className="stat-num">{humanReadable(stats.videosCount)}</div><div className="stat-label">Videos</div></div>
                        <div className="stat"><div className="stat-num">{humanReadable(stats.followersCount)}</div><div className="stat-label">Followers</div></div>
                        <div className="stat"><div className="stat-num">{humanReadable(stats.totalViews)}</div><div className="stat-label">Views</div></div>
                    </div>
                    <button className="btn-edit" onClick={() => setEditOpen(true)}>Edit Profile</button>
                </div>
                <nav className="nav-section">
                    <div className="nav-label">Menu</div>
                    <div className="nav-item active"><span className="nav-icon">🎬</span> My Videos</div>
                    <div className="nav-item"><span className="nav-icon">📊</span> Analytics</div>
                    <div className="nav-item"><span className="nav-icon">💬</span> Comments</div>
                    <div className="nav-item"><span className="nav-icon">❤️</span> Liked</div>
                    <div className="nav-item"><span className="nav-icon">🔖</span> Saved</div>
                    <div className="nav-item"><span className="nav-icon">⚙️</span> Settings</div>
                </nav>
            </aside>

            {/* MAIN */}
            <main id="main">
                <div className="main-header">
                    <div className="main-title">
                        My Videos <span className="video-count-label">{filtered.length} published</span>
                    </div>
                </div>

                <div className="filter-chips">
                    {[
                        ["all", "All"],
                        ["tutorial", "Tutorials"],
                        ["vlog", "Vlogs"],
                        ["music", "Music"],
                        ["gaming", "Gaming"],
                    ].map(([k, l]) => (
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
                    onDelete={(id) => setVideos((v) => v.filter((x) => x.id !== id))}
                    onOpenVideo={(video) => setSelectedVideo(video)}
                />
            </main>

            {/* RIGHT PANEL */}
            <aside id="right-panel">
                <div>
                    <div className="panel-label">Find Creators</div>
                    <div className="search-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Search users…"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="user-results">
                    {filteredUsers.length === 0 && <p className="empty-muted">No users found</p>}
                    {filteredUsers.map((u) => {
                        const idx = userList.indexOf(u);
                        return (
                            <div className="user-row" key={u.handle}>
                                <div className="user-avatar" style={{ background: u.color }}>{u.init}</div>
                                <div className="user-meta">
                                    <div className="user-name">{u.name}</div>
                                    <div className="user-sub">{u.handle} · {u.subs} subs</div>
                                </div>
                                <button
                                    className={`follow-btn${u.following ? " following" : ""}`}
                                    onClick={() => toggleFollow(idx)}
                                >
                                    {u.following ? "✓ Following" : "+ Follow"}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div>
                    <div className="panel-label">Trending Now</div>
                    <div className="trending-list">
                        {TRENDING.map((t) => (
                            <div className="trending-item" key={t.title}>
                                <div className="trending-thumb" style={{ background: GRADIENTS[t.grad % GRADIENTS.length] }}>
                                    {t.emoji}
                                </div>
                                <div className="trending-meta">
                                    <div className="trending-title">{t.title}</div>
                                    <div className="trending-views">{t.views}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

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
                <VideoPlayerModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}

            <Toast message={toast} />
        </div>
    );
}

/* ── grid ───────────────────────────────────────────────────────────── */
function VideoGrid({
    videos,
    onDelete,
    onOpenVideo,
}: {
    videos: ApiVideo[];
    onDelete: (id: number) => void;
    onOpenVideo: (video: ApiVideo) => void;
}) {
    // id открытого меню (только одно меню может быть открыто одновременно)
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    if (videos.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">🎬</div>
                <h3>No videos here yet</h3>
                <p>Upload your first video!</p>
            </div>
        );
    }

    return (
        <div className="video-grid">
            {videos.map((v) => {
                const tag = TAGS[v.category] ?? TAGS.other;
                const thumbStyle = v.thumbnailUrl
                    ? { backgroundImage: `url('${v.thumbnailUrl}')`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: GRADIENTS[v.grad % GRADIENTS.length] };
                return (
                    <div
                        className="video-card"
                        key={v.id}
                        onClick={() => onOpenVideo(v)}
                    >
                        <div className="video-thumb" style={thumbStyle}>
                            {!v.thumbnailUrl && <span className="video-emoji">{v.emoji}</span>}
                            <span className="play-btn">▶</span>
                            <span className="video-duration">{v.duration}</span>
                        </div>
                        <div className="video-info">
                            <div className={`video-tag ${tag.cls}`}>{tag.label}</div>
                            <h4 className="video-title">{v.title}</h4>
                            <div className="video-meta-row">
                                <div className="video-meta">
                                    <span>👁 {v.views}</span>
                                    <span>{v.date}</span>
                                </div>
                                <VideoCardMenu
                                    isOpen={openMenuId === v.id}
                                    onToggle={() => setOpenMenuId((cur) => (cur === v.id ? null : v.id))}
                                    onClose={() => setOpenMenuId(null)}
                                    onEdit={() => {
                                        setOpenMenuId(null);
                                        // TODO: подключить редактирование видео
                                    }}
                                    onDelete={() => {
                                        setOpenMenuId(null);
                                        onDelete(v.id);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ── меню действий (Edit / Delete) для карточки видео ────────────────── */
function VideoCardMenu({
    isOpen,
    onToggle,
    onClose,
    onEdit,
    onDelete,
}: {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(e: MouseEvent) {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        function handleEscape(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    return (
        <div className="video-menu-wrap" ref={wrapRef}>
            <button
                className="btn-icon video-menu-trigger"
                aria-label="More options"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
            >
                ⋮
            </button>
            {isOpen && (
                <div className="video-menu-dropdown" role="menu">
                    <button className="video-menu-item" role="menuitem" onClick={onEdit}>
                        Edit
                    </button>
                    <button className="video-menu-item delete" role="menuitem" onClick={onDelete}>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}