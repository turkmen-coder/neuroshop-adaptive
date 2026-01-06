CREATE TABLE `behavior_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` varchar(128) NOT NULL,
	`avgClickSpeed` decimal(10,2),
	`totalClicks` int NOT NULL DEFAULT 0,
	`impulsiveClicks` int NOT NULL DEFAULT 0,
	`avgScrollSpeed` decimal(10,2),
	`maxScrollDepth` int NOT NULL DEFAULT 0,
	`avgDwellTime` decimal(10,2),
	`pagesVisited` int NOT NULL DEFAULT 0,
	`bounceRate` decimal(5,2),
	`searchTerms` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `behavior_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cart_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','processing','completed','cancelled') NOT NULL DEFAULT 'pending',
	`shippingAddress` text,
	`items` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_psychology` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`appealsToOpenness` int NOT NULL DEFAULT 50,
	`appealsToConscientiousness` int NOT NULL DEFAULT 50,
	`appealsToExtraversion` int NOT NULL DEFAULT 50,
	`appealsToAgreeableness` int NOT NULL DEFAULT 50,
	`appealsToNeuroticism` int NOT NULL DEFAULT 50,
	`mianziScore` int NOT NULL DEFAULT 50,
	`ubuntuScore` int NOT NULL DEFAULT 50,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_psychology_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_psychology_productId_unique` UNIQUE(`productId`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`imageUrl` text,
	`category` varchar(100),
	`stock` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_personality_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`openness` int NOT NULL DEFAULT 50,
	`conscientiousness` int NOT NULL DEFAULT 50,
	`extraversion` int NOT NULL DEFAULT 50,
	`agreeableness` int NOT NULL DEFAULT 50,
	`neuroticism` int NOT NULL DEFAULT 50,
	`dominantTrait` enum('openness','conscientiousness','extraversion','agreeableness','neuroticism'),
	`culturalContext` enum('western','asian','african','middle_eastern') NOT NULL DEFAULT 'western',
	`confidenceScore` int NOT NULL DEFAULT 0,
	`consentGiven` boolean NOT NULL DEFAULT false,
	`dataTransparency` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_personality_profiles_id` PRIMARY KEY(`id`)
);
