-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: admin
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `admin`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `admin` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `admin`;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int NOT NULL,
  `changes` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_action` (`action`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `awards`
--

DROP TABLE IF EXISTS `awards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `awards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `year` varchar(20) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `description` text,
  `order_index` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `awards`
--

LOCK TABLES `awards` WRITE;
/*!40000 ALTER TABLE `awards` DISABLE KEYS */;
/*!40000 ALTER TABLE `awards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `component_name` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `preview_image` varchar(500) DEFAULT NULL,
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,'banner-default','Default Banner','Banner','default',NULL,1,'2025-12-26 15:42:47','2025-12-26 15:42:47'),(2,'banner-two','Banner Two','BannerTwo','two',NULL,1,'2025-12-26 15:42:47','2025-12-26 15:42:47'),(3,'banner-metrics','Curve Metrics Banner','HomeBannerCurveMetrics','metrics',NULL,1,'2025-12-26 15:42:47','2025-12-26 15:42:47'),(4,'banner-four','Banner Four','HomeFourBanner','four',NULL,1,'2025-12-26 15:42:47','2025-12-26 15:42:47'),(5,'banner-three','Banner Three','HomeThreeBanner','three',NULL,1,'2025-12-26 15:42:47','2025-12-26 15:42:47');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog`
--

DROP TABLE IF EXISTS `blog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext,
  `excerpt` text,
  `featured_image` varchar(500) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `status` enum('draft','published') DEFAULT 'draft',
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog`
--

LOCK TABLES `blog` WRITE;
/*!40000 ALTER TABLE `blog` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `columns`
--

DROP TABLE IF EXISTS `columns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `columns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `section_id` int NOT NULL,
  `column_index` int NOT NULL,
  `width` varchar(50) DEFAULT 'auto',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_sticky` tinyint(1) DEFAULT '0',
  `sticky_position` varchar(20) DEFAULT 'top',
  `sticky_offset` int DEFAULT '120',
  PRIMARY KEY (`id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `columns_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50941 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `columns`
--

LOCK TABLES `columns` WRITE;
/*!40000 ALTER TABLE `columns` DISABLE KEYS */;
/*!40000 ALTER TABLE `columns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `component_definitions`
--

DROP TABLE IF EXISTS `component_definitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `component_definitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `component_type` varchar(100) NOT NULL,
  `default_props` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `component_type` (`component_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `component_definitions`
--

LOCK TABLES `component_definitions` WRITE;
/*!40000 ALTER TABLE `component_definitions` DISABLE KEYS */;
/*!40000 ALTER TABLE `component_definitions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact`
--

DROP TABLE IF EXISTS `contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied') DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact`
--

LOCK TABLES `contact` WRITE;
/*!40000 ALTER TABLE `contact` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_templates`
--

DROP TABLE IF EXISTS `custom_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `layout` json DEFAULT NULL,
  `description` text,
  `thumbnail` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_templates`
--

LOCK TABLES `custom_templates` WRITE;
/*!40000 ALTER TABLE `custom_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `custom_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `footers`
--

DROP TABLE IF EXISTS `footers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `footers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `component_name` varchar(100) NOT NULL,
  `preview_image` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `footers`
--

LOCK TABLES `footers` WRITE;
/*!40000 ALTER TABLE `footers` DISABLE KEYS */;
INSERT INTO `footers` VALUES (1,'footer-1','Footer 1','Footer',NULL,1,'2025-12-23 13:17:39'),(2,'footer-2','Footer 2','FooterTwo',NULL,1,'2025-12-23 13:17:39'),(3,'footer-3','Footer 3','FooterThree',NULL,1,'2025-12-23 13:17:39'),(4,'footer-4','Footer 4','FooterFour',NULL,1,'2025-12-23 13:17:39'),(5,'footer-5','Footer 5','FooterFive',NULL,1,'2025-12-23 13:17:39');
/*!40000 ALTER TABLE `footers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery`
--

DROP TABLE IF EXISTS `gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `image` varchar(500) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery`
--

LOCK TABLES `gallery` WRITE;
/*!40000 ALTER TABLE `gallery` DISABLE KEYS */;
/*!40000 ALTER TABLE `gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `headers`
--

DROP TABLE IF EXISTS `headers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `headers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `component_name` varchar(100) NOT NULL,
  `preview_image` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `headers`
--

LOCK TABLES `headers` WRITE;
/*!40000 ALTER TABLE `headers` DISABLE KEYS */;
INSERT INTO `headers` VALUES (1,'header-1','Header 1','Header',NULL,1,'2025-12-23 13:17:38'),(2,'header-2','Header 2','HeaderTwo',NULL,1,'2025-12-23 13:17:38'),(3,'header-3','Header 3','HeaderThree',NULL,1,'2025-12-23 13:17:38'),(4,'header-4','Header 4','HeaderFour',NULL,1,'2025-12-23 13:17:38'),(5,'header-5','Header 5','HeaderFive',NULL,1,'2025-12-23 13:17:38');
/*!40000 ALTER TABLE `headers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_library`
--

DROP TABLE IF EXISTS `media_library`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_library` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) DEFAULT NULL,
  `original_filename` varchar(255) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `alt` varchar(255) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(255) DEFAULT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `size` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_library`
--

LOCK TABLES `media_library` WRITE;
/*!40000 ALTER TABLE `media_library` DISABLE KEYS */;
INSERT INTO `media_library` VALUES (1,'398ff57a-3040-43ec-be82-f4c41fc1142a.jpg','eeb59705-d89d-447a-b8df-64a6cdb0d439.jpg','/uploads/398ff57a-3040-43ec-be82-f4c41fc1142a.jpg','','[]','2026-03-30 16:21:34','398ff57a-3040-43ec-be82-f4c41fc1142a.jpg','eeb59705-d89d-447a-b8df-64a6cdb0d439.jpg','image/jpeg',1285204,'2026-03-30 16:21:34'),(2,'ed4644e6-7a9c-4544-b293-02a6ae20789f.png','about-thumb.png','/uploads/ed4644e6-7a9c-4544-b293-02a6ae20789f.png','','[]','2026-03-31 16:10:55','ed4644e6-7a9c-4544-b293-02a6ae20789f.png','about-thumb.png','image/png',133613,'2026-03-31 16:10:55'),(3,'f6bab997-351d-4c8c-8a14-466c1a5950f2.png','about-thumb.png','/uploads/f6bab997-351d-4c8c-8a14-466c1a5950f2.png','','[]','2026-03-31 16:28:41','f6bab997-351d-4c8c-8a14-466c1a5950f2.png','about-thumb.png','image/png',133613,'2026-03-31 16:28:41'),(4,'be598d36-1360-460c-93b9-11f958547507.png','about-thumb.png','/uploads/be598d36-1360-460c-93b9-11f958547507.png','','[]','2026-03-31 17:11:23','be598d36-1360-460c-93b9-11f958547507.png','about-thumb.png','image/png',133613,'2026-03-31 17:11:23');
/*!40000 ALTER TABLE `media_library` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `navigation_items`
--

DROP TABLE IF EXISTS `navigation_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `navigation_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `href` varchar(500) NOT NULL,
  `order_index` int DEFAULT '0',
  `parent_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `open_new_tab` tinyint(1) DEFAULT '0',
  `header_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_navigation_items_parent_id` (`parent_id`),
  KEY `idx_navigation_items_header_id` (`header_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `navigation_items`
--

LOCK TABLES `navigation_items` WRITE;
/*!40000 ALTER TABLE `navigation_items` DISABLE KEYS */;
INSERT INTO `navigation_items` VALUES (23,'Home','/',0,NULL,0,0,NULL,'2026-03-31 17:12:35','2026-03-31 17:12:35'),(24,'About','/about',1,NULL,0,0,NULL,'2026-03-31 17:12:35','2026-03-31 17:12:35'),(25,'Services','/services',2,NULL,0,0,NULL,'2026-03-31 17:12:35','2026-03-31 17:12:35');
/*!40000 ALTER TABLE `navigation_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_components`
--

DROP TABLE IF EXISTS `page_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_components` (
  `id` int NOT NULL AUTO_INCREMENT,
  `column_id` int NOT NULL,
  `component_type` varchar(100) NOT NULL,
  `component_name` varchar(255) NOT NULL,
  `props` json NOT NULL,
  `component_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `column_id` (`column_id`),
  CONSTRAINT `page_components_ibfk_1` FOREIGN KEY (`column_id`) REFERENCES `columns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=72687 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_components`
--

LOCK TABLES `page_components` WRITE;
/*!40000 ALTER TABLE `page_components` DISABLE KEYS */;
/*!40000 ALTER TABLE `page_components` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_revisions`
--

DROP TABLE IF EXISTS `page_revisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_revisions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `page_id` bigint unsigned NOT NULL,
  `revision_number` int unsigned NOT NULL,
  `revision_type` enum('draft','published','autosave','restore','template_import') NOT NULL DEFAULT 'draft',
  `layout_json` json NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_page_revisions_page_revision_number` (`page_id`,`revision_number`),
  KEY `idx_page_revisions_page_id_created_at` (`page_id`,`created_at`),
  KEY `idx_page_revisions_page_id_revision_type` (`page_id`,`revision_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_revisions`
--

LOCK TABLES `page_revisions` WRITE;
/*!40000 ALTER TABLE `page_revisions` DISABLE KEYS */;
/*!40000 ALTER TABLE `page_revisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_templates`
--

DROP TABLE IF EXISTS `page_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_templates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(150) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `description` text,
  `category` varchar(100) DEFAULT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `thumbnail_media_id` bigint unsigned DEFAULT NULL,
  `header_id` bigint unsigned DEFAULT NULL,
  `footer_id` bigint unsigned DEFAULT NULL,
  `banner_id` bigint unsigned DEFAULT NULL,
  `layout_json` json NOT NULL,
  `tags` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_page_templates_slug` (`slug`),
  KEY `idx_page_templates_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_templates`
--

LOCK TABLES `page_templates` WRITE;
/*!40000 ALTER TABLE `page_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `page_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_versions`
--

DROP TABLE IF EXISTS `page_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_versions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `page_id` int NOT NULL,
  `version_number` int DEFAULT '1',
  `version_name` varchar(255) DEFAULT NULL,
  `layout` json DEFAULT NULL,
  `description` text,
  `created_by` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_page_versions_page_id` (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_versions`
--

LOCK TABLES `page_versions` WRITE;
/*!40000 ALTER TABLE `page_versions` DISABLE KEYS */;
/*!40000 ALTER TABLE `page_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'URL slug like about, home',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Page title',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT 'Display name',
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'SEO title',
  `seo_description` text COLLATE utf8mb4_unicode_ci COMMENT 'SEO description',
  `seo_keywords` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'SEO keywords',
  `content` longtext COLLATE utf8mb4_unicode_ci COMMENT 'Page content (legacy)',
  `layout` json DEFAULT NULL COMMENT 'Page layout configuration',
  `settings` json DEFAULT NULL COMMENT 'Page settings',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL COMMENT 'When page was published',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `html_content` longtext COLLATE utf8mb4_unicode_ci,
  `css_content` text COLLATE utf8mb4_unicode_ci,
  `updated_html_at` timestamp NULL DEFAULT NULL,
  `header_slug` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'header-1',
  `footer_slug` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'footer-1',
  `banner_slug` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'banner-default',
  `disabled` tinyint(1) DEFAULT '0',
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `meta_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduled_for` timestamp NULL DEFAULT NULL,
  `published_layout` json DEFAULT NULL,
  `header_id` bigint unsigned DEFAULT NULL,
  `footer_id` bigint unsigned DEFAULT NULL,
  `banner_id` bigint unsigned DEFAULT NULL,
  `meta_image_id` bigint unsigned DEFAULT NULL,
  `current_revision_id` bigint unsigned DEFAULT NULL,
  `published_revision_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_pages_slug` (`slug`),
  KEY `idx_pages_status` (`status`),
  KEY `idx_pages_updated` (`updated_at`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (2,'home','','',NULL,NULL,NULL,NULL,'{\"id\": \"2\", \"name\": \"Home\", \"sections\": [{\"id\": \"section-1775029183429\", \"name\": \"Filter\", \"type\": \"custom\", \"props\": {}, \"columns\": [{\"id\": \"col-1775029183429-0\", \"width\": 100, \"components\": []}], \"settings\": {}, \"container\": {\"id\": \"container-1\", \"rows\": [{\"id\": \"row-1775029183429\", \"columns\": [{\"id\": \"col-1775029183429-0\", \"width\": 100, \"components\": []}]}]}}]}',NULL,'draft',NULL,'2025-12-08 16:29:47','2026-04-06 04:26:36',NULL,NULL,NULL,'header-5','footer-1','banner-default',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'services','Services','',NULL,NULL,NULL,NULL,'{\"id\": \"13\", \"name\": \"Services\", \"sections\": []}',NULL,'draft',NULL,'2026-03-31 17:09:41','2026-03-31 17:09:59',NULL,NULL,NULL,'header-1','footer-1','banner-default',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,'about','About','',NULL,NULL,NULL,NULL,'{\"id\": \"14\", \"name\": \"About\", \"sections\": [{\"id\": \"section-1774977017414\", \"name\": \"Advanced Image\", \"type\": \"custom\", \"props\": {}, \"columns\": [{\"id\": \"col-1774977017414-0\", \"width\": 49, \"components\": [{\"id\": \"advancedImage-1774977022742-8ivfp7ft6\", \"type\": \"advancedImage\", \"label\": \"Advanced Image\", \"props\": {\"alt\": \"Image\", \"src\": \"/uploads/be598d36-1360-460c-93b9-11f958547507.png\", \"shape\": \"default\", \"width\": \"100%\", \"filter\": \"none\", \"height\": \"auto\", \"shadow\": \"none\", \"caption\": \"\", \"lazyLoad\": false, \"alignment\": \"left\", \"hoverZoom\": 1.1, \"imageZoom\": 1, \"objectFit\": \"cover\", \"customShape\": \"\", \"hoverEffect\": \"none\", \"overlayText\": \"\", \"showOverlay\": false, \"borderRadius\": 0, \"overlayColor\": \"#000000\", \"showLightbox\": false, \"hoverDuration\": 0.3, \"objectPosition\": \"center\", \"overlayOpacity\": 0.3, \"captionPosition\": \"bottom\", \"hoverBrightness\": 1.2, \"captionAlignment\": \"center\", \"componentPositionX\": \"0px\", \"componentPositionY\": \"0px\", \"gradientBorderType\": \"conic\", \"showGradientBorder\": false, \"gradientBorderWidth\": \"10px\", \"gradientBorderColors\": \"#7f00ff, #00dbde, #7f00ff\", \"gradientBorderDirection\": \"135deg\"}}]}, {\"id\": \"col-1774977017414-1\", \"width\": 51, \"components\": [{\"id\": \"advancedheading-1774977025238-ns2jg25fb\", \"type\": \"advancedheading\", \"label\": \"Advanced Heading\", \"props\": {\"role\": \"heading\", \"text\": \" About Curve Metrics Solutions Pvt. Ltd.\", \"color\": \"var(--canvas-text, #111111)\", \"level\": \"h1\", \"autoId\": true, \"htmlTag\": \"auto\", \"customId\": \"\", \"fontSize\": 40, \"maxWidth\": \"100%\", \"ariaLabel\": \"\", \"ariaLevel\": 2, \"className\": \"\", \"marginTop\": \"0\", \"textAlign\": \"left\", \"fontFamily\": \"\'DM Sans\', system-ui, sans-serif\", \"fontWeight\": \"700\", \"hoverColor\": \"var(--canvas-accent2, #0056b3)\", \"lineHeight\": \"1.2\", \"marginLeft\": \"0\", \"paddingTop\": \"0\", \"componentId\": \"\", \"marginRight\": \"0\", \"paddingLeft\": \"0\", \"dataTracking\": \"\", \"marginBottom\": \"16px\", \"paddingRight\": \"0\", \"seoMaxLength\": 60, \"highlightText\": \"\", \"letterSpacing\": \"0px\", \"paddingBottom\": \"0\", \"semanticLevel\": \"h1\", \"textTransform\": \"none\", \"fontSizeMobile\": \"\", \"fontSizeTablet\": \"\", \"highlightColor\": \"var(--canvas-accent2, #a594ff)\", \"enableSeoChecks\": true, \"textAlignMobile\": \"center\", \"textAlignTablet\": \"left\", \"usePresetStyles\": true}}, {\"id\": \"advancedparagraph-1774977032719-4y5w5gmke\", \"type\": \"advancedparagraph\", \"label\": \"Advanced Paragraph\", \"props\": {\"role\": \"paragraph\", \"text\": \"At Curve Metrics, we are a team of technology innovators, data scientists, and digital marketers who believe in building impactful digital solutions for organizations across India. Our focus is on accuracy, scalability, and trust delivering results that matter.\", \"width\": \"100%\", \"border\": \"none\", \"margin\": \"0 0 16px 0\", \"display\": \"block\", \"opacity\": 1, \"padding\": \"0\", \"customId\": \"\", \"editable\": true, \"fontSize\": \"16px\", \"maxLines\": 0, \"maxWidth\": \"100%\", \"tabIndex\": 0, \"truncate\": false, \"ariaLabel\": \"\", \"boxShadow\": \"none\", \"className\": \"\", \"fontStyle\": \"normal\", \"marginTop\": \"0\", \"minHeight\": \"auto\", \"textAlign\": \"left\", \"textColor\": \"var(--canvas-muted, #333333)\", \"fontFamily\": \"inherit\", \"fontWeight\": \"normal\", \"hoverColor\": \"var(--canvas-accent2, #0056b3)\", \"lineHeight\": \"1.6\", \"marginLeft\": \"0\", \"paddingTop\": \"0\", \"selectable\": true, \"textShadow\": \"none\", \"transition\": \"all 0.2s ease\", \"borderColor\": \"transparent\", \"componentId\": \"\", \"hoverEffect\": \"none\", \"marginRight\": \"0\", \"paddingLeft\": \"0\", \"borderRadius\": \"0px\", \"marginBottom\": \"16px\", \"paddingRight\": \"0\", \"letterSpacing\": \"normal\", \"paddingBottom\": \"0\", \"textTransform\": \"none\", \"allowedFormats\": [\"bold\", \"italic\", \"underline\", \"color\"], \"enableRichText\": true, \"fontSizeMobile\": \"\", \"fontSizeTablet\": \"\", \"hoverTextColor\": \"var(--canvas-accent2, #000000)\", \"textDecoration\": \"none\", \"backgroundColor\": \"transparent\", \"textAlignMobile\": \"center\", \"textAlignTablet\": \"left\", \"lineHeightMobile\": \"\", \"hoverBackgroundColor\": \"var(--canvas-surface, #f5f5f5)\"}}]}], \"settings\": {\"maxWidth\": 1600, \"sideSpacing\": 0, \"containerType\": \"boxed\"}, \"container\": {\"id\": \"container-1774977017414\", \"rows\": [{\"id\": \"row-1774977017414\", \"columns\": [{\"id\": \"col-1774977017414-0\", \"width\": 49, \"components\": [{\"id\": \"advancedImage-1774977022742-8ivfp7ft6\", \"type\": \"advancedImage\", \"label\": \"Advanced Image\", \"props\": {\"alt\": \"Image\", \"src\": \"/uploads/be598d36-1360-460c-93b9-11f958547507.png\", \"shape\": \"default\", \"width\": \"100%\", \"filter\": \"none\", \"height\": \"auto\", \"shadow\": \"none\", \"caption\": \"\", \"lazyLoad\": false, \"alignment\": \"left\", \"hoverZoom\": 1.1, \"imageZoom\": 1, \"objectFit\": \"cover\", \"customShape\": \"\", \"hoverEffect\": \"none\", \"overlayText\": \"\", \"showOverlay\": false, \"borderRadius\": 0, \"overlayColor\": \"#000000\", \"showLightbox\": false, \"hoverDuration\": 0.3, \"objectPosition\": \"center\", \"overlayOpacity\": 0.3, \"captionPosition\": \"bottom\", \"hoverBrightness\": 1.2, \"captionAlignment\": \"center\", \"componentPositionX\": \"0px\", \"componentPositionY\": \"0px\", \"gradientBorderType\": \"conic\", \"showGradientBorder\": false, \"gradientBorderWidth\": \"10px\", \"gradientBorderColors\": \"#7f00ff, #00dbde, #7f00ff\", \"gradientBorderDirection\": \"135deg\"}}]}, {\"id\": \"col-1774977017414-1\", \"width\": 51, \"components\": [{\"id\": \"advancedheading-1774977025238-ns2jg25fb\", \"type\": \"advancedheading\", \"label\": \"Advanced Heading\", \"props\": {\"role\": \"heading\", \"text\": \" About Curve Metrics Solutions Pvt. Ltd.\", \"color\": \"var(--canvas-text, #111111)\", \"level\": \"h1\", \"autoId\": true, \"htmlTag\": \"auto\", \"customId\": \"\", \"fontSize\": 40, \"maxWidth\": \"100%\", \"ariaLabel\": \"\", \"ariaLevel\": 2, \"className\": \"\", \"marginTop\": \"0\", \"textAlign\": \"left\", \"fontFamily\": \"\'DM Sans\', system-ui, sans-serif\", \"fontWeight\": \"700\", \"hoverColor\": \"var(--canvas-accent2, #0056b3)\", \"lineHeight\": \"1.2\", \"marginLeft\": \"0\", \"paddingTop\": \"0\", \"componentId\": \"\", \"marginRight\": \"0\", \"paddingLeft\": \"0\", \"dataTracking\": \"\", \"marginBottom\": \"16px\", \"paddingRight\": \"0\", \"seoMaxLength\": 60, \"highlightText\": \"\", \"letterSpacing\": \"0px\", \"paddingBottom\": \"0\", \"semanticLevel\": \"h1\", \"textTransform\": \"none\", \"fontSizeMobile\": \"\", \"fontSizeTablet\": \"\", \"highlightColor\": \"var(--canvas-accent2, #a594ff)\", \"enableSeoChecks\": true, \"textAlignMobile\": \"center\", \"textAlignTablet\": \"left\", \"usePresetStyles\": true}}, {\"id\": \"advancedparagraph-1774977032719-4y5w5gmke\", \"type\": \"advancedparagraph\", \"label\": \"Advanced Paragraph\", \"props\": {\"role\": \"paragraph\", \"text\": \"At Curve Metrics, we are a team of technology innovators, data scientists, and digital marketers who believe in building impactful digital solutions for organizations across India. Our focus is on accuracy, scalability, and trust delivering results that matter.\", \"width\": \"100%\", \"border\": \"none\", \"margin\": \"0 0 16px 0\", \"display\": \"block\", \"opacity\": 1, \"padding\": \"0\", \"customId\": \"\", \"editable\": true, \"fontSize\": \"16px\", \"maxLines\": 0, \"maxWidth\": \"100%\", \"tabIndex\": 0, \"truncate\": false, \"ariaLabel\": \"\", \"boxShadow\": \"none\", \"className\": \"\", \"fontStyle\": \"normal\", \"marginTop\": \"0\", \"minHeight\": \"auto\", \"textAlign\": \"left\", \"textColor\": \"var(--canvas-muted, #333333)\", \"fontFamily\": \"inherit\", \"fontWeight\": \"normal\", \"hoverColor\": \"var(--canvas-accent2, #0056b3)\", \"lineHeight\": \"1.6\", \"marginLeft\": \"0\", \"paddingTop\": \"0\", \"selectable\": true, \"textShadow\": \"none\", \"transition\": \"all 0.2s ease\", \"borderColor\": \"transparent\", \"componentId\": \"\", \"hoverEffect\": \"none\", \"marginRight\": \"0\", \"paddingLeft\": \"0\", \"borderRadius\": \"0px\", \"marginBottom\": \"16px\", \"paddingRight\": \"0\", \"letterSpacing\": \"normal\", \"paddingBottom\": \"0\", \"textTransform\": \"none\", \"allowedFormats\": [\"bold\", \"italic\", \"underline\", \"color\"], \"enableRichText\": true, \"fontSizeMobile\": \"\", \"fontSizeTablet\": \"\", \"hoverTextColor\": \"var(--canvas-accent2, #000000)\", \"textDecoration\": \"none\", \"backgroundColor\": \"transparent\", \"textAlignMobile\": \"center\", \"textAlignTablet\": \"left\", \"lineHeightMobile\": \"\", \"hoverBackgroundColor\": \"var(--canvas-surface, #f5f5f5)\"}}]}]}]}}]}',NULL,'draft',NULL,'2026-03-31 17:10:12','2026-04-01 14:23:14',NULL,NULL,NULL,'header-1','footer-1','banner-default',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partners`
--

DROP TABLE IF EXISTS `partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `image` varchar(500) NOT NULL,
  `url` varchar(500) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partners`
--

LOCK TABLES `partners` WRITE;
/*!40000 ALTER TABLE `partners` DISABLE KEYS */;
/*!40000 ALTER TABLE `partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pricing`
--

DROP TABLE IF EXISTS `pricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` varchar(100) NOT NULL,
  `period` varchar(50) DEFAULT NULL,
  `description` text,
  `features` json DEFAULT NULL,
  `is_popular` tinyint(1) DEFAULT '0',
  `cta_label` varchar(255) DEFAULT NULL,
  `cta_link` varchar(500) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricing`
--

LOCK TABLES `pricing` WRITE;
/*!40000 ALTER TABLE `pricing` DISABLE KEYS */;
/*!40000 ALTER TABLE `pricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `image` varchar(500) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `client` varchar(255) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `page_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `columns_count` int DEFAULT '1',
  `section_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sticky_enabled` tinyint(1) DEFAULT '0',
  `sticky_column_index` int DEFAULT '0',
  `sticky_position` varchar(20) DEFAULT 'top',
  `sticky_offset` int DEFAULT '120',
  `props` json DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sections_page_id` (`page_id`),
  CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37444 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sections`
--

LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES (37436,14,'Advanced Image',1,0,'2026-04-01 14:23:14',0,NULL,NULL,0,'{}','custom'),(37443,2,'Filter',1,0,'2026-04-06 04:26:36',0,NULL,NULL,0,'{}','custom');
/*!40000 ALTER TABLE `sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `icon` varchar(100) DEFAULT NULL,
  `image` varchar(500) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `site_name` varchar(255) DEFAULT NULL,
  `site_url` varchar(500) DEFAULT NULL,
  `logo` varchar(500) DEFAULT NULL,
  `logo_dark` varchar(500) DEFAULT NULL,
  `favicon` varchar(500) DEFAULT NULL,
  `primary_color` varchar(50) DEFAULT '#7c5cfc',
  `secondary_color` varchar(50) DEFAULT NULL,
  `heading_font` varchar(255) DEFAULT 'Inter',
  `body_font` varchar(255) DEFAULT 'Inter',
  `google_analytics_id` varchar(100) DEFAULT NULL,
  `facebook_pixel_id` varchar(100) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(100) DEFAULT NULL,
  `address` text,
  `whatsapp_number` varchar(50) DEFAULT NULL,
  `instagram_url` varchar(500) DEFAULT NULL,
  `linkedin_url` varchar(500) DEFAULT NULL,
  `twitter_url` varchar(500) DEFAULT NULL,
  `facebook_url` varchar(500) DEFAULT NULL,
  `youtube_url` varchar(500) DEFAULT NULL,
  `custom_css` text,
  `custom_js` text,
  `robots_txt` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `meta_description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,NULL,NULL,NULL,NULL,NULL,'#7c5cfc',NULL,'Inter','Inter',NULL,NULL,NULL,NULL,NULL,'','','','',NULL,NULL,NULL,NULL,NULL,'2026-03-23 19:30:50','2026-03-25 08:27:00',NULL);
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social`
--

DROP TABLE IF EXISTS `social`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social` (
  `id` int NOT NULL AUTO_INCREMENT,
  `platform` varchar(100) NOT NULL,
  `url` varchar(500) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social`
--

LOCK TABLES `social` WRITE;
/*!40000 ALTER TABLE `social` DISABLE KEYS */;
/*!40000 ALTER TABLE `social` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stats`
--

DROP TABLE IF EXISTS `stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `value` varchar(100) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stats`
--

LOCK TABLES `stats` WRITE;
/*!40000 ALTER TABLE `stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team`
--

DROP TABLE IF EXISTS `team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `bio` text,
  `image` varchar(500) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(500) DEFAULT NULL,
  `order_index` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team`
--

LOCK TABLES `team` WRITE;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
/*!40000 ALTER TABLE `team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timeline`
--

DROP TABLE IF EXISTS `timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timeline` (
  `id` int NOT NULL AUTO_INCREMENT,
  `year` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `order_index` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timeline`
--

LOCK TABLES `timeline` WRITE;
/*!40000 ALTER TABLE `timeline` DISABLE KEYS */;
/*!40000 ALTER TABLE `timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'admin'
--

--
-- Dumping routines for database 'admin'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-06 10:37:06
