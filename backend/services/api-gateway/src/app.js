const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(
    "/api",
    createProxyMiddleware({
        changeOrigin: true,
        proxyTimeout: 15000,
        timeout: 15000,

        router(req) {
            const url = req.originalUrl;

            if (
                /^\/api\/users\/\d+\/videos(?:\/|$)/.test(url) ||
                url.startsWith("/api/videos")
            ) {
                return process.env.VIDEO_SERVICE_URL;
            }

            if (
                /^\/api\/users\/\d+\/recommendations(?:\/|$)/.test(url)
            ) {
                return process.env.RECOMMENDATION_SERVICE_URL;
            }

            return process.env.USER_SERVICE_URL;
        },

        pathRewrite(path, req) {
            return req.originalUrl;
        },

        on: {
            proxyReq(proxyReq, req) {
                console.log(
                    `[proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.host}${proxyReq.path}`,
                );
            },

            error(err, req, res) {
                console.error(
                    `[proxy error] ${req.method} ${req.originalUrl}:`,
                    err.message,
                );

                if (!res.headersSent) {
                    res.status(502).json({
                        ok: false,
                        message: "Service unavailable",
                    });
                }
            },
        },
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