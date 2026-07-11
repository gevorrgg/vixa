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
    education: { label: "Education", cls: "tag-blue" },
    sports: { label: "Sports", cls: "tag-red" },
    tech: { label: "Tech", cls: "tag-purple" },
    entertainment: { label: "Entertainment", cls: "tag-orange" },
    vlog: { label: "Vlog", cls: "tag-pink" },
    social: { label: "Social", cls: "tag-yellow" },
    kids: { label: "Kids", cls: "tag-lime" },
    news: { label: "News", cls: "tag-gray" },
};

export const FILTER_CHIPS: [string, string][] = [
    ["all", "All"],
    ["music", "Music"],
    ["gaming", "Gaming"],
    ["education", "Education"],
    ["sports", "Sports"],
    ["tech", "Tech"],
    ["entertainment", "Entertainment"],
    ["vlog", "Vlog"],
    ["social", "Social"],
    ["kids", "Kids"],
    ["news", "News"],
];