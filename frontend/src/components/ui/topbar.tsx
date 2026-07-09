import { LogOut, LogIn } from "lucide-react";
import type { ApiProfile } from "../streamvibe/profile/types/profile.types";
import { initialsOf } from "../streamvibe/profile/utils/format";

type TopBarProps = {
    isAuthenticated: boolean;
    profile: ApiProfile | null;
    avatarGrad: string;
    onOpenOwnProfile: () => void;
    onSignOut: () => void;
    onSignIn: () => void;
};

export function TopBar({ isAuthenticated, profile, avatarGrad, onOpenOwnProfile, onSignOut, onSignIn }: TopBarProps) {
    const displayName = profile?.name || profile?.username || "";

    return (
        <header id="topbar">
            <div className="logo">
                Stream<span>Vibe</span>
            </div>

            <div className="topbar-actions">
                {isAuthenticated ? (
                    <>
                        <button
                            className="top-avatar"
                            onClick={onOpenOwnProfile}
                            title="My profile"
                            style={profile?.avatarUrl ? { background: "none" } : { background: avatarGrad }}
                        >
                            {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : initialsOf(displayName)}
                        </button>

                        <button className="btn-icon signout-icon" onClick={onSignOut} title="Sign out">
                            <LogOut size={20} />
                        </button>
                    </>
                ) : (
                    <button className="btn-signin" onClick={onSignIn}>
                        <LogIn size={18} />
                        Sign in
                    </button>
                )}
            </div>
        </header>
    );
}