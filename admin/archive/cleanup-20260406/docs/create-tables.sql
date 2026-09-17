-- Historical bootstrap SQL.
-- This file is not the authoritative production schema after the Phase 6 revision-first cutover.
-- Current production page layouts live in page_revisions, not pages.layout / pages.published_layout.
-- Keep this file only for legacy reference unless it is intentionally rewritten.
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS admin;

USE admin;

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content JSON,
  published_layout JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section templates table
CREATE TABLE IF NOT EXISTS section_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_type VARCHAR(255) NOT NULL,
  content JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trust points table for AboutOne component
CREATE TABLE IF NOT EXISTS trust_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  main VARCHAR(255) NOT NULL,
  sub TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Features table for FeaturesOne component
CREATE TABLE IF NOT EXISTS features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  image VARCHAR(255),
  order_index INT DEFAULT 0,
  url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table for CallToAction component
CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client logos table for CallToAction component
CREATE TABLE IF NOT EXISTS client_logos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Home banner table
CREATE TABLE IF NOT EXISTS home_banner (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  subtitle TEXT,
  description TEXT,
  image VARCHAR(255),
  button_text VARCHAR(255),
  button_link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Choose table for ChooseOne component
CREATE TABLE IF NOT EXISTS choose (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sections table
CREATE TABLE IF NOT EXISTS sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_id INT NOT NULL,
  template_id INT,
  section_type VARCHAR(255) NOT NULL,
  content JSON,
  `order` INT DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sections_page_id (page_id),
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES section_templates(id) ON DELETE SET NULL
);

-- Media Library table
CREATE TABLE IF NOT EXISTS media_library (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255),
  original_filename VARCHAR(255),
  url VARCHAR(500) NOT NULL,
  type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  alt VARCHAR(255),
  tags JSON,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Custom Templates table
CREATE TABLE IF NOT EXISTS custom_templates (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  content JSON NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Page Versions table
CREATE TABLE IF NOT EXISTS page_versions (
  id VARCHAR(36) PRIMARY KEY,
  page_id INT NOT NULL,
  version_name VARCHAR(255),
  content JSON NOT NULL,
  layout JSON NOT NULL,
  version_number INT DEFAULT 1,
  description TEXT,
  created_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_page_versions_page_id (page_id),
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

-- Media table for media library
CREATE TABLE IF NOT EXISTS media (
  id VARCHAR(36) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type ENUM('image', 'video', 'document') NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  dimensions VARCHAR(50),
  alt_text VARCHAR(255),
  tags JSON,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Templates table for template management
CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  category VARCHAR(100) NOT NULL,
  structure JSON NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  tags JSON,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Versions table for version control
CREATE TABLE IF NOT EXISTS versions (
  id VARCHAR(36) PRIMARY KEY,
  entity_id VARCHAR(36) NOT NULL,
  entity_type ENUM('section', 'page') NOT NULL,
  version INT NOT NULL,
  content JSON NOT NULL,
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  notes TEXT,
  INDEX idx_entity (entity_id, entity_type),
  INDEX idx_version (entity_id, entity_type, version)
);

-- Update pages table with new fields
ALTER TABLE pages
ADD COLUMN name VARCHAR(255) DEFAULT '' AFTER title,
ADD COLUMN layout JSON AFTER name,
ADD COLUMN settings JSON AFTER layout;

-- Update sections table with new fields
ALTER TABLE sections
ADD COLUMN name VARCHAR(255) DEFAULT '' AFTER section_type,
ADD COLUMN settings JSON AFTER content,
ADD COLUMN sort_order INT DEFAULT 0 AFTER settings,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER sort_order;

-- Insert sample data
INSERT INTO pages (slug, title) VALUES ('home', 'Home Page'), ('about', 'About Us') ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO section_templates (section_type, content) VALUES
('home_banner', '{"title": "Welcome", "subtitle": "This is a banner", "backgroundColor": "#f0f0f0", "buttonText": "Learn More", "buttonLink": "#"}'),
('slider', '{"slides": [{"image": "/images/slide1.jpg", "title": "Slide 1", "description": "Description 1"}, {"image": "/images/slide2.jpg", "title": "Slide 2", "description": "Description 2"}]}'),
('choose', '{"title": "Why Choose Us?", "items": [{"icon": "/images/icon1.png", "title": "Feature 1", "description": "Desc 1"}, {"icon": "/images/icon2.png", "title": "Feature 2", "description": "Desc 2"}]}'),
-- Curvemetrics components
('about_one', '{"subtitle": "WHY CHOOSE US", "image": "/img/about/about-thumb-2.png", "shapeImage": "/img/shape/about-thumb-shape.png"}'),
('features_one', '{"subtitle": "INDUSTRIES WE EMPOWER", "title": "From Government to Startups Tailored Solutions Across Every Industry"}'),
('home_two_cta', '{"title": "Check your website''s SEO", "placeholder": "Enter Your Website Link", "buttonText": "Check Now"}'),
('testimonials_contact', '{"subtitle": "CLIENTS AND TESTIMONIAL", "title": "CLIENTS AND TESTIMONIAL", "description": "Listen to what our happy clients have to say about us.", "ratingText": "4.9/5 based on 43 ratings and reviews", "formTitle": "Get In Touch", "submitText": "Submit"}');

-- Sample data for trust_points
INSERT INTO trust_points (main, sub, sort_order) VALUES
('Expertise', 'Our team has years of experience in web development.', 0),
('Quality', 'We deliver high-quality solutions.', 1),
('Support', '24/7 customer support available.', 2);

-- Sample data for features
INSERT INTO features (title, description, icon, order_index) VALUES
('Government', 'Tailored solutions for government agencies.', 'FaLandmark', 0),
('Startups', 'Innovative solutions for startups.', 'FaRocket', 1),
('Education', 'Educational platforms and tools.', 'FaGraduationCap', 2);

-- Sample data for testimonials
INSERT INTO testimonials (text, author) VALUES
('Digital Infoways revamped our website perfectly.', 'Brent Williams'),
('Work quality is just remarkable.', 'Robert Hensley'),
('Thanks to the entire team for support.', 'Rushil Shah');

-- Sample data for client_logos
INSERT INTO client_logos (image, alt_text, sort_order) VALUES
('/img/clients/client1.png', 'Client 1', 0),
('/img/clients/client2.png', 'Client 2', 1),
('/img/clients/client3.png', 'Client 3', 2),
('/img/clients/client4.png', 'Client 4', 3),
('/img/clients/client5.png', 'Client 5', 4),
('/img/clients/client6.png', 'Client 6', 5);

-- Sample data for home_banner
INSERT INTO home_banner (title, subtitle, description, image, button_text, button_link) VALUES
('DRIVING DIGITAL TRANSFORMATION', 'THROUGH BIG DATA, SMART MARKETING & SCALABLE TECHNOLOGY SOLUTIONS', 'At Curve Metrics we empower government bodies, enterprises, and businesses with innovative solutions in Big Data, Data Deduplication, Web & App Development, and Strategic Digital Marketing.', '/img/hero/team.jpg', 'Partner with us to build smarter solutions for tomorrow.', '/contact');

-- Sample data for choose
INSERT INTO choose (title, description, icon, color) VALUES
('Big Data Analytics', 'Harness the power of data to drive informed decisions.', 'FaDatabase', '#7f00ff'),
('Web & App Development', 'Custom solutions for modern digital experiences.', 'FaMobileAlt', '#00dbde'),
('Digital Marketing', 'Strategic campaigns to boost your online presence.', 'FaBullhorn', '#e100ff'),
('Data Deduplication', 'Clean and optimize your data for efficiency.', 'FaChartLine', '#ff7f50');

INSERT INTO sections (page_id, template_id, section_type, content, `order`) VALUES
(1, 1, 'home_banner', '{"title": "Welcome to Home", "subtitle": "Home banner", "backgroundColor": "#e0e0e0"}', 0),
(1, 2, 'slider', '{"slides": [{"image": "/images/home-slide1.jpg", "title": "Home Slide 1", "description": "Home desc 1"}]}', 1);

