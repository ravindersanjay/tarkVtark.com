-- ================================================
-- DEBATE APPLICATION - INITIAL DATA
-- Version: 1.0
-- ================================================

-- ================================================
-- Default Admin User
-- Username: admin
-- Password: admin123 (CHANGE IN PRODUCTION!)
--
-- NOTE: This password_hash is a placeholder for initial setup ONLY
-- TODO: Replace with actual bcrypt hash before production deployment
-- Expected password: admin123 (should be hashed with bcrypt strength 10)
--
-- SECURITY WARNING: This is NOT a valid bcrypt hash!
-- Implement proper bcrypt hashing in backend authentication before using in production.
-- The hash should be generated using a proper bcrypt library with a work factor of 10+
-- ================================================
INSERT INTO admin_users (username, email, password_hash, full_name, is_active)
VALUES (
    'admin',
    'admin@tarkvtark.com',
    '$2a$10$xDkZKYqJ5F5K5K5K5K5K5.', -- PLACEHOLDER - Replace with real bcrypt hash
    'System Administrator',
    true
);

-- ================================================
-- Sample Debate Topics
-- ================================================
INSERT INTO debate_topics (topic, left_label, right_label, description, is_active)
VALUES
(
    'Sanatan vs Islam',
    'Sanatan',
    'Islam',
    'A respectful debate comparing philosophical and theological aspects of Sanatan Dharma and Islam.',
    true
),
(
    'Science vs Religion',
    'Science',
    'Religion',
    'Exploring the relationship between scientific inquiry and religious faith.',
    true
),
(
    'Capitalism vs Socialism',
    'Capitalism',
    'Socialism',
    'Economic systems debate: free market vs planned economy.',
    true
);

-- ================================================
-- Sample Questions for "Sanatan vs Islam" topic
-- ================================================
DO $$
DECLARE
    topic_id UUID;
    question1_id UUID;
    question2_id UUID;
    reply1_id UUID;
BEGIN
    -- Get the topic ID
    SELECT id INTO topic_id FROM debate_topics WHERE topic = 'Sanatan vs Islam';

    -- Insert sample question 1 (left side)
    INSERT INTO questions (debate_topic_id, text, tag, side, author, votes_up, votes_down, unique_id)
    VALUES (
        topic_id,
        'What is the concept of God in Sanatan Dharma?',
        'Philosophy',
        'left',
        'Seeker123',
        5,
        0,
        'q-' || extract(epoch from now())::bigint || '-1'
    ) RETURNING id INTO question1_id;

    -- Insert reply to question 1 (right side)
    INSERT INTO replies (question_id, text, side, author, votes_up, votes_down, unique_id, depth)
    VALUES (
        question1_id,
        'In Islam, God (Allah) is one, indivisible, and transcendent. How does this compare to the concept in Sanatan Dharma?',
        'right',
        'Scholar456',
        3,
        0,
        'r-' || extract(epoch from now())::bigint || '-1',
        1
    ) RETURNING id INTO reply1_id;

    -- Insert nested reply (left side)
    INSERT INTO replies (parent_reply_id, text, side, author, votes_up, votes_down, unique_id, depth)
    VALUES (
        reply1_id,
        'Sanatan Dharma embraces both monistic (Advaita) and dualistic (Dvaita) perspectives. The ultimate reality, Brahman, is formless yet manifests in many forms.',
        'left',
        'Philosopher789',
        2,
        0,
        'r-' || extract(epoch from now())::bigint || '-2',
        2
    );

    -- Insert sample question 2 (right side)
    INSERT INTO questions (debate_topic_id, text, tag, side, author, votes_up, votes_down, unique_id)
    VALUES (
        topic_id,
        'How does Islam view the concept of dharma and karma?',
        'Theology',
        'right',
        'Inquirer321',
        7,
        1,
        'q-' || extract(epoch from now())::bigint || '-2'
    ) RETURNING id INTO question2_id;

    -- Insert reply to question 2 (left side)
    INSERT INTO replies (question_id, text, side, author, votes_up, votes_down, unique_id, depth)
    VALUES (
        question2_id,
        'While Islam doesn''t use the exact terms, the concepts of righteous action (amal salih) and divine justice parallel dharma and karma in many ways.',
        'left',
        'Thinker654',
        4,
        0,
        'r-' || extract(epoch from now())::bigint || '-3',
        1
    );
END $$;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- After running this file, verify data:
-- SELECT COUNT(*) FROM debate_topics;     -- Should return 3
-- SELECT COUNT(*) FROM questions;          -- Should return 2
-- SELECT COUNT(*) FROM replies;            -- Should return 3
-- SELECT topic, left_label, right_label FROM debate_topics;

