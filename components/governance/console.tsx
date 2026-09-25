import Link from 'next/link';
import { AccessError } from '@/lib/foundation';
import { foundation, identity } from '@/lib/server-access';
import { registries } from '@/lib/governance';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { ActivityLogsComponent } from './activity-logs';
import { Shield, FileText, Lock, Network, Cpu, CheckCircle, Activity } from 'lucide-react';

const governanceNav = [
  { key: 'privacy-console', title: 'Privacy console', href: '/privacy-console', icon: Shield },
  { key: 'security-console', title: 'Security console', href: '/security-console', icon: Lock },
  { key: 'activity-logs', title: 'Activity logs', href: '/activity-logs', icon: Activity },
  { key: 'clinical-governance', title: 'Clinical governance', href: '/clinical-governance', icon: FileText },
  { key: 'connector-governance', title: 'Connectors', href: '/connector-governance', icon: Network },
  { key: 'ai-governance', title: 'AI governance', href: '/ai-governance', icon: Cpu },
  { key: 'governance/readiness', title: 'Launch readiness', href: '/governance/readiness', icon: CheckCircle },
];

export async function GovernanceConsole({ section }: { section: string }) {
  const def = registries[section] || { title: 'Governance Console', tables: [] };
  let authorized = false;
  let unavailable = false;
  let counts: { name: string; count: number }[] = [];

  try {
    const result = await foundation().summary(await identity(), section);
    authorized = true;
    counts = Object.entries(result).map(([name, count]) => ({
      name: name.replaceAll('_', ' '),
      count,
    }));
  } catch (error) {
    unavailable = !(error instanceof AccessError);
    authorized = false;
    counts = [];
  }

  return (
    <main className="governance-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Link href="/" className="button secondary">
          ← CareBridge
        </Link>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/governance/readiness" className="button secondary" style={{ fontSize: '13px' }}>
            Release gates
          </Link>
          <Link href="/mfa" className="button secondary" style={{ fontSize: '13px' }}>
            MFA status
          </Link>
        </div>
      </div>

      <p className="demo-banner">DEMO ENVIRONMENT — DO NOT ENTER REAL PATIENT INFORMATION</p>

      {/* Governance Console Section Tabs */}
      <nav
        aria-label="Governance sections"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '6px',
          borderBottom: '1px solid #dfe7e9',
        }}
      >
        {governanceNav.map(item => {
          const isActive = section === item.key || (section === 'readiness' && item.key === 'governance/readiness');
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#146f68' : '#576f7b',
                background: isActive ? '#e8f3f1' : 'transparent',
                border: isActive ? '1px solid #bfe0d8' : '1px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="page-heading" style={{ marginBottom: '10px' }}>
        <div>
          <p className="eyebrow">GOVERNANCE • SASKATCHEWAN</p>
          <h1>{def.title}</h1>
          <p className="muted">Production personal health information remains disabled.</p>
        </div>
        <span className={`tag ${authorized ? 'mint' : 'amber'}`}>
          {authorized ? 'Authorized session' : 'Access restricted'}
        </span>
      </div>

      {!authorized ? (
        <section className="panel">
          <h2>{unavailable ? 'Service unavailable' : 'Privileged access required'}</h2>
          <p>
            {unavailable
              ? 'Access could not be verified. No protected information has been released.'
              : 'This console requires an active staff membership and a recent, server verified multi-factor authentication session. Selecting a demo workspace does not grant access.'}
          </p>
          <p className="muted" style={{ margin: '14px 0 20px' }}>
            Initial trusted staff provisioning: Human Review Required. Clinical publishing: Blocked. There is no
            self-service administrator activation.
          </p>
          <Link href="/mfa" className="button primary">
            Verify session / synthetic demo
          </Link>
        </section>
      ) : section === 'activity-logs' ? (
        <ActivityLogsComponent />
      ) : (
        <>
          <section className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>Organization registry</h2>
              <Link href="/activity-logs" className="button secondary" style={{ fontSize: '12px' }}>
                <Activity size={14} /> View detailed activity logs
              </Link>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Register</TableHead>
                  <TableHead>Recorded items</TableHead>
                  <TableHead>Availability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counts.map(c => (
                  <TableRow key={c.name}>
                    <TableCell style={{ fontWeight: 500 }}>{c.name}</TableCell>
                    <TableCell>{c.count}</TableCell>
                    <TableCell>Read only • Human Review Required</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="muted" style={{ marginTop: '16px' }}>
              Empty registries do not indicate completed reviews. Clinical publication and evidence approval: Not
              implemented.
            </p>
          </section>

          {/* Cross link to Activity Logs */}
          <section className="panel" style={{ background: '#f8fbfb', borderColor: '#d3e4df' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', color: '#1a4c44', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} />
                  Historical Audit and Event Tracking
                </h3>
                <p className="muted" style={{ fontSize: '13px', marginTop: '4px' }}>
                  Inspect every server authorized event, role change, consent update, and security validation in real time.
                </p>
              </div>
              <Link href="/activity-logs" className="button primary" style={{ fontSize: '13px' }}>
                Open activity logs
              </Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
