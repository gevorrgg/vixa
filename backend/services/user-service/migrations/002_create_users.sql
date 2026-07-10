CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    followers_count INT NOT NULL DEFAULT 0
);

