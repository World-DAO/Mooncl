-- NFT表创建脚本
DROP TABLE IF EXISTS `nft`;
CREATE TABLE `nft` (
  `token_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Token ID',
  `owner_address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所有者地址',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'NFT内容',
  `evaluate_price` decimal(20,8) DEFAULT NULL COMMENT '评估价格(ETH)',
  `current_price` decimal(20,8) DEFAULT NULL COMMENT '当前价格(ETH)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`token_id`),
  KEY `idx_owner_address` (`owner_address`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='NFT表';
