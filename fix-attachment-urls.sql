-- =====================================================================
-- Fix Duplicate Port in Attachment Storage URLs
-- =====================================================================
-- This script fixes existing attachments that have duplicate :8080 ports
-- in their storage_url field
--
-- Issue: http://localhost:8080:8080/api/v1/files/file.pdf
-- Fixed: http://localhost:8080/api/v1/files/file.pdf
--
-- Date: January 10, 2026
-- =====================================================================

-- Step 1: Preview affected records (DRY RUN)
SELECT
    id,
    file_name,
    storage_url AS current_url,
    REPLACE(storage_url, ':8080:8080', ':8080') AS fixed_url,
    created_at
FROM attachments
WHERE storage_url LIKE '%:8080:8080%'
ORDER BY created_at DESC;

-- Step 2: Count how many records will be affected
SELECT
    COUNT(*) as total_affected_records
FROM attachments
WHERE storage_url LIKE '%:8080:8080%';

-- Step 3: Apply the fix (EXECUTE THIS TO FIX THE DATA)
UPDATE attachments
SET storage_url = REPLACE(storage_url, ':8080:8080', ':8080')
WHERE storage_url LIKE '%:8080:8080%';

-- Step 4: Verify the fix was applied correctly
SELECT
    COUNT(*) as correctly_formatted_urls
FROM attachments
WHERE storage_url LIKE '%localhost:8080/api/v1/files/%'
  AND storage_url NOT LIKE '%:8080:8080%';

-- Step 5: Check if any duplicates remain
SELECT
    COUNT(*) as remaining_duplicates
FROM attachments
WHERE storage_url LIKE '%:8080:8080%';

-- Expected result: remaining_duplicates should be 0

-- Step 6: View sample of fixed records
SELECT
    id,
    file_name,
    storage_url,
    file_size,
    content_type,
    created_at
FROM attachments
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================================
-- Additional Validation Queries
-- =====================================================================

-- Check for any other potential URL issues
SELECT
    storage_url,
    COUNT(*) as count
FROM attachments
GROUP BY storage_url
HAVING COUNT(*) > 1;

-- Verify all URLs follow the correct pattern
SELECT
    id,
    file_name,
    storage_url
FROM attachments
WHERE storage_url NOT LIKE 'http://%/api/v1/files/%'
  AND storage_url NOT LIKE 'https://%/api/v1/files/%';

-- =====================================================================
-- NOTES:
-- =====================================================================
-- 1. Run Step 1 first to preview the changes
-- 2. Run Step 2 to see how many records will be updated
-- 3. Run Step 3 to apply the fix (backup recommended)
-- 4. Run Steps 4-6 to verify the fix was successful
-- =====================================================================

