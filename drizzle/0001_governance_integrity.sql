CREATE TRIGGER ai_model_registry_vendor_id_insert_tenant BEFORE INSERT ON ai_model_registry WHEN NEW.vendor_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vendor_registry WHERE id=NEW.vendor_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER ai_model_registry_vendor_id_update_tenant BEFORE UPDATE ON ai_model_registry WHEN NEW.vendor_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vendor_registry WHERE id=NEW.vendor_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER ai_model_registry_tenant_immutable BEFORE UPDATE OF organization_id ON ai_model_registry WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER ai_prompt_registry_model_id_insert_tenant BEFORE INSERT ON ai_prompt_registry WHEN NEW.model_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ai_model_registry WHERE id=NEW.model_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER ai_prompt_registry_model_id_update_tenant BEFORE UPDATE ON ai_prompt_registry WHEN NEW.model_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ai_model_registry WHERE id=NEW.model_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER ai_prompt_registry_tenant_immutable BEFORE UPDATE OF organization_id ON ai_prompt_registry WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER audit_events_update_blocked BEFORE UPDATE ON audit_events BEGIN SELECT RAISE(ABORT, 'APPEND_ONLY'); END;
--> statement-breakpoint
CREATE TRIGGER audit_events_delete_blocked BEFORE DELETE ON audit_events BEGIN SELECT RAISE(ABORT, 'APPEND_ONLY'); END;
--> statement-breakpoint
CREATE TRIGGER audit_events_tenant_immutable BEFORE UPDATE OF organization_id ON audit_events WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER care_relationships_patient_id_insert_tenant BEFORE INSERT ON care_relationships WHEN NEW.patient_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM patients WHERE id=NEW.patient_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER care_relationships_patient_id_update_tenant BEFORE UPDATE ON care_relationships WHEN NEW.patient_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM patients WHERE id=NEW.patient_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER care_relationships_provider_id_insert_tenant BEFORE INSERT ON care_relationships WHEN NEW.provider_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM providers WHERE id=NEW.provider_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER care_relationships_provider_id_update_tenant BEFORE UPDATE ON care_relationships WHEN NEW.provider_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM providers WHERE id=NEW.provider_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER care_relationships_clinic_id_insert_tenant BEFORE INSERT ON care_relationships WHEN NEW.clinic_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clinics WHERE id=NEW.clinic_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER care_relationships_clinic_id_update_tenant BEFORE UPDATE ON care_relationships WHEN NEW.clinic_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clinics WHERE id=NEW.clinic_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER care_relationships_tenant_immutable BEFORE UPDATE OF organization_id ON care_relationships WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER clinical_content_registry_tenant_immutable BEFORE UPDATE OF organization_id ON clinical_content_registry WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER clinical_pathways_content_id_insert_tenant BEFORE INSERT ON clinical_pathways WHEN NEW.content_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clinical_content_registry WHERE id=NEW.content_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER clinical_pathways_content_id_update_tenant BEFORE UPDATE ON clinical_pathways WHEN NEW.content_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clinical_content_registry WHERE id=NEW.content_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER clinical_pathways_tenant_immutable BEFORE UPDATE OF organization_id ON clinical_pathways WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER clinics_tenant_immutable BEFORE UPDATE OF organization_id ON clinics WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER connector_registry_tenant_immutable BEFORE UPDATE OF organization_id ON connector_registry WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER consent_records_update_blocked BEFORE UPDATE ON consent_records BEGIN SELECT RAISE(ABORT, 'APPEND_ONLY'); END;
--> statement-breakpoint
CREATE TRIGGER consent_records_delete_blocked BEFORE DELETE ON consent_records BEGIN SELECT RAISE(ABORT, 'APPEND_ONLY'); END;
--> statement-breakpoint
CREATE TRIGGER consent_records_patient_id_insert_tenant BEFORE INSERT ON consent_records WHEN NEW.patient_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM patients WHERE id=NEW.patient_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER consent_records_patient_id_update_tenant BEFORE UPDATE ON consent_records WHEN NEW.patient_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM patients WHERE id=NEW.patient_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER consent_records_tenant_immutable BEFORE UPDATE OF organization_id ON consent_records WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER governance_evidence_tenant_immutable BEFORE UPDATE OF organization_id ON governance_evidence WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER incidents_tenant_immutable BEFORE UPDATE OF organization_id ON incidents WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER memberships_clinic_id_insert_tenant BEFORE INSERT ON memberships WHEN NEW.clinic_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clinics WHERE id=NEW.clinic_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER memberships_clinic_id_update_tenant BEFORE UPDATE ON memberships WHEN NEW.clinic_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clinics WHERE id=NEW.clinic_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER memberships_tenant_immutable BEFORE UPDATE OF organization_id ON memberships WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER patient_representatives_patient_id_insert_tenant BEFORE INSERT ON patient_representatives WHEN NEW.patient_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM patients WHERE id=NEW.patient_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER patient_representatives_patient_id_update_tenant BEFORE UPDATE ON patient_representatives WHEN NEW.patient_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM patients WHERE id=NEW.patient_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER patient_representatives_tenant_immutable BEFORE UPDATE OF organization_id ON patient_representatives WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER patients_clinic_id_insert_tenant BEFORE INSERT ON patients WHEN NEW.clinic_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clinics WHERE id=NEW.clinic_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER patients_clinic_id_update_tenant BEFORE UPDATE ON patients WHEN NEW.clinic_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clinics WHERE id=NEW.clinic_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER patients_tenant_immutable BEFORE UPDATE OF organization_id ON patients WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER policy_registry_tenant_immutable BEFORE UPDATE OF organization_id ON policy_registry WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER privacy_requests_patient_id_insert_tenant BEFORE INSERT ON privacy_requests WHEN NEW.patient_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM patients WHERE id=NEW.patient_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER privacy_requests_patient_id_update_tenant BEFORE UPDATE ON privacy_requests WHEN NEW.patient_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM patients WHERE id=NEW.patient_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER privacy_requests_tenant_immutable BEFORE UPDATE OF organization_id ON privacy_requests WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER processing_authorities_patient_id_insert_tenant BEFORE INSERT ON processing_authorities WHEN NEW.patient_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM patients WHERE id=NEW.patient_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER processing_authorities_patient_id_update_tenant BEFORE UPDATE ON processing_authorities WHEN NEW.patient_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM patients WHERE id=NEW.patient_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER processing_authorities_tenant_immutable BEFORE UPDATE OF organization_id ON processing_authorities WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER provider_credentials_provider_id_insert_tenant BEFORE INSERT ON provider_credentials WHEN NEW.provider_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM providers WHERE id=NEW.provider_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER provider_credentials_provider_id_update_tenant BEFORE UPDATE ON provider_credentials WHEN NEW.provider_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM providers WHERE id=NEW.provider_id AND organization_id=NEW.organization_id) BEGIN SELECT RAISE(ABORT, 'TENANT_MISMATCH'); END;
--> statement-breakpoint
CREATE TRIGGER provider_credentials_tenant_immutable BEFORE UPDATE OF organization_id ON provider_credentials WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER providers_tenant_immutable BEFORE UPDATE OF organization_id ON providers WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER retention_policies_tenant_immutable BEFORE UPDATE OF organization_id ON retention_policies WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER risk_register_tenant_immutable BEFORE UPDATE OF organization_id ON risk_register WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER security_events_tenant_immutable BEFORE UPDATE OF organization_id ON security_events WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER sessions_tenant_immutable BEFORE UPDATE OF organization_id ON sessions WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER vendor_registry_tenant_immutable BEFORE UPDATE OF organization_id ON vendor_registry WHEN OLD.organization_id <> NEW.organization_id BEGIN SELECT RAISE(ABORT, 'TENANT_IMMUTABLE'); END;
--> statement-breakpoint
CREATE TRIGGER credential_verification_evidence BEFORE UPDATE ON provider_credentials WHEN NEW.status='Verified' AND (NEW.evidence_id IS NULL OR NEW.verification_source IS NULL OR NEW.verified_at IS NULL OR NEW.expires_at IS NULL OR NEW.expires_at<=NEW.verified_at) BEGIN SELECT RAISE(ABORT,'VERIFICATION_EVIDENCE_REQUIRED'); END;
--> statement-breakpoint
CREATE TRIGGER credential_insert_evidence BEFORE INSERT ON provider_credentials WHEN NEW.status='Verified' AND (NEW.evidence_id IS NULL OR NEW.verification_source IS NULL OR NEW.verified_at IS NULL OR NEW.expires_at IS NULL OR NEW.expires_at<=NEW.verified_at) BEGIN SELECT RAISE(ABORT,'VERIFICATION_EVIDENCE_REQUIRED'); END;
