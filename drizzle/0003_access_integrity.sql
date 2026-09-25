CREATE TRIGGER session_membership_insert BEFORE INSERT ON sessions WHEN NEW.membership_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM memberships m WHERE m.id=NEW.membership_id AND m.user_id=NEW.user_id AND m.organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT,'SESSION_MEMBERSHIP_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER relationship_clinic_insert BEFORE INSERT ON care_relationships WHEN NOT EXISTS (SELECT 1 FROM patients p WHERE p.id=NEW.patient_id AND p.clinic_id=NEW.clinic_id AND p.organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT,'CLINIC_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER relationship_authority_insert BEFORE INSERT ON care_relationships WHEN NEW.authority_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM processing_authorities a WHERE a.id=NEW.authority_id AND a.patient_id=NEW.patient_id AND a.organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT,'AUTHORITY_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER credential_status_insert BEFORE INSERT ON provider_credentials WHEN NEW.status NOT IN ('Unverified','Pending','Verified','Restricted','Suspended','Expired') BEGIN SELECT RAISE(ABORT,'INVALID_CREDENTIAL_STATUS'); END;
--> statement-breakpoint
CREATE TRIGGER consent_status_insert BEFORE INSERT ON consent_records WHEN NEW.status NOT IN ('Granted','Declined','Withdrawn','Expired') OR NEW.version<1 BEGIN SELECT RAISE(ABORT,'INVALID_CONSENT'); END;
--> statement-breakpoint
CREATE TRIGGER membership_role_insert BEFORE INSERT ON memberships WHEN NEW.role NOT IN ('Patient','Authorized Representative','Healthcare Professional','Clinic Staff','Care Coordinator','Clinic Administrator','Organization Administrator','Privacy Officer','Security Officer','Auditor','Integration Administrator','Support Agent','System Administrator') BEGIN SELECT RAISE(ABORT,'INVALID_ROLE'); END;
--> statement-breakpoint
CREATE TRIGGER session_membership_update BEFORE UPDATE ON sessions WHEN NEW.membership_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM memberships m WHERE m.id=NEW.membership_id AND m.user_id=NEW.user_id AND m.organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT,'SESSION_MEMBERSHIP_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER relationship_clinic_update BEFORE UPDATE ON care_relationships WHEN NOT EXISTS (SELECT 1 FROM patients p WHERE p.id=NEW.patient_id AND p.clinic_id=NEW.clinic_id AND p.organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT,'CLINIC_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER relationship_authority_update BEFORE UPDATE ON care_relationships WHEN NEW.authority_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM processing_authorities a WHERE a.id=NEW.authority_id AND a.patient_id=NEW.patient_id AND a.organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT,'AUTHORITY_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER credential_status_update BEFORE UPDATE ON provider_credentials WHEN NEW.status NOT IN ('Unverified','Pending','Verified','Restricted','Suspended','Expired') BEGIN SELECT RAISE(ABORT,'INVALID_CREDENTIAL_STATUS'); END;
--> statement-breakpoint
CREATE TRIGGER consent_status_update BEFORE UPDATE ON consent_records WHEN NEW.status NOT IN ('Granted','Declined','Withdrawn','Expired') OR NEW.version<1 BEGIN SELECT RAISE(ABORT,'INVALID_CONSENT'); END;
--> statement-breakpoint
CREATE TRIGGER membership_role_update BEFORE UPDATE ON memberships WHEN NEW.role NOT IN ('Patient','Authorized Representative','Healthcare Professional','Clinic Staff','Care Coordinator','Clinic Administrator','Organization Administrator','Privacy Officer','Security Officer','Auditor','Integration Administrator','Support Agent','System Administrator') BEGIN SELECT RAISE(ABORT,'INVALID_ROLE'); END;
--> statement-breakpoint
CREATE UNIQUE INDEX unique_consent_version ON consent_records(organization_id,patient_id,recipient,scope,purpose,version);
--> statement-breakpoint
CREATE UNIQUE INDEX unique_role_permission ON role_permissions(role,permission);
