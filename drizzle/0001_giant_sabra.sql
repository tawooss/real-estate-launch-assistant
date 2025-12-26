CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`analysisId` int,
	`title` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` varchar(50) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `propertyAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`location` varchar(255) NOT NULL,
	`size_sqm` int NOT NULL,
	`bedrooms` int NOT NULL,
	`bathrooms` int NOT NULL,
	`floor` int NOT NULL,
	`has_elevator` boolean NOT NULL,
	`has_parking` boolean NOT NULL,
	`finishing_quality` varchar(50) NOT NULL,
	`near_beach` boolean NOT NULL,
	`property_value_egp` int,
	`recommended_price_egp` int,
	`price_range_min` int,
	`price_range_max` int,
	`pricing_strategy` varchar(100),
	`confidence` varchar(50),
	`pricing_reasoning` text,
	`readiness_score` int,
	`readiness_status` varchar(50),
	`checklist_completed` json,
	`checklist_pending` json,
	`estimated_days_to_launch` int,
	`risk_level` varchar(50),
	`key_risks` json,
	`mitigation_strategies` json,
	`next_steps` json,
	`retrieved_documents` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `propertyAnalyses_id` PRIMARY KEY(`id`)
);
