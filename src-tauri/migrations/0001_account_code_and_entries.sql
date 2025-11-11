CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`accountId` integer NOT NULL,
	`amount` integer NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL,
	`deletedAt` text,
	FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD `code` text NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `createdAt` text DEFAULT (current_timestamp) NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `updatedAt` text DEFAULT (current_timestamp) NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `deletedAt` text;--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_name_unique` ON `accounts` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_code_unique` ON `accounts` (`code`);