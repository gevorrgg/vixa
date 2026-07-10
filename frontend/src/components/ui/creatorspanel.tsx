import type { ApiUserResult } from "../streamvibe/profile/types/profile.types";
import { gradFromId, humanReadable, initialsOf } from "../streamvibe/profile/utils/format";


import { SubscribeButton } from "./subscribe-button";

type CreatorsPanelProps = {
    userSearch: string;
    onUserSearchChange: (value: string) => void;
    isSearching: boolean;
    searchLoading: boolean;
    displayedUsers: ApiUserResult[];
    onToggleFollow: (targetId: number) => Promise<void>;
    onOpenUser: (user: ApiUserResult) => void;
};

export function CreatorsPanel({
    userSearch,
    onUserSearchChange,
    isSearching,
    searchLoading,
    displayedUsers,
    onToggleFollow,
    onOpenUser,
}: CreatorsPanelProps) {
    return (
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
                        onChange={(e) => onUserSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="user-results">
                {searchLoading && <p className="empty-muted">Searching…</p>}
                {!searchLoading && displayedUsers.length === 0 && (
                    <p className="empty-muted">{isSearching ? "No users found" : "No recommendations yet"}</p>
                )}
                {!searchLoading &&
                    displayedUsers.map((u) => {
                        const name = u.name || u.username;
                        return (
                            <div className="user-row" key={u.id}>
                                <div
                                    className="user-avatar"
                                    style={{ background: gradFromId(u.id) }}
                                    onClick={() => onOpenUser(u)}
                                >
                                    {u.avatarUrl ? <img src={u.avatarUrl} alt="" /> : initialsOf(name)}
                                </div>
                                <div className="user-meta">
                                    <div className="user-name">{name}</div>
                                    <div className="user-sub">
                                        @{u.username} · {humanReadable(u.followers)} subs
                                    </div>
                                </div>
                                <SubscribeButton subscribed={u.following} onToggle={async () => await onToggleFollow(u.id)} size="sm" />
                            </div>
                        );
                    })}
            </div>
        </aside>
    );
}