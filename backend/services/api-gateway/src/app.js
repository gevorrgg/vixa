const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();

app.use(
    "/api/users",
    createProxyMiddleware({
        target: process.env.USER_SERVICE_URL,
        changeOrigin: true,
    }),
);

app.use(
    "/api/videos",
    createProxyMiddleware({
        target: process.env.VIDEO_SERVICE_URL,
        changeOrigin: true,
    }),
);

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

module.exports = app;