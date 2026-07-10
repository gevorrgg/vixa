import { useState } from "react";
import { Check } from "lucide-react";

type SubscribeButtonProps = {
    subscribed: boolean;
    onToggle: () => Promise<void>;
    size?: "sm" | "md";
};

export function SubscribeButton({
    subscribed,
    onToggle,
    size = "md",
}: SubscribeButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        if (loading) {
            return;
        }

        try {
            setLoading(true);
            await onToggle();
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            className={`subscribe-btn subscribe-${size}${subscribed ? " subscribed" : ""}`}
            onClick={handleClick}
            aria-pressed={subscribed}
            disabled={loading}
        >
            {loading ? (
                "Loading..."
            ) : subscribed ? (
                <>
                    <Check size={14} />
                    Subscribed
                </>
            ) : (
                "Subscribe"
            )}
        </button>
    );
}