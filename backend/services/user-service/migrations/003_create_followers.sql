CREATE TABLE followers (
    follower_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT NOW(),

    PRIMARY KEY (follower_id, following_id),

    CHECK (follower_id <> following_id)
);
