import { useEffect, useRef, useState } from "react";
import type { ApiVideo } from "./ProfilePage";
import { apiFetch } from "../../lib/api-client";

export function VideoPlayerModal({
    video,
    userId,
    onClose,
}: {
    video: ApiVideo;
    userId: number | null;
    onClose: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(video.likes ?? 0);
    const [likePending, setLikePending] = useState(false);

    useEffect(() => {
        async function checkLikeStatus() {
            try {
                const result = await apiFetch<{ liked: boolean }>(
                    `/api/users/${userId}/videos/${video.id}/like-status`
                );

                setLiked(result.liked);
            } catch (err) {
                console.error("Failed to check like status", err);
            }
        }

        checkLikeStatus();
    }, [video.id, userId]);

    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    // автовоспроизведение при открытии
    useEffect(() => {
        videoRef.current?.play().catch(() => {
            // автоплей может быть заблокирован браузером — это нормально
        });
    }, []);

    async function toggleLike() {
        // защита от повторных кликов, пока предыдущий запрос ещё не завершился —
        // иначе уходит несколько POST/DELETE подряд и счётчик лайков "скачет"
        if (likePending) return;

        const nextLiked = !liked;

        // оптимистичное обновление UI, с откатом при ошибке
        setLiked(nextLiked);
        setLikesCount((count) => count + (nextLiked ? 1 : -1));
        setLikePending(true);

        try {
            await apiFetch(`/api/users/${userId}/videos/${video.id}/like`, {
                method: nextLiked ? "POST" : "DELETE",
            });
        } catch (err) {
            console.error("Failed to toggle like", err);
            // откатываем состояние назад, раз запрос не прошёл
            setLiked(!nextLiked);
            setLikesCount((count) => count - (nextLiked ? 1 : -1));
        } finally {
            setLikePending(false);
        }
    }

    return (
        <div
            className="video-player-overlay"
            onClick={onClose}
        >
            <div
                className="video-player-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="video-player-close" onClick={onClose} aria-label="Close player">
                    ✕
                </button>

                <div className="video-player-stage">
                    {video.contentUrl ? (
                        <video
                            ref={videoRef}
                            className="video-player-el"
                            src={video.contentUrl}
                            controls
                            autoPlay
                        />
                    ) : (
                        <div
                            className="video-player-placeholder"
                            style={{ background: GRADIENT_FALLBACK(video.grad) }}
                        >
                            <span className="video-player-emoji">{video.emoji}</span>
                            <p>Видео недоступно для воспроизведения</p>
                        </div>
                    )}
                </div>

                <div className="video-player-info">
                    <div className="video-player-header-row">
                        <h3 className="video-player-title">{video.title}</h3>
                        <button
                            className={`video-like-btn${liked ? " liked" : ""}`}
                            onClick={toggleLike}
                            disabled={likePending}
                            aria-pressed={liked}
                            aria-label={liked ? "Unlike" : "Like"}
                        >
                            <span className="video-like-icon">{liked ? "❤️" : "🤍"}</span>
                            <span className="video-like-count">{formatLikes(likesCount)}</span>
                        </button>
                    </div>
                    <div className="video-player-meta">
                        <span>{video.views}</span>
                        <span>{video.date}</span>
                        <span>{video.duration}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const GRADIENTS = [
    "linear-gradient(135deg,#a259ff,#ff5c87)",
    "linear-gradient(135deg,#00d4ff,#a259ff)",
    "linear-gradient(135deg,#ff5c87,#ffa45c)",
    "linear-gradient(135deg,#2dde98,#00d4ff)",
    "linear-gradient(135deg,#ffa45c,#ff5c87)",
    "linear-gradient(135deg,#a259ff,#00d4ff)",
];

function GRADIENT_FALLBACK(grad: number): string {
    return GRADIENTS[grad % GRADIENTS.length];
}

function formatLikes(n: number): string {
    if (n < 0) return "0";
    if (n < 1000) return String(n);
    if (n < 1_000_000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
}