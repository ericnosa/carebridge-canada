CREATE TABLE `ai_model_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`model` text NOT NULL,
	`vendor_id` text,
	`allowed_uses` text NOT NULL,
	`status` text DEFAULT 'disabled' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendor_registry`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ai_model_registry_org` ON `ai_model_registry` (`organization_id`);--> statement-breakpoint
CREATE TABLE `ai_prompt_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`model_id` text NOT NULL,
	`version` integer NOT NULL,
	`source_records` text,
	`reviewer` text,
	`status` text DEFAULT 'Under Review' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_id`) REFERENCES `ai_model_registry`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ai_prompt_registry_org` ON `ai_prompt_registry` (`organization_id`);--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`actor` text NOT NULL,
	`role` text NOT NULL,
	`patient_id` text,
	`resource` text NOT NULL,
	`action` text NOT NULL,
	`purpose` text NOT NULL,
	`authorization_result` text NOT NULL,
	`session_context` text,
	`result` text NOT NULL,
	`correlation_id` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_events_org` ON `audit_events` (`organization_id`);--> statement-breakpoint
CREATE TABLE `care_relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`clinic_id` text NOT NULL,
	`authority_id` text,
	`relationship_type` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_care_relationships_org` ON `care_relationships` (`organization_id`);--> statement-breakpoint
CREATE TABLE `clinical_content_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`title` text NOT NULL,
	`source_organization` text NOT NULL,
	`source_url` text NOT NULL,
	`jurisdiction` text NOT NULL,
	`source_version` text,
	`reviewer` text,
	`approved_at` integer,
	`next_review_at` integer,
	`version` integer NOT NULL,
	`status` text DEFAULT 'SOURCE VERIFICATION REQUIRED' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_clinical_content_registry_org` ON `clinical_content_registry` (`organization_id`);--> statement-breakpoint
CREATE TABLE `clinical_pathways` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`content_id` text NOT NULL,
	`version` integer NOT NULL,
	`rules` text NOT NULL,
	`reviewer` text,
	`evidence` text,
	`status` text DEFAULT 'Under Review' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`content_id`) REFERENCES `clinical_content_registry`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_clinical_pathways_org` ON `clinical_pathways` (`organization_id`);--> statement-breakpoint
CREATE TABLE `clinics` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_clinics_org` ON `clinics` (`organization_id`);--> statement-breakpoint
CREATE TABLE `connector_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`vendor` text NOT NULL,
	`jurisdiction` text NOT NULL,
	`purpose` text NOT NULL,
	`data_types` text NOT NULL,
	`protocol` text,
	`authentication` text,
	`direction` text DEFAULT 'none' NOT NULL,
	`authorization_requirements` text,
	`agreement_status` text DEFAULT 'Not Started' NOT NULL,
	`security_review` text DEFAULT 'Not Started' NOT NULL,
	`privacy_review` text DEFAULT 'Not Started' NOT NULL,
	`last_validation` integer,
	`status` text DEFAULT 'Candidate' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_connector_registry_org` ON `connector_registry` (`organization_id`);--> statement-breakpoint
CREATE TABLE `consent_records` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`representative_id` text,
	`recipient` text NOT NULL,
	`scope` text NOT NULL,
	`purpose` text NOT NULL,
	`effective_at` integer NOT NULL,
	`expires_at` integer,
	`withdrawn_at` integer,
	`policy_version` text NOT NULL,
	`version` integer NOT NULL,
	`evidence` text NOT NULL,
	`status` text DEFAULT 'Declined' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_consent_records_org` ON `consent_records` (`organization_id`);--> statement-breakpoint
