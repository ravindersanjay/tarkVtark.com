-- ================================================
-- DATABASE MIGRATION - Add Guidelines Table
-- Database: debate_db
-- Date: December 19, 2025
-- ================================================

-- Connect to debate_db first!
-- \c debate_db

-- Create guidelines table (if not exists)
CREATE TABLE IF NOT EXISTS guidelines (
    id BIGSERIAL PRIMARY KEY,
    text VARCHAR(1000) NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_guidelines_display_order ON guidelines(display_order);
CREATE INDEX IF NOT EXISTS idx_guidelines_active ON guidelines(is_active);

-- Add comment
COMMENT ON TABLE guidelines IS 'Community guidelines for debates';

-- Verify
SELECT 'Guidelines table migration completed!' AS status;
SELECT COUNT(*) AS guideline_count FROM guidelines;

-- Check all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

