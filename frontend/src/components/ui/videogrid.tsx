import { useState } from "react";
import type { ApiVideo } from "../streamvibe/profile/types/profile.types";
import { GRADIENTS, TAGS } from "../streamvibe/profile/constants/profile.constants";
import { VideoCardMenu } from "./videocardmenu";

type VideoGridProps = {
    videos: ApiVideo[];
    onDelete: (id: number) => void;
    onOpenVideo: (video: ApiVideo) => void;
    /** Показывать меню Edit/Delete (только на своей странице). По умолчанию true. */
    showActions?: boolean;
};

export function VideoGrid({ videos, onDelete, onOpenVideo, showActions = true }: VideoGridProps) {
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
                    <div className="video-card" key={v.id}>
                        <div className="video-thumb" style={thumbStyle} onClick={() => onOpenVideo(v)}>
                            {!v.thumbnailUrl && <span className="video-emoji">{v.emoji}</span>}
                            <span className="play-btn">▶</span>
                            <span className="video-duration">{v.duration}</span>
                        </div>
                        <div className="video-info">
                            <div className={`video-tag ${tag.cls}`}>{tag.label}</div>
                            <h4 className="video-title">{v.title}</h4>
                            <div className="video-meta-row">
                                <div className="video-meta">
                                    <span>{v.views}</span>
                                    <span>{v.date}</span>
                                </div>
                                {showActions && (
                                    <VideoCardMenu
                                        isOpen={openMenuId === v.id}
                                        onToggle={() => setOpenMenuId((cur) => (cur === v.id ? null : v.id))}
                                        onClose={() => setOpenMenuId(null)}
                                        onEdit={() => {
                                            setOpenMenuId(null);
                                        }}
                                        onDelete={() => {
                                            setOpenMenuId(null);
                                            onDelete(v.id);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}