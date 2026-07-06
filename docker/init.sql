CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE
);

CREATE TYPE gender AS ENUM (
  'male',
  'female',
  'non_binary',
  'prefer_not_to_say'
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

INSERT INTO
    categories(name)
VALUES
    ('Music'),
    ('Gaming'),
    ('Education'),
    ('Sports'),
    ('Tech'),
    ('Entertainment'),
    ('Vlog'),
    ('Social'),
    ('Kids'),
    ('News');


CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    age INT,
    gender gender,
    bio TEXT,
    avatar_key TEXT,
    location TEXT, 
    website TEXT,
    name TEXT
);

CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    thumbnail_key TEXT,
    duration INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE likes (
    user_id INT NOT NULL REFERENCES users(id),
    video_id INT NOT NULL REFERENCES videos(id),
    PRIMARY KEY (user_id, video_id)
);

CREATE TABLE followers (
    follower_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT NOW(),

    PRIMARY KEY (follower_id, following_id),

    CHECK (follower_id <> following_id)
);

CREATE TABLE views (
    id SERIAL PRIMARY KEY,

    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    video_id INT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

    watched_at TIMESTAMP DEFAULT NOW(),

    watch_time INT DEFAULT 0
);