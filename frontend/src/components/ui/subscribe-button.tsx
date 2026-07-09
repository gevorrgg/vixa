import { Check } from "lucide-react";

type SubscribeButtonProps = {
    subscribed: boolean;
    onToggle: () => void;
    size?: "sm" | "md";
};


export function SubscribeButton({ subscribed, onToggle, size = "md" }: SubscribeButtonProps) {
    return (
        <button
            className={`subscribe-btn subscribe-${size}${subscribed ? " subscribed" : ""}`}
            onClick={onToggle}
            aria-pressed={subscribed}
        >
            {subscribed ? (
                <>
                    <Check size={14} /> Subscribed
                </>
            ) : (
                "Subscribe"
            )}
        </button>
    );
}