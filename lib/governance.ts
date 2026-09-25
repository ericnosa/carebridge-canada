export const PHI_PRODUCTION_ENABLED = false as const;
export const readiness = [
 ['Privacy','PIA, legal role, PHI flows, policies and agreements'],
 ['Security','Threat assessment, IAM, MFA, isolation, encryption and independent testing'],
 ['Clinical','Clinical governance, emergency logic, credentials and content review'],
 ['Operations','Monitoring, incident response, backup, restoration and continuity'],
 ['Integrations','Vendor agreements, privacy/security review and technical validation'],
 ['Legal','Patient, provider and clinic terms; privacy and regulatory review'],
 ['Accessibility','Keyboard, screen reader, contrast and WCAG 2.2 AA review']
] as const;
export const officialSources = [
 ['Saskatchewan IPC — PIA guidance','https://oipc.sk.ca/privacy-impact-assessments/'],
 ['Saskatchewan IPC — audit and monitoring','https://oipc.sk.ca/resources/resource-directory/audit-and-monitoring-guidelines-for-trustees/'],
 ['SHA — HealthLine 811','https://www.saskhealthauthority.ca/your-health/conditions-illnesses-services-wellness/healthline-8-1-1'],
 ['OWASP — authorization guidance','https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html']
] as const;
export const registries:Record<string,{title:string;tables:readonly string[]}>={
 'privacy-console':{title:'Privacy console',tables:['privacy_requests','consent_records','processing_authorities','incidents','retention_policies','vendor_registry','audit_events']},
 'security-console':{title:'Security console',tables:['security_events','sessions','incidents','risk_register','audit_events']},
 'clinical-governance':{title:'Clinical governance',tables:['clinical_content_registry','clinical_pathways','provider_credentials']},
 'connector-governance':{title:'Connector governance',tables:['connector_registry','vendor_registry']},
 'ai-governance':{title:'AI governance',tables:['ai_model_registry','ai_prompt_registry']},
 'governance/readiness':{title:'Governance readiness',tables:['governance_evidence','policy_registry','risk_register']},
 'activity-logs':{title:'Activity logs',tables:['audit_events','security_events','sessions','incidents']}
};
