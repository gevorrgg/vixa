CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

INSERT INTO categories(name)
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

CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
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