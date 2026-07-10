const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")
const path = require("path");

const app = express()

app.use(
    "/api/users",
    createProxyMiddleware({
        target: process.env.USER_SERVICE_URL,
        changeOrigin: true,
    }),
)

app.use(
    "/api/videos",
    createProxyMiddleware({
        target: process.env.VIDEO_SERVICE_URL,
        changeOrigin: true,
    }),
)

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
})


module.exports = app