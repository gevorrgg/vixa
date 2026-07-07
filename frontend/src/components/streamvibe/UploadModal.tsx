import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../../lib/api-client";

type Props = {
    userId: number;
    onClose: () => void;
    onPublished: () => void;
    onError: (msg: string) => void;
};

type PresignResponse = {
    content: { uploadUrl: string; key: string };
    thumbnail: { uploadUrl: string; key: string } | null;
};

export function UploadModal({ userId, onClose, onPublished, onError }: Props) {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbFile, setThumbFile] = useState<File | null>(null);
    const [thumbPreview, setThumbPreview] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("tutorial");
    const [submitting, setSubmitting] = useState(false);
    const [dragVideo, setDragVideo] = useState(false);
    const [dragThumb, setDragThumb] = useState(false);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKey);
        document.body.classList.add("modal-open");
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.classList.remove("modal-open");
        };
    }, [onClose]);

    function pickVideo(f: File) {
        if (!f.type.startsWith("video/")) {
            onError("⚠️ Please select a valid video file");
            return;
        }
        if (f.size / 1024 / 1024 > 4096) {
            onError("⚠️ Video must be under 4096MB");
            return;
        }
        setVideoFile(f);
    }
    function pickThumb(f: File) {
        if (!f.type.startsWith("image/")) {
            onError("⚠️ Please select a valid image file");
            return;
        }
        if (f.size / 1024 / 1024 > 5) {
            onError("⚠️ Thumbnail must be under 5MB");
            return;
        }
        setThumbFile(f);
        const r = new FileReader();
        r.onload = (e) => setThumbPreview(String(e.target?.result ?? ""));
        r.readAsDataURL(f);
    }

    async function publish() {
        if (!title.trim()) {
            onError("⚠️ Please give your video a title");
            return;
        }
        if (!videoFile) {
            onError("⚠️ Please select a video file");
            return;
        }
        setSubmitting(true);
        try {
            const presign = await apiFetch<PresignResponse>(
                `/api/users/${userId}/videos/upload-url`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        contentType: videoFile.type,
                        thumbnailType: thumbFile?.type ?? null,
                    }),
                },
            );

             console.log(presign)

            const vRes = await fetch(presign.content.uploadUrl, { method: "PUT", body: videoFile });
            if (!vRes.ok) throw new Error("Failed to upload video");

            let thumbnailKey: string | null = null;
            if (thumbFile && presign.thumbnail) {
                const tRes = await fetch(presign.thumbnail.uploadUrl, { method: "PUT", body: thumbFile });
                if (!tRes.ok) throw new Error("Failed to upload thumbnail");
                thumbnailKey = presign.thumbnail.key;
            }


            await apiFetch(`/api/users/${userId}/videos`, {
                method: "POST",
                body: JSON.stringify({
                    title: title.trim(),
                    description: desc.trim(),
                    category,
                    contentKey: presign.content.key,
                    thumbnailKey,
                    duration: 0,
                }),
            });

            onPublished();
        } catch (err) {
            onError(err instanceof Error ? `⚠️ ${err.message}` : "⚠️ Failed to publish video");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2>🎬 Upload New Video</h2>
                <p>Share your content with the world</p>

                {/* Video drop zone */}
                <div
                    className={`drop-zone${dragVideo ? " dragover" : ""}`}
                    onClick={() => videoInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragVideo(true); }}
                    onDragLeave={() => setDragVideo(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragVideo(false);
                        const f = e.dataTransfer.files[0];
                        if (f) pickVideo(f);
                    }}
                >
                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        style={{ display: "none" }}
                        onChange={(e) => e.target.files?.[0] && pickVideo(e.target.files[0])}
                    />
                    <div className="drop-icon">{videoFile ? "✅" : "📹"}</div>
                    <h3>{videoFile ? videoFile.name : "Drag & drop your video here"}</h3>
                    <small>
                        {videoFile
                            ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB · Ready to upload`
                            : "or click to browse · MP4, MOV, AVI up to 4GB"}
                    </small>
                </div>

                <div className="form-row">
                    <label className="form-label">Thumbnail (optional)</label>
                    <div
                        className={`thumb-zone${dragThumb ? " dragover" : ""}`}
                        onClick={() => thumbInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragThumb(true); }}
                        onDragLeave={() => setDragThumb(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragThumb(false);
                            const f = e.dataTransfer.files[0];
                            if (f) pickThumb(f);
                        }}
                    >
                        <input
                            ref={thumbInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => e.target.files?.[0] && pickThumb(e.target.files[0])}
                        />
                        {thumbPreview ? (
                            <>
                                <img src={thumbPreview} alt="Thumbnail preview" className="thumb-preview" />
                                <button
                                    className="thumb-remove"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setThumbFile(null);
                                        setThumbPreview(null);
                                    }}
                                >✕</button>
                            </>
                        ) : (
                            <div className="thumb-placeholder">
                                <div style={{ fontSize: "1.6rem" }}>🖼</div>
                                <p>Click or drag to upload · max 5MB</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <label className="form-label">Title *</label>
                    <input
                        className="form-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                        placeholder="Give your video a great title…"
                    />
                </div>

                <div className="form-row">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-textarea"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="What's this video about?"
                    />
                </div>

                <div className="form-row">
                    <label className="form-label">Category</label>
                    <select
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="tutorial">Tutorial</option>
                        <option value="vlog">Vlog</option>
                        <option value="music">Music</option>
                        <option value="gaming">Gaming</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose} disabled={submitting}>Cancel</button>
                    <button className="btn-upload" onClick={publish} disabled={submitting}>
                        {submitting ? "Uploading…" : "🚀 Publish Video"}
                    </button>
                </div>
            </div>
        </div>
    );
}
