import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../../lib/api-client";
import type { ApiProfile } from "./ProfilePage";

type Props = {
    userId: string;
    profile: ApiProfile;
    avatarGrad: string;
    onClose: () => void;
    onSaved: () => void;
    onError: (msg: string) => void;
};

const GENDERS = [
    { v: "male", label: "Male" },
    { v: "female", label: "Female" },
    { v: "non-binary", label: "Non-binary" },
    { v: "prefer-not", label: "Prefer not to say" },
];

function setPatch(patch: Record<string, unknown>, field: string, value: string) {
    patch[field] = value.trim();
}

export function EditProfileModal({ userId, profile, avatarGrad, onClose, onSaved, onError }: Props) {
    const [name, setName] = useState(profile.name ?? "");
    const [username, setUsername] = useState(profile.username);
    const [bio, setBio] = useState(profile.bio ?? "");
    const [location, setLocation] = useState(profile.location ?? "");
    const [website, setWebsite] = useState(profile.website ?? "");
    const [gender, setGender] = useState(profile.gender ?? "");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);
    const [avatarRemoved, setAvatarRemoved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [handleError, setHandleError] = useState<string | null>(null);
    const [drag, setDrag] = useState(false);
    const [uploadZoneOpen, setUploadZoneOpen] = useState(false); // новое: зона скрыта по умолчанию
    const fileRef = useRef<HTMLInputElement>(null);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
        document.addEventListener("keydown", onKey);
        document.body.classList.add("modal-open");
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.classList.remove("modal-open");
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        };
    }, [onClose]);

    function pickAvatar(f: File) {
        if (!f.type.startsWith("image/")) return onError("⚠️ Please select a valid image file");
        if (f.size > 5 * 1024 * 1024) return onError("⚠️ Image must be under 5MB");

        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

        const url = URL.createObjectURL(f);
        objectUrlRef.current = url;

        setAvatarFile(f);
        setAvatarPreview(url);
        setAvatarRemoved(false);
        setUploadZoneOpen(false); // файл выбран — можно снова свернуть зону
    }

    function removeAvatar() {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarRemoved(true);
        if (fileRef.current) fileRef.current.value = "";
    }

    // --- проверка на "есть ли изменения" ---
    const isDirty = useMemo(() => {
        const trimmedName = name.trim();
        const trimmedUsername = username.trim().toLowerCase();
        const trimmedBio = bio.trim();
        const trimmedLocation = location.trim();
        const trimmedWebsite = website.trim();

        if (trimmedName !== (profile.name ?? "").trim()) return true;
        if (trimmedUsername !== (profile.username ?? "").trim().toLowerCase()) return true;
        if (trimmedBio !== (profile.bio ?? "").trim()) return true;
        if (trimmedLocation !== (profile.location ?? "").trim()) return true;
        if (trimmedWebsite !== (profile.website ?? "").trim()) return true;
        if (gender !== (profile.gender ?? "")) return true;
        if (avatarFile) return true; // выбран новый файл
        if (avatarRemoved && profile.avatarUrl) return true; // аватар явно удалён

        return false;
    }, [name, username, bio, location, website, gender, avatarFile, avatarRemoved, profile]);

    async function save() {
        const finalUsername = username.trim().toLowerCase();
        if (!finalUsername) {
            setHandleError("Username is required");
            return;
        }
        if (!/^[a-z0-9_]{3,30}$/.test(finalUsername)) {
            setHandleError("3–30 chars, lowercase letters, numbers, or underscore");
            return;
        }
        setHandleError(null);
        setSaving(true);

        try {
            let avatarKey: string | undefined;
            if (avatarFile) {
                const type = encodeURIComponent(avatarFile.type);
                const signed = await apiFetch<{ uploadUrl: string; key: string }>(
                    `/api/users/${userId}/profile/avatar-upload-url?type=${type}`,
                );
                const res = await fetch(signed.uploadUrl, { method: "PUT", body: avatarFile });
                if (!res.ok) throw new Error("Failed to upload avatar");
                avatarKey = signed.key;
            }

            const patch: Record<string, unknown> = {};

            setPatch(patch, 'name', name)
            setPatch(patch, 'username', finalUsername)
            setPatch(patch, 'bio', bio)
            setPatch(patch, 'location', location)
            setPatch(patch, 'website', website)

            if (gender) patch.gender = gender;

            if (avatarKey) {
                patch.avatarKey = avatarKey;
            } else if (avatarRemoved && profile.avatarUrl) {
                patch.avatarKey = null;
            }

            await apiFetch(`/api/users/${userId}/profile`, {
                method: "PATCH",
                body: JSON.stringify(patch),
            });

            onSaved();
        } catch (err) {
            if (err instanceof Error) {
                const e = err as Error & { status?: number };
                if (e.status === 409) setHandleError("Username is already taken");
                else if (e.status === 400) setHandleError(e.message || "Invalid username");
                else onError(e.message || "Failed to update profile");
            } else {
                onError("Failed to update profile");
            }
        } finally {
            setSaving(false);
        }
    }

    const initials = (name.trim() || username || "?")
        .split(/\s+/)
        .map((w) => w[0] ?? "")
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal edit-modal">
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2>Edit Profile</h2>
                <p>Update your public creator profile</p>

                <div className="ep-avatar-section">
                    <div className="ep-avatar-left">
                        <div
                            className="ep-avatar-preview"
                            style={avatarPreview ? { background: "none" } : { background: avatarGrad }}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="" className="avatar-img-preview visible" />
                            ) : (
                                <span>{initials}</span>
                            )}
                            {avatarPreview && (
                                <button
                                    className="avatar-remove-btn visible"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeAvatar();
                                    }}
                                >✕</button>
                            )}
                        </div>
                    </div>
                    <div className="ep-avatar-right">
                        <strong style={{ fontSize: "0.85rem", display: "block", marginBottom: 10 }}>Avatar</strong>

                        {!uploadZoneOpen ? (
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => setUploadZoneOpen(true)}
                            >
                                Upload
                            </button>
                        ) : (
                            <div
                                className={`avatar-upload-zone${drag ? " dragover" : ""}`}
                                onClick={() => fileRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                                onDragLeave={() => setDrag(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDrag(false);
                                    const f = e.dataTransfer.files[0];
                                    if (f) pickAvatar(f);
                                }}
                            >
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => e.target.files?.[0] && pickAvatar(e.target.files[0])}
                                />
                                <div style={{ fontSize: "1.4rem" }}>🖼</div>
                                <p>{avatarFile ? avatarFile.name : "Click or drag to upload"}</p>
                                <small>JPG, PNG, WebP · max 5MB</small>
                            </div>
                        )}
                    </div>
                </div>

                <div className="ep-form-grid">
                    <div className="form-row">
                        <label className="form-label">Display name *</label>
                        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
                    </div>

                                  <div className="form-row">
                        <label className="form-label">Username</label>
                        <div className="handle-wrap">
                            <span className="handle-prefix">@</span>
                            <input
                                className="form-input handle-input"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    if (handleError) setHandleError(null);
                                }}
                                maxLength={30}
                                style={handleError ? { borderColor: "var(--accent2)" } : undefined}
                            />
                        </div>
                        {handleError && <div className="field-error-banner">{handleError}</div>}
                    </div>

                    <div className="form-row ep-full">
                        <label className="form-label">Bio</label>
                        <textarea
                            className="form-textarea"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={150}
                            placeholder="Tell the world about yourself…"
                        />
                        <div className="char-count"><span>{bio.length}</span>/150</div>
                    </div>

                    <div className="form-row ep-full">
                        <label className="form-label">Gender</label>
                        <div className="ep-gender-group">
                            {GENDERS.map((g) => (
                                <button
                                    key={g.v}
                                    className={`ep-gender-btn${gender === g.v ? " active" : ""}`}
                                    onClick={() => setGender(g.v)}
                                    type="button"
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <label className="form-label">Location</label>
                        <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
                    </div>
                    <div className="form-row">
                        <label className="form-label">Website</label>
                        <input className="form-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
                    {isDirty && (
                        <button className="btn-upload" onClick={save} disabled={saving}>
                            {saving ? "Saving…" : "💾 Save Changes"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}