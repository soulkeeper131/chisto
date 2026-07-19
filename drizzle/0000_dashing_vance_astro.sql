CREATE TABLE `findings` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text,
	`reported_by_id` text,
	`title` text NOT NULL,
	`text` text DEFAULT '',
	`photos` text DEFAULT '[]',
	`status` text DEFAULT 'reported',
	`offer` text,
	`decision` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reported_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `issues` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text,
	`property_id` text,
	`reported_by_id` text,
	`text` text NOT NULL,
	`photos` text DEFAULT '[]',
	`open` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reported_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text,
	`template_id` text,
	`name` text NOT NULL,
	`module` text NOT NULL,
	`season` text DEFAULT 'all',
	`per_month` integer DEFAULT 1,
	`price` integer DEFAULT 0,
	`active` integer DEFAULT true,
	`started_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`addr` text DEFAULT '',
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`type` text DEFAULT 'apartment',
	`owner_id` text,
	`radius` integer DEFAULT 75,
	`access` text DEFAULT '',
	`utils` text DEFAULT '',
	`zones` text DEFAULT '[]',
	`vacant_since` integer,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text,
	`template_id` text,
	`assignee_id` text,
	`planned_at` integer NOT NULL,
	`status` text DEFAULT 'planned',
	`check_in` integer,
	`check_out` integer,
	`in_zone` integer,
	`gps_acc` integer,
	`items` text DEFAULT '[]',
	`plan_id` text,
	`review` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`module` text NOT NULL,
	`mins` integer NOT NULL,
	`icon` text DEFAULT '📋',
	`season` text DEFAULT 'all',
	`items` text DEFAULT '[]',
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`color` text DEFAULT '#0F172A',
	`sub` text DEFAULT '',
	`created_at` integer DEFAULT (unixepoch())
);
