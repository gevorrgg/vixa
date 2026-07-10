CREATE TABLE likes (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id INT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, video_id)
);