import { useEffect, useRef } from "react";

type VideoCardMenuProps = {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export function VideoCardMenu({ isOpen, onToggle, onClose, onEdit, onDelete }: VideoCardMenuProps) {
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