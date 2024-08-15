CREATE TABLE `fulltime_banners` (
	`id` varchar(256) NOT NULL,
	`name` varchar(2048) NOT NULL,
	`description` text,
	`is_active` boolean NOT NULL DEFAULT false,
	`expires_at` bigint NOT NULL,
	`created_at` bigint NOT NULL DEFAULT 0,
	`updated_at` bigint,
	CONSTRAINT `fulltime_banners_id` PRIMARY KEY(`id`)
);
