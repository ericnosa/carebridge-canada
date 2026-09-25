import sqlite3, pathlib, unittest
class Integrity(unittest.TestCase):
 def setUp(self):
  self.db=sqlite3.connect(':memory:');self.db.execute('PRAGMA foreign_keys=ON')
  for f in sorted(pathlib.Path('drizzle').glob('*.sql')): self.db.executescript(f.read_text())
  for org in ['A','B']: self.db.execute('INSERT INTO organizations(id,created_at,name) VALUES (?,0,?)',(org,org))
  for clinic,org in [('clinic-A','A'),('clinic-B','B')]: self.db.execute('INSERT INTO clinics(id,created_at,organization_id,name) VALUES (?,0,?,?)',(clinic,org,clinic))
 def test_cross_tenant_patient_rejected(self):
  with self.assertRaisesRegex(sqlite3.IntegrityError,'TENANT_MISMATCH'):self.db.execute("INSERT INTO patients(id,created_at,organization_id,clinic_id,synthetic_label) VALUES ('p',0,'A','clinic-B','SYNTHETIC: Patient')")
 def test_real_patient_label_rejected(self):
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("INSERT INTO patients(id,created_at,organization_id,clinic_id,synthetic_label) VALUES ('p',0,'A','clinic-A','Real patient')")
 def test_valid_synthetic_patient(self):
  self.db.execute("INSERT INTO patients(id,created_at,organization_id,clinic_id,synthetic_label) VALUES ('p',0,'A','clinic-A','SYNTHETIC: Patient')")
  self.assertEqual(self.db.execute("SELECT count(*) FROM patients WHERE organization_id='B'").fetchone()[0],0)
 def test_audit_is_append_only(self):
  self.db.execute("INSERT INTO audit_events(id,created_at,organization_id,actor,role,resource,action,purpose,authorization_result,result,correlation_id) VALUES ('evt',0,'A','fixture','Auditor','fixture','VIEW','test','allowed','success','corr')")
  for stmt in ["UPDATE audit_events SET result='fake'",'DELETE FROM audit_events']:
   with self.assertRaisesRegex(sqlite3.IntegrityError,'APPEND_ONLY'):self.db.execute(stmt)
  self.assertEqual(self.db.execute('SELECT count(*) FROM audit_events').fetchone()[0],1)
 def test_no_fake_completion(self):
  with self.assertRaises(sqlite3.IntegrityError):self.db.execute("INSERT INTO governance_evidence(id,created_at,organization_id,category,title,status) VALUES ('e',0,'A','Privacy','PIA','Approved')")
 def test_unverified_provider_cannot_be_marked_verified(self):
  self.db.execute("INSERT INTO users(id,created_at,subject) VALUES ('u',0,'fixture')")
  self.db.execute("INSERT INTO providers VALUES ('p',0,'A','u','physician')")
  with self.assertRaisesRegex(sqlite3.IntegrityError,'VERIFICATION_EVIDENCE_REQUIRED'):self.db.execute("INSERT INTO provider_credentials(id,created_at,organization_id,provider_id,regulator,jurisdiction,status) VALUES ('c',0,'A','p','fixture','SK','Verified')")
if __name__=='__main__':unittest.main()
