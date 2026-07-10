
CREATE TABLE views (
    id SERIAL PRIMARY KEY,

    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    video_id INT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

    watched_at TIMESTAMP DEFAULT NOW(),

    watch_time INT DEFAULT 0
);