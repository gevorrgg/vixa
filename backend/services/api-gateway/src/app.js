const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();

const apiProxy = createProxyMiddleware({
    changeOrigin: true,

    router(req) {
        if (req.originalUrl.startsWith("/api/videos")) {
            return process.env.VIDEO_SERVICE_URL;
        }

        return process.env.USER_SERVICE_URL;
    },

    pathRewrite(path, req) {
        return req.originalUrl;
    },

    on: {
        proxyReq(proxyReq, req) {
            console.log(
                `[proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`
            );
        },

        error(error, req, res) {
            console.error("[proxy error]", error.message);

            if (!res.headersSent) {
                res.status(502).json({
                    ok: false,
                    message: "Service unavailable",
                    error: error.message,
                });
            }
        },
    },
});

app.use("/api", apiProxy);

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

module.exports = app;