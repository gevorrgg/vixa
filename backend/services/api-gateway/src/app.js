const express = require("express");
const { createProxyMiddleware, fixRequestBody } = require("http-proxy-middleware");
const path = require("path");

const app = express();

// Общий обработчик ошибок для прокси, чтобы запросы не висели вечно
const onProxyError = (err, req, res) => {
    console.error(`Proxy error for ${req.method} ${req.originalUrl}:`, err.message);
    if (!res.headersSent) {
        res.status(502).json({ error: "Bad gateway", details: err.message });
    }
};

const makeProxy = (targetEnvVar) =>
    createProxyMiddleware({
        // router вместо target — читает env-переменную заново на каждый запрос,
        // а не один раз при старте сервера (актуально, если .env грузится с задержкой)
        router: () => {
            const target = process.env[targetEnvVar];
            if (!target) {
                console.error(`${targetEnvVar} is not defined!`);
            }
            return target;
        },
        changeOrigin: true,
        proxyTimeout: 15000,
        timeout: 15000,
        on: {
            proxyReq: fixRequestBody, // критично: пере-сериализует body, если express.json() уже распарсил его
            error: onProxyError,
        },
    });

app.use("/api/auth", makeProxy("USER_SERVICE_URL"));
app.use("/api/users", makeProxy("USER_SERVICE_URL"));
app.use("/api/videos", makeProxy("VIDEO_SERVICE_URL"));

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

module.exports = app;