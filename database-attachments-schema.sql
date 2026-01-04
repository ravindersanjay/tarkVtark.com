-- ================================================
-- ATTACHMENTS & EVIDENCE - DATABASE SCHEMA
-- Version: 1.0
-- PostgreSQL 13+
-- ================================================
-- Purpose: Store file attachments and evidence URLs for questions and replies
-- This replaces localStorage evidence storage with proper database persistence

-- Drop existing tables if recreating
DROP TABLE IF EXISTS evidence_urls CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;

-- ================================================
-- TABLE: attachments
-- ================================================
-- Stores metadata for uploaded files (images, videos, PDFs, etc.)
-- Actual files are stored in external storage (S3, Cloudinary, or local filesystem)
-- Only metadata and storage URL are kept in database

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent relationship (either question OR reply, not both)
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,

    -- File metadata
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,  -- Size in bytes
    file_type VARCHAR(100) NOT NULL,  -- MIME type (e.g., 'application/pdf', 'image/jpeg')

    -- External storage reference
    storage_url TEXT NOT NULL,  -- Full URL to access the file (S3, Cloudinary, or local)
    storage_provider VARCHAR(50) DEFAULT 'local',  -- 'local', 's3', 'cloudinary'

    -- Additional metadata
    uploaded_by VARCHAR(100) DEFAULT 'Anonymous',
    display_order INTEGER DEFAULT 0,  -- Order to display files in UI

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure either question_id OR reply_id is set, not both
    CONSTRAINT attachment_parent_check CHECK (
        (question_id IS NOT NULL AND reply_id IS NULL) OR
        (question_id IS NULL AND reply_id IS NOT NULL)
    )
);

-- ================================================
-- TABLE: evidence_urls
-- ================================================
-- Stores URLs to external evidence (YouTube videos, articles, sources, etc.)
-- These are links provided by users, not uploaded files

CREATE TABLE evidence_urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent relationship (either question OR reply, not both)
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,

    -- URL data
    url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,  -- Order to display URLs in UI

    -- Optional metadata
    title VARCHAR(255),  -- Optional: Page title or description

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure either question_id OR reply_id is set, not both
    CONSTRAINT evidence_url_parent_check CHECK (
        (question_id IS NOT NULL AND reply_id IS NULL) OR
        (question_id IS NULL AND reply_id IS NOT NULL)
    )
);

-- ================================================
-- INDEXES for Performance
-- ================================================

-- Attachments indexes
CREATE INDEX idx_attachments_question ON attachments(question_id);
CREATE INDEX idx_attachments_reply ON attachments(reply_id);
CREATE INDEX idx_attachments_created ON attachments(created_at DESC);
CREATE INDEX idx_attachments_display_order ON attachments(display_order);

-- Evidence URLs indexes
CREATE INDEX idx_evidence_urls_question ON evidence_urls(question_id);
CREATE INDEX idx_evidence_urls_reply ON evidence_urls(reply_id);
CREATE INDEX idx_evidence_urls_created ON evidence_urls(created_at DESC);
CREATE INDEX idx_evidence_urls_display_order ON evidence_urls(display_order);

-- ================================================
-- COMMENTS for Documentation
-- ================================================

COMMENT ON TABLE attachments IS 'File attachment metadata for questions and replies. Actual files stored externally.';
COMMENT ON TABLE evidence_urls IS 'External evidence URLs (YouTube, articles, sources) for questions and replies.';

COMMENT ON COLUMN attachments.storage_url IS 'Full URL to access the file from external storage';
COMMENT ON COLUMN attachments.storage_provider IS 'Which storage system is used: local, s3, or cloudinary';
COMMENT ON COLUMN attachments.file_size IS 'File size in bytes';

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Run after setup to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_name IN ('attachments', 'evidence_urls');
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'attachments';

