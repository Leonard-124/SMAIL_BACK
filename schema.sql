
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    item VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    image TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);