CREATE TYPE gender AS ENUM (
  'male',
  'female',
  'non_binary',
  'prefer_not_to_say'
);

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
