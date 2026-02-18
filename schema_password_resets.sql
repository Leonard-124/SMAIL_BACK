
-- Password resets table for forgot password functionality
-- Run this migration: psql $NEON_DB_URI -f schema_password_resets.sql

CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  reset_code VARCHAR(6) NOT NULL,
  reset_token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one active reset per user (override previous requests)
  UNIQUE(user_id)
);

-- Index for fast lookup by code
CREATE INDEX IF NOT EXISTS idx_password_resets_code ON password_resets(email, reset_code);

-- Index for fast lookup by token
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(reset_token);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets(expires_at, used);

COMMENT ON TABLE password_resets IS 'Stores temporary password reset codes and tokens';
COMMENT ON COLUMN password_resets.reset_code IS '6-digit numeric code sent via email';
COMMENT ON COLUMN password_resets.reset_token IS 'Secure random token for URL-based reset (fallback)';
COMMENT ON COLUMN password_resets.expires_at IS 'Code expires 15 minutes after creation';
COMMENT ON COLUMN password_resets.used IS 'Prevents code reuse after successful password reset';