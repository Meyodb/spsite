-- Schéma base de données Soup Juice
-- Compatible MySQL 5.7+ / MariaDB
-- Créer la base : CREATE DATABASE soup_juice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; USE soup_juice;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table category (catégories de produits : JUS, SOUPES, etc.)
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT 'Code utilisé dans le front (JUS, SOUPES, PLATS CHAUDS...)',
  `label_fr` varchar(100) DEFAULT NULL,
  `label_en` varchar(100) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table produit
-- ----------------------------
DROP TABLE IF EXISTS `produit`;
CREATE TABLE `produit` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category_id` int unsigned NOT NULL,
  `subcategory` varchar(50) DEFAULT NULL COMMENT 'Ex. pour DESSERTS : DOUCEURS, PATISSERIE, COOKIES, CAKE',
  `price` decimal(5,2) DEFAULT NULL,
  `volume` varchar(20) DEFAULT NULL COMMENT 'Ex. 47 cl',
  `description` text,
  `extra_price` decimal(5,2) DEFAULT NULL,
  `extra_price_label` varchar(20) DEFAULT NULL COMMENT 'Ex. +1,50€ pour affichage',
  `visible` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_produit_category` (`category_id`),
  KEY `idx_produit_visible` (`visible`),
  CONSTRAINT `fk_produit_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table restaurant (points de vente / stores)
-- ----------------------------
DROP TABLE IF EXISTS `restaurant`;
CREATE TABLE `restaurant` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL COMMENT 'Nom du point de vente',
  `city` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `hours` varchar(100) DEFAULT NULL COMMENT 'Ex. 9h-21h',
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_restaurant_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table restaurant_service (services par restaurant : click&collect, terrasse...)
-- ----------------------------
DROP TABLE IF EXISTS `restaurant_service`;
CREATE TABLE `restaurant_service` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `restaurant_id` int unsigned NOT NULL,
  `service_code` varchar(50) NOT NULL COMMENT 'Ex. click_and_collect, terrasse',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_restaurant_service` (`restaurant_id`,`service_code`),
  CONSTRAINT `fk_restaurant_service_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table promo
-- ----------------------------
DROP TABLE IF EXISTS `promo`;
CREATE TABLE `promo` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL COMMENT 'Code promo optionnel',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_promo_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table newsletter_subscriber
-- ----------------------------
DROP TABLE IF EXISTS `newsletter_subscriber`;
CREATE TABLE `newsletter_subscriber` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_newsletter_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
