ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS disabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status ENUM('draft','published','scheduled') DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS header_slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS footer_slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS banner_slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_image VARCHAR(500),
  ADD COLUMN IF NOT EXISTS published_layout JSON,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP NULL;

ALTER TABLE custom_templates
  ADD COLUMN IF NOT EXISTS layout JSON,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(500),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE page_versions
  ADD COLUMN IF NOT EXISTS version_number INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS layout JSON,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS name VARCHAR(255);

UPDATE page_versions
SET layout = COALESCE(layout, content)
WHERE layout IS NULL;

UPDATE page_versions
SET content = COALESCE(content, layout)
WHERE content IS NULL;

ALTER TABLE media_library
  ADD COLUMN IF NOT EXISTS filename VARCHAR(255),
  ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255),
  ADD COLUMN IF NOT EXISTS alt VARCHAR(255),
  ADD COLUMN IF NOT EXISTS tags JSON,
  ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

UPDATE media_library
SET filename = COALESCE(filename, name)
WHERE filename IS NULL OR filename = '';

UPDATE media_library
SET original_filename = COALESCE(original_filename, original_name, name)
WHERE original_filename IS NULL OR original_filename = '';

UPDATE media_library
SET name = COALESCE(name, filename, original_name)
WHERE name IS NULL OR name = '';

UPDATE media_library
SET original_name = COALESCE(original_name, original_filename, name)
WHERE original_name IS NULL OR original_name = '';

UPDATE media_library
SET uploaded_at = COALESCE(uploaded_at, created_at)
WHERE uploaded_at IS NULL;

ALTER TABLE sections
  ADD COLUMN IF NOT EXISTS props JSON,
  ADD COLUMN IF NOT EXISTS type VARCHAR(255),
  ADD COLUMN IF NOT EXISTS sticky_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sticky_column_index INT,
  ADD COLUMN IF NOT EXISTS sticky_position VARCHAR(50),
  ADD COLUMN IF NOT EXISTS sticky_offset INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS navigation_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  label VARCHAR(255) NOT NULL,
  href VARCHAR(500) NOT NULL,
  order_index INT DEFAULT 0,
  parent_id INT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  open_new_tab BOOLEAN DEFAULT FALSE,
  header_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS headers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(500),
  logo_dark VARCHAR(500),
  cta_label VARCHAR(255),
  cta_link VARCHAR(500),
  is_sticky BOOLEAN DEFAULT TRUE,
  bg_color VARCHAR(50) DEFAULT 'transparent',
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS footers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  columns JSON,
  copyright VARCHAR(500),
  social_links JSON,
  bg_color VARCHAR(50),
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  content JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  site_name VARCHAR(255),
  site_url VARCHAR(500),
  logo VARCHAR(500),
  logo_dark VARCHAR(500),
  favicon VARCHAR(500),
  primary_color VARCHAR(50) DEFAULT '#7c5cfc',
  secondary_color VARCHAR(50),
  heading_font VARCHAR(255) DEFAULT 'Inter',
  body_font VARCHAR(255) DEFAULT 'Inter',
  google_analytics_id VARCHAR(100),
  facebook_pixel_id VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(100),
  address TEXT,
  whatsapp_number VARCHAR(50),
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  facebook_url VARCHAR(500),
  youtube_url VARCHAR(500),
  custom_css TEXT,
  custom_js TEXT,
  robots_txt TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  image VARCHAR(500),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  label VARCHAR(255) NOT NULL,
  value VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  bio TEXT,
  image VARCHAR(500),
  email VARCHAR(255),
  linkedin_url VARCHAR(500),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content LONGTEXT,
  excerpt TEXT,
  featured_image VARCHAR(500),
  author VARCHAR(255),
  category VARCHAR(100),
  tags JSON,
  status ENUM('draft','published') DEFAULT 'draft',
  meta_title VARCHAR(255),
  meta_description TEXT,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  image VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  category VARCHAR(100),
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social (
  id INT PRIMARY KEY AUTO_INCREMENT,
  platform VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  icon VARCHAR(100),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status ENUM('new','read','replied') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price VARCHAR(100) NOT NULL,
  period VARCHAR(50),
  description TEXT,
  features JSON,
  is_popular BOOLEAN DEFAULT FALSE,
  cta_label VARCHAR(255),
  cta_link VARCHAR(500),
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  category VARCHAR(100),
  client VARCHAR(255),
  url VARCHAR(500),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS partners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  image VARCHAR(500) NOT NULL,
  url VARCHAR(500),
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timeline (
  id INT PRIMARY KEY AUTO_INCREMENT,
  year VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS awards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  year VARCHAR(20),
  image VARCHAR(500),
  description TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS meta_description TEXT;

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS url VARCHAR(500);

SET @idx_sections_page_id_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'sections' AND index_name = 'idx_sections_page_id'
);
SET @idx_sections_page_id_sql := IF(@idx_sections_page_id_exists = 0, 'ALTER TABLE sections ADD INDEX idx_sections_page_id (page_id)', 'SELECT 1');
PREPARE idx_sections_page_id_stmt FROM @idx_sections_page_id_sql;
EXECUTE idx_sections_page_id_stmt;
DEALLOCATE PREPARE idx_sections_page_id_stmt;

SET @idx_page_versions_page_id_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'page_versions' AND index_name = 'idx_page_versions_page_id'
);
SET @idx_page_versions_page_id_sql := IF(@idx_page_versions_page_id_exists = 0, 'ALTER TABLE page_versions ADD INDEX idx_page_versions_page_id (page_id)', 'SELECT 1');
PREPARE idx_page_versions_page_id_stmt FROM @idx_page_versions_page_id_sql;
EXECUTE idx_page_versions_page_id_stmt;
DEALLOCATE PREPARE idx_page_versions_page_id_stmt;

SET @idx_navigation_items_parent_id_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'navigation_items' AND index_name = 'idx_navigation_items_parent_id'
);
SET @idx_navigation_items_parent_id_sql := IF(@idx_navigation_items_parent_id_exists = 0, 'ALTER TABLE navigation_items ADD INDEX idx_navigation_items_parent_id (parent_id)', 'SELECT 1');
PREPARE idx_navigation_items_parent_id_stmt FROM @idx_navigation_items_parent_id_sql;
EXECUTE idx_navigation_items_parent_id_stmt;
DEALLOCATE PREPARE idx_navigation_items_parent_id_stmt;

SET @idx_navigation_items_header_id_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'navigation_items' AND index_name = 'idx_navigation_items_header_id'
);
SET @idx_navigation_items_header_id_sql := IF(@idx_navigation_items_header_id_exists = 0, 'ALTER TABLE navigation_items ADD INDEX idx_navigation_items_header_id (header_id)', 'SELECT 1');
PREPARE idx_navigation_items_header_id_stmt FROM @idx_navigation_items_header_id_sql;
EXECUTE idx_navigation_items_header_id_stmt;
DEALLOCATE PREPARE idx_navigation_items_header_id_stmt;
