export const GRADIENTS = [
    "linear-gradient(135deg,#a259ff,#ff5c87)",
    "linear-gradient(135deg,#00d4ff,#a259ff)",
    "linear-gradient(135deg,#ff5c87,#ffa45c)",
    "linear-gradient(135deg,#2dde98,#00d4ff)",
    "linear-gradient(135deg,#ffa45c,#ff5c87)",
    "linear-gradient(135deg,#a259ff,#00d4ff)",
];

export const TAGS: Record<string, { label: string; cls: string }> = {
    music: { label: "Music", cls: "tag-cyan" },
    gaming: { label: "Gaming", cls: "tag-green" },
    tutorial: { label: "Tutorial", cls: "tag-blue" },
    vlog: { label: "Vlog", cls: "tag-pink" },
    other: { label: "Other", cls: "tag-purple" },
};

export const TRENDING = [
    { title: "AI Generated Art – Prompt Engineering Secrets", views: "1.2M", emoji: "🎨", grad: 4 },
    { title: "100 Days of Code – Final Results", views: "892K", emoji: "💻", grad: 0 },
    { title: "Street Food Tour – Tokyo Night Market", views: "2.1M", emoji: "🍜", grad: 2 },
    { title: "Minimal Room Makeover on $200 Budget", views: "544K", emoji: "🏡", grad: 3 },
];

export const FILTER_CHIPS: [string, string][] = [
    ["all", "All"],
    ["tutorial", "Tutorials"],
    ["vlog", "Vlogs"],
    ["music", "Music"],
    ["gaming", "Gaming"],
];