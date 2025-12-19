-- ================================================
-- DEBATE APPLICATION - DATABASE SCHEMA
-- Version: 1.0
-- PostgreSQL 13+
-- ================================================

-- Drop existing tables (for clean start)
DROP TABLE IF EXISTS replies CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS debate_topics CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;

-- ================================================
-- TABLE: debate_topics
-- ================================================
CREATE TABLE debate_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic VARCHAR(255) NOT NULL,
    left_label VARCHAR(100) NOT NULL,
    right_label VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: questions
-- ================================================
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_topic_id UUID NOT NULL REFERENCES debate_topics(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    tag VARCHAR(100),
    side VARCHAR(10) NOT NULL CHECK (side IN ('left', 'right')),
    author VARCHAR(100) DEFAULT 'Anonymous',
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    unique_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLE: replies
-- ================================================
CREATE TABLE replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('left', 'right')),
    author VARCHAR(100) DEFAULT 'Anonymous',
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    unique_id VARCHAR(100) UNIQUE,
    depth INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reply_parent_check CHECK (
        (question_id IS NOT NULL AND parent_reply_id IS NULL) OR
        (question_id IS NULL AND parent_reply_id IS NOT NULL)
    )
);

-- ================================================
-- TABLE: admin_users
-- ================================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- ================================================
-- TABLE: contact_messages
-- ================================================
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_questions_debate_topic ON questions(debate_topic_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_unique_id ON questions(unique_id);
CREATE INDEX idx_replies_question ON replies(question_id);
CREATE INDEX idx_replies_parent ON replies(parent_reply_id);
CREATE INDEX idx_replies_created_at ON replies(created_at DESC);
CREATE INDEX idx_replies_unique_id ON replies(unique_id);
CREATE INDEX idx_debate_topics_active ON debate_topics(is_active);

-- ================================================
-- TABLE: guidelines
-- ================================================
CREATE TABLE guidelines (
    id BIGSERIAL PRIMARY KEY,
    text VARCHAR(1000) NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for guidelines
CREATE INDEX idx_guidelines_display_order ON guidelines(display_order);
CREATE INDEX idx_guidelines_active ON guidelines(is_active);

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE debate_topics IS 'Main debate topics (e.g., Sanatan vs Islam)';
COMMENT ON TABLE questions IS 'Top-level questions posted on either side';
COMMENT ON TABLE replies IS 'Nested replies to questions or other replies';
COMMENT ON TABLE admin_users IS 'Admin users for managing content';
COMMENT ON TABLE contact_messages IS 'Messages from contact form';
COMMENT ON TABLE guidelines IS 'Community guidelines for debates';

-- ================================================
-- VERIFICATION
-- ================================================
-- Run after setup to verify:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