CREATE TABLE `governance_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`owner` text,
	`reviewer` text,
	`evidence` text,
	`reviewed_at` integer,
	`next_review_at` integer,
	`status` text DEFAULT 'Not Started' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "evidence_for_completion" CHECK("governance_evidence"."status" NOT IN ('Approved','Validated','Production Authorized') OR ("governance_evidence"."owner" IS NOT NULL AND "governance_evidence"."reviewer" IS NOT NULL AND "governance_evidence"."owner" <> "governance_evidence"."reviewer" AND "governance_evidence"."evidence" IS NOT NULL AND "governance_evidence"."reviewed_at" IS NOT NULL AND "governance_evidence"."next_review_at" > "governance_evidence"."reviewed_at"))
);
--> statement-breakpoint
CREATE INDEX `idx_governance_evidence_org` ON `governance_evidence` (`organization_id`);--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`type` text NOT NULL,
	`severity` text NOT NULL,
	`detected_at` integer NOT NULL,
	`affected_systems` text,
	`affected_users` integer,
	`phi_involved` integer DEFAULT false NOT NULL,
	`containment` text,
	`root_cause` text,
	`remediation` text,
	`reviewer` text,
	`status` text DEFAULT 'open' NOT NULL,
	`notification_review` text DEFAULT 'PRIVACY / LEGAL REVIEW REQUIRED' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_incidents_org` ON `incidents` (`organization_id`);--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`clinic_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_memberships_org` ON `memberships` (`organization_id`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patient_representatives` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`user_id` text NOT NULL,
	`authority_evidence` text NOT NULL,
	`expires_at` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_patient_representatives_org` ON `patient_representatives` (`organization_id`);--> statement-breakpoint
CREATE TABLE `patients` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`clinic_id` text NOT NULL,
	`synthetic_label` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "synthetic_patient_only" CHECK("patients"."synthetic_label" LIKE 'SYNTHETIC:%')
);
--> statement-breakpoint
CREATE INDEX `idx_patients_org` ON `patients` (`organization_id`);--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permissions_name_unique` ON `permissions` (`name`);--> statement-breakpoint
CREATE TABLE `policy_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`title` text NOT NULL,
	`version` integer NOT NULL,
	`reviewer` text,
	`evidence` text,
	`status` text DEFAULT 'Under Review' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_policy_registry_org` ON `policy_registry` (`organization_id`);--> statement-breakpoint
CREATE TABLE `privacy_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`request_type` text NOT NULL,
	`patient_id` text,
	`owner` text,
	`due_at` integer,
	`status` text DEFAULT 'open' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_privacy_requests_org` ON `privacy_requests` (`organization_id`);--> statement-breakpoint
CREATE TABLE `processing_authorities` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`patient_id` text,
	`basis` text NOT NULL,
	`purpose` text NOT NULL,
	`scope` text NOT NULL,
	`reviewer` text,
	`evidence` text,
	`effective_at` integer,
	`expires_at` integer,
	`status` text DEFAULT 'Under Review' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_processing_authorities_org` ON `processing_authorities` (`organization_id`);--> statement-breakpoint
CREATE TABLE `provider_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`regulator` text NOT NULL,
	`jurisdiction` text NOT NULL,
	`registration_number` text,
	`verification_source` text,
	`evidence_id` text,
	`verified_at` integer,
	`expires_at` integer,
	`restrictions` text,
	`status` text DEFAULT 'Unverified' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_provider_credentials_org` ON `provider_credentials` (`organization_id`);--> statement-breakpoint
CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`profession` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_providers_org` ON `providers` (`organization_id`);--> statement-breakpoint
CREATE TABLE `retention_policies` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`resource_type` text NOT NULL,
	`retention_days` integer,
	`legal_hold` integer DEFAULT true NOT NULL,
	`reviewer` text,
	`status` text DEFAULT 'Under Review' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_retention_policies_org` ON `retention_policies` (`organization_id`);--> statement-breakpoint
CREATE TABLE `risk_register` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`asset` text NOT NULL,
	`threat` text NOT NULL,
	`likelihood` text NOT NULL,
	`impact` text NOT NULL,
	`mitigation` text,
	`owner` text,
	`review_at` integer,
	`status` text DEFAULT 'open' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_risk_register_org` ON `risk_register` (`organization_id`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_unique` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE `security_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`category` text NOT NULL,
	`severity` text NOT NULL,
	`correlation_id` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_security_events_org` ON `security_events` (`organization_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`mfa_verified_at` integer,
	`expires_at` integer NOT NULL,
	`revoked_at` integer,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_sessions_org` ON `sessions` (`organization_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`subject` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_subject_unique` ON `users` (`subject`);--> statement-breakpoint
CREATE TABLE `vendor_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`processor_location` text,
	`agreement_evidence` text,
	`privacy_review` text DEFAULT 'Not Started' NOT NULL,
	`security_review` text DEFAULT 'Not Started' NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_vendor_registry_org` ON `vendor_registry` (`organization_id`);