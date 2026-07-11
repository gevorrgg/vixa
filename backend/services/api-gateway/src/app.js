const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
require("dotenv").config();

const app = express();

const onProxyError = (err, req, res) => {
    console.error(
        `Proxy error for ${req.method} ${req.originalUrl}:`,
        err.message,
    );

    if (!res.headersSent) {
        res.status(502).json({
            ok: false,
            error: "Bad gateway",
            details: err.message,
        });
    }
};

const makeProxy = (targetEnvVar) => {
    const target = process.env[targetEnvVar];

    if (!target) {
        throw new Error(`${targetEnvVar} is not defined`);
    }

    try {
        new URL(target);
    } catch {
        throw new Error(
            `${targetEnvVar} must be a valid URL, received: ${target}`,
        );
    }

    return createProxyMiddleware({
        target,
        changeOrigin: true,
        proxyTimeout: 15000,
        timeout: 15000,

        on: {
            proxyReq(proxyReq, req) {
                console.log(
                    `[proxy] ${req.method} ${req.originalUrl} -> ${target}${req.originalUrl}`,
                );
            },

            error: onProxyError,
        },
    });
};

app.use("/api/auth", makeProxy("USER_SERVICE_URL"));
app.use("/api/videos", makeProxy("VIDEO_SERVICE_URL"));
app.use("/api/users", makeProxy("USER_SERVICE_URL"));

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

module.exports = app;