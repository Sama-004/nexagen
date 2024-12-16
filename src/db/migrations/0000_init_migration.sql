CREATE TABLE `emails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message_id` text,
	`sender` text NOT NULL,
	`subject` text,
	`timestamp` integer NOT NULL,
	`body` text,
	`processed` integer DEFAULT false
);
--> statement-breakpoint
CREATE UNIQUE INDEX `emails_message_id_unique` ON `emails` (`message_id`);