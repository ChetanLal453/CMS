-- BACKEND & DATABASE DIAGNOSTIC QUERIES
-- Run these in MySQL

-- ============================================
-- 1. DATABASE STRUCTURE CHECK
-- ============================================

-- 1.1 Show table structure
SHOW CREATE TABLE pages;

-- 1.2 Show columns
DESCRIBE pages;

-- 1.3 Check if layout column exists
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'pages' 
AND TABLE_SCHEMA = DATABASE();

-- ============================================
-- 2. CURRENT DATA CHECK
-- ============================================

-- 2.1 Count pages
SELECT COUNT(*) as total_pages FROM pages;

-- 2.2 List all pages with details
SELECT 
    id,
    slug,
    title,
    name,
    status,
    created_at,
    updated_at,
    LENGTH(COALESCE(layout, '{}')) as layout_size,
    LENGTH(COALESCE(content, '{}')) as content_size
FROM pages 
ORDER BY id DESC
LIMIT 10;

-- 2.3 Check recent activity
SELECT 
    id,
    slug,
    name,
    created_at,
    TIMESTAMPDIFF(MINUTE, created_at, NOW()) as minutes_ago
FROM pages 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY created_at DESC;

-- ============================================
-- 3. TEST INSERT OPERATIONS
-- ============================================

-- 3.1 Test insert with all fields
INSERT INTO pages (
    slug, title, name, status, layout, created_at, updated_at
) VALUES (
    'sql-test-1',
    'SQL Test Page 1',
    'SQL Test 1',
    'published',
    '{"id": "test-layout", "name": "Test Layout", "sections": []}',
    NOW(),
    NOW()
);

-- 3.2 Test insert with minimal fields
INSERT INTO pages (slug, title, name) 
VALUES ('sql-test-2', 'SQL Test Page 2', 'SQL Test 2');

-- 3.3 Verify inserts
SELECT * FROM pages WHERE slug LIKE 'sql-test-%';

-- ============================================
-- 4. CLEANUP (Optional)
-- ============================================

-- Delete test pages if needed
-- DELETE FROM pages WHERE slug LIKE 'sql-test-%';
-- SELECT 'Test pages deleted' as status;

-- ============================================
-- 5. FINAL SUMMARY
-- ============================================

SELECT 
    'DATABASE STATUS' as check_name,
    COUNT(*) as total_pages,
    MIN(created_at) as oldest_page,
    MAX(created_at) as newest_page,
    AVG(LENGTH(layout)) as avg_layout_size
FROM pages;
