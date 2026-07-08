import { useEffect, useRef } from "react";
import type { ApiVideo } from "./ProfilePage";

export function VideoPlayerModal({
    video,
    onClose,
}: {
    video: ApiVideo;
    onClose: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // закрытие по Escape
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
                    <h3 className="video-player-title">{video.title}</h3>
                    <div className="video-player-meta">
                        <span>👁 {video.views}</span>
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