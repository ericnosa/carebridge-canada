'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Download,
  Clock,
  User,
  FileText,
  Activity,
  Lock,
  ChevronRight,
  ChevronDown,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  KeyRound,
  Eye,
  Calendar,
  CalendarDays,
  X,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';

export type AuditEvent = {
  id: string;
  created_at: number;
  actor: string;
  role: string;
  patient_id: string | null;
  resource: string;
  action: string;
  purpose: string;
  authorization_result: string;
  result: string;
  correlation_id: string;
  session_context: string | null;
};

export type SecurityEvent = {
  id: string;
  created_at: number;
  category: string;
  severity: string;
  correlation_id: string;
  status: string;
};

export type UnifiedEvent = {
  id: string;
  timestamp: number;
  type: 'user_action' | 'security_update' | 'system_event';
  action: string;
  actor: string;
  role: string;
  resource: string;
  patientId: string | null;
  purpose: string;
  status: 'allowed' | 'denied' | 'blocked' | 'verified' | 'review_required';
  severity?: string;
  correlationId: string;
  sessionContext?: string | null;
  details?: string;
};

type DatePreset = 'all' | '24h' | '7d' | '30d' | 'custom';

export function ActivityLogsComponent() {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'user_action' | 'security_update' | 'system_event'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'allowed' | 'denied' | 'review_required'>('all');
  const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>(null);
  const [isPending, startTransition] = useTransition();

  // Date range picker state
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/governance/activity-logs', {
        headers: { 'Cache-Control': 'no-store' },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('ACCESS_DENIED');
        }
        throw new Error('UNAVAILABLE');
      }
      const data = await res.json();

      const parsedEvents: UnifiedEvent[] = [];

      // Map audit events
      if (Array.isArray(data.audits)) {
        for (const item of data.audits as AuditEvent[]) {
          let eventType: 'user_action' | 'security_update' | 'system_event' = 'user_action';
          if (item.actor === 'SYSTEM' || item.action.includes('SYSTEM') || item.action.includes('INTEGRITY')) {
            eventType = 'system_event';
          } else if (
            item.action.includes('MFA') ||
            item.action.includes('SECURITY') ||
            item.action.includes('POLICY') ||
            item.action.includes('LOGIN')
          ) {
            eventType = 'security_update';
          }

          let mappedStatus: 'allowed' | 'denied' | 'review_required' = 'allowed';
          if (item.authorization_result === 'denied' || item.result === 'denied') {
            mappedStatus = 'denied';
          }

          parsedEvents.push({
            id: item.id,
            timestamp: item.created_at,
            type: eventType,
            action: item.action,
            actor: item.actor,
            role: item.role,
            resource: item.resource,
            patientId: item.patient_id,
            purpose: item.purpose,
            status: mappedStatus,
            correlationId: item.correlation_id,
            sessionContext: item.session_context,
            details: `Resource: ${item.resource}. Purpose: ${item.purpose}. Authorization: ${item.authorization_result}.`,
          });
        }
      }

      // Map security events
      if (Array.isArray(data.security)) {
        for (const sec of data.security as SecurityEvent[]) {
          parsedEvents.push({
            id: sec.id,
            timestamp: sec.created_at,
            type: 'security_update',
            action: sec.category,
            actor: 'SECURITY_SUBSYSTEM',
            role: 'Security Engine',
            resource: 'security.monitoring',
            patientId: null,
            purpose: 'Automated platform safeguard and threat monitoring',
            status: sec.status.toLowerCase().includes('block') ? 'denied' : 'allowed',
            severity: sec.severity,
            correlationId: sec.correlation_id,
            details: `Security event category: ${sec.category}. Severity: ${sec.severity}. Current status: ${sec.status}.`,
          });
        }
      }

      // Sort by timestamp descending
      parsedEvents.sort((a, b) => b.timestamp - a.timestamp);
      setEvents(parsedEvents);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'ACCESS_DENIED') {
        setError('ACCESS_DENIED');
      } else {
        setError('UNAVAILABLE');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  function handleRefresh() {
    startTransition(() => {
      fetchLogs();
    });
  }

  function handlePresetChange(preset: DatePreset) {
    setDatePreset(preset);
    if (preset === 'custom') {
      setIsCustomDateOpen(true);
      if (!customStartDate) {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        setCustomStartDate(d.toISOString().split('T')[0]);
      }
      if (!customEndDate) {
        setCustomEndDate(new Date().toISOString().split('T')[0]);
      }
    } else {
      setIsCustomDateOpen(false);
    }
  }

  function clearDateFilter() {
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setIsCustomDateOpen(false);
  }

  // Filter events by tab, status, query, and date range
  const filteredEvents = events.filter(e => {
    // Tab filter
    if (activeTab !== 'all' && e.type !== activeTab) return false;

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'allowed' && e.status !== 'allowed') return false;
      if (statusFilter === 'denied' && e.status !== 'denied') return false;
      if (statusFilter === 'review_required' && e.status !== 'review_required') return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        e.action.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.resource.toLowerCase().includes(q) ||
        e.correlationId.toLowerCase().includes(q) ||
        (e.patientId && e.patientId.toLowerCase().includes(q)) ||
        e.purpose.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Date range filter
    const now = Date.now();
    if (datePreset === '24h') {
      if (e.timestamp < now - 86400000) return false;
    } else if (datePreset === '7d') {
      if (e.timestamp < now - 86400000 * 7) return false;
    } else if (datePreset === '30d') {
      if (e.timestamp < now - 86400000 * 30) return false;
    } else if (datePreset === 'custom') {
      if (customStartDate) {
        const startMs = new Date(customStartDate + 'T00:00:00').getTime();
        if (!isNaN(startMs) && e.timestamp < startMs) return false;
      }
      if (customEndDate) {
        const endMs = new Date(customEndDate + 'T23:59:59.999').getTime();
        if (!isNaN(endMs) && e.timestamp > endMs) return false;
      }
    }

    return true;
  });

  const totalCount = filteredEvents.length;
  const userActionCount = filteredEvents.filter(e => e.type === 'user_action').length;
  const securityCount = filteredEvents.filter(e => e.type === 'security_update').length;
  const systemCount = filteredEvents.filter(e => e.type === 'system_event').length;
  const deniedCount = filteredEvents.filter(e => e.status === 'denied').length;

  function formatTime(ms: number) {
    return (
      new Date(ms).toLocaleString('en-CA', {
        timeZone: 'America/Regina',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }) + ' CST'
    );
  }

  function downloadAuditExport() {
    const exportData = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        jurisdiction: 'Saskatchewan',
        complianceFramework: 'Health Information Protection Act (HIPA) & PIPEDA Audit Model',
        environment: 'CareBridge Canada Synthetic Demonstration Environment',
        filterCriteria: {
          timeframePreset: datePreset,
          customStartDate: customStartDate || 'None',
          customEndDate: customEndDate || 'None',
          categoryFilter: activeTab,
          outcomeFilter: statusFilter,
          totalMatchingRecords: filteredEvents.length,
        },
        phiNotice: 'No genuine personal health information or live patient records are contained in this export.',
      },
      events: filteredEvents.map(e => ({
        eventId: e.id,
        recordedTimeCST: new Date(e.timestamp).toLocaleString('en-CA', { timeZone: 'America/Regina' }),
        category: e.type,
        action: e.action,
        actor: e.actor,
        role: e.role,
        targetResource: e.resource,
        patientIdentifier: e.patientId || 'Not Applicable',
        accessPurpose: e.purpose,
        authorizationResult: e.status,
        correlationUuid: e.correlationId,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carebridge-governance-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error === 'ACCESS_DENIED') {
    return (
      <section className="panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Lock size={26} color="#967947" />
          <h2>Privileged access required</h2>
        </div>
        <p>
          Viewing system audit trails and security activity logs requires an active staff membership with an authorized
          governance role and a recently verified multi-factor authentication session.
        </p>
        <p className="muted" style={{ margin: '14px 0 20px' }}>
          In accordance with Canadian privacy standards and Saskatchewan Health Information Protection Act guidelines,
          audit logs are immutable and access is strictly restricted by default.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/mfa" className="button primary">
            Verify session with authenticator
          </Link>
          <Link href="/governance/readiness" className="button secondary">
            View launch readiness
          </Link>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h2>Activity logging service unavailable</h2>
        <p>The audit service could not be contacted. No protected activity information has been released.</p>
        <button className="button primary" onClick={handleRefresh} style={{ marginTop: '16px' }}>
          Retry connection
        </button>
      </section>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Metric Cards Summary */}
      <div className="stats-grid" style={{ marginBottom: 0 }}>
        <div className="stat-card">
          <Activity size={22} />
          <strong>{totalCount}</strong>
          <span>Recorded events</span>
          <small>{datePreset === 'all' ? 'All historical records' : 'Within selected timeframe'}</small>
        </div>
        <div className="stat-card">
          <User size={22} />
          <strong>{userActionCount}</strong>
          <span>User actions</span>
          <small>Role verified actions</small>
        </div>
        <div className="stat-card">
          <ShieldAlert size={22} />
          <strong>{securityCount}</strong>
          <span>Security updates</span>
          <small>{deniedCount} unauthorized blocked</small>
        </div>
        <div className="stat-card">
          <Database size={22} />
          <strong>{systemCount}</strong>
          <span>System tasks</span>
          <small>Automated integrity checks</small>
        </div>
      </div>

      {/* Main Log Viewer Panel */}
      <section className="panel">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>System Activity and Audit Register</h2>
            <p className="muted" style={{ fontSize: '14px', marginTop: '4px' }}>
              Chronological log of verified user actions, system operations, and security events across the organization.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="button secondary"
              onClick={handleRefresh}
              disabled={loading || isPending}
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              <RefreshCw size={14} className={loading || isPending ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              className="button secondary"
              onClick={downloadAuditExport}
              disabled={events.length === 0}
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              <Download size={14} />
              Export audit log
            </button>
          </div>
        </div>

        {/* Date Range Picker Toolbar */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #d9e4e7',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={18} color="#176f68" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#27434f' }}>Filter by timeframe:</span>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { id: 'all', label: 'All time' },
                { id: '24h', label: 'Past 24 hours' },
                { id: '7d', label: 'Past 7 days' },
                { id: '30d', label: 'Past 30 days' },
                { id: 'custom', label: 'Custom range' },
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id as DatePreset)}
                  style={{
                    fontSize: '12px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: datePreset === preset.id ? '1px solid #176f68' : '1px solid #d4dfe2',
                    background: datePreset === preset.id ? '#eaf4f2' : '#ffffff',
                    color: datePreset === preset.id ? '#125c56' : '#49616e',
                    fontWeight: datePreset === preset.id ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {preset.label}
                </button>
              ))}

              {datePreset !== 'all' && (
                <button
                  onClick={clearDateFilter}
                  style={{
                    fontSize: '12px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e2c0c0',
                    background: '#fdf3f3',
                    color: '#9e3232',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Reset date filter to all time"
                >
                  <X size={13} />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Expandable Custom Date Range Selection Box */}
          {isCustomDateOpen && (
            <div
              style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px dashed #dbe5e8',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#566e79', fontWeight: 500 }}>Start date:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  style={{
                    fontSize: '13px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cfdcde',
                    background: '#ffffff',
                    color: '#26414c',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#566e79', fontWeight: 500 }}>End date:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  style={{
                    fontSize: '13px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cfdcde',
                    background: '#ffffff',
                    color: '#26414c',
                  }}
                />
              </div>

              <span style={{ fontSize: '12px', color: '#6a8490', fontStyle: 'italic' }}>
                Times evaluated in America/Regina (CST).
              </span>
            </div>
          )}
        </div>

        {/* Filter and Search Controls */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
            background: '#f8fafb',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid #e2e9ec',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#7a8c95',
              }}
            />
            <input
              type="text"
              placeholder="Search by action, actor, resource, or UUID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #d4dfe2',
                background: '#fff',
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'user_action', label: 'User actions' },
              { id: 'security_update', label: 'Security' },
              { id: 'system_event', label: 'System' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: activeTab === tab.id ? '1px solid #176f68' : '1px solid #d5e0e3',
                  background: activeTab === tab.id ? '#176f68' : '#fff',
                  color: activeTab === tab.id ? '#fff' : '#49616e',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Authorization Result Filter */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#687d87', fontWeight: 500 }}>Outcome:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              style={{
                fontSize: '13px',
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid #d4dfe2',
                background: '#fff',
                color: '#345260',
              }}
            >
              <option value="all">All outcomes</option>
              <option value="allowed">Allowed / Successful</option>
              <option value="denied">Denied / Blocked</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(datePreset !== 'all' || activeTab !== 'all' || statusFilter !== 'all' || searchQuery.trim()) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#556f7b',
            }}
          >
            <span style={{ fontWeight: 600, color: '#314e5b' }}>Active filters:</span>
            {datePreset !== 'all' && (
              <span
                style={{
                  background: '#e9f3f1',
                  border: '1px solid #bfe0d8',
                  color: '#166e64',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Timeframe:{' '}
                {datePreset === '24h'
                  ? 'Past 24 hours'
                  : datePreset === '7d'
                  ? 'Past 7 days'
                  : datePreset === '30d'
                  ? 'Past 30 days'
                  : `${customStartDate || 'Start'} to ${customEndDate || 'End'}`}
                <button
                  onClick={clearDateFilter}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166e64', padding: 0 }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {activeTab !== 'all' && (
              <span
                style={{
                  background: '#eef4f8',
                  border: '1px solid #d1e3ee',
                  color: '#2a6382',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Category: {activeTab.replaceAll('_', ' ')}
                <button
                  onClick={() => setActiveTab('all')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a6382', padding: 0 }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span
                style={{
                  background: '#fdf2f2',
                  border: '1px solid #f5c6c6',
                  color: '#9a2e2e',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Outcome: {statusFilter}
                <button
                  onClick={() => setStatusFilter('all')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a2e2e', padding: 0 }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {searchQuery.trim() && (
              <span
                style={{
                  background: '#f5f7f8',
                  border: '1px solid #d9e2e5',
                  color: '#425b68',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Query: &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#425b68', padding: 0 }}
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Logs Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b828c' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p>Loading verified organization audit logs...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '45px 20px',
              background: '#fafcfc',
              borderRadius: '10px',
              border: '1px dashed #dbe5e8',
            }}
          >
            <FileText size={32} color="#859fa8" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '16px', color: '#314e5c' }}>No matching activity records</h3>
            <p className="muted" style={{ fontSize: '13px', marginTop: '4px' }}>
              Adjust the date range or filters to view events from other time periods.
            </p>
            {datePreset !== 'all' && (
              <button className="button secondary" onClick={clearDateFilter} style={{ marginTop: '14px', fontSize: '12px' }}>
                Reset timeframe to all time
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: '170px' }}>Timestamp</TableHead>
                  <TableHead>Event Category</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor & Role</TableHead>
                  <TableHead>Target Resource</TableHead>
                  <TableHead style={{ width: '120px' }}>Authorization</TableHead>
                  <TableHead style={{ width: '80px', textAlign: 'right' }}>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map(event => (
                  <TableRow
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    style={{ cursor: 'pointer' }}
                    className="hover:bg-[#f4f8f9]"
                  >
                    <TableCell style={{ fontSize: '12px', whiteSpace: 'nowrap', color: '#566f7a' }}>
                      {formatTime(event.timestamp)}
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          letterSpacing: '0.5px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background:
                            event.type === 'security_update'
                              ? '#fdf2f2'
                              : event.type === 'system_event'
                              ? '#eef4f8'
                              : '#eaf4f0',
                          color:
                            event.type === 'security_update'
                              ? '#9a2e2e'
                              : event.type === 'system_event'
                              ? '#2a6382'
                              : '#1b6e5b',
                          border: `1px solid ${
                            event.type === 'security_update'
                              ? '#f5c6c6'
                              : event.type === 'system_event'
                              ? '#d1e3ee'
                              : '#cce6dc'
                          }`,
                        }}
                      >
                        {event.type.replaceAll('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <strong style={{ fontSize: '13px', color: '#1c3e4b' }}>{event.action}</strong>
                      {event.patientId && (
                        <small style={{ display: 'block', color: '#68828f', fontSize: '11px', marginTop: '2px' }}>
                          Patient: {event.patientId}
                        </small>
                      )}
                    </TableCell>
                    <TableCell style={{ fontSize: '13px' }}>
                      <span style={{ color: '#2a4957', fontWeight: 500 }}>{event.actor}</span>
                      <small style={{ display: 'block', color: '#748b96', fontSize: '11px' }}>{event.role}</small>
                    </TableCell>
                    <TableCell style={{ fontSize: '12px', color: '#4a6572' }}>
                      <code>{event.resource}</code>
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: event.status === 'allowed' ? '#20785f' : '#ab3434',
                        }}
                      >
                        {event.status === 'allowed' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {event.status === 'allowed' ? 'Allowed' : 'Denied / Blocked'}
                      </span>
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <button
                        className="text-link"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                        style={{ fontSize: '12px' }}
                        aria-label={`View details for ${event.action}`}
                      >
                        <Eye size={15} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #e5ecee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#748b94' }}>
            Showing {filteredEvents.length} of {events.length} logged events. All records maintained in append only
            storage.
          </span>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#397864' }}>
              <ShieldCheck size={15} /> Saskatchewan HIPA Compliant Design
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#68828f' }}>
              <Lock size={14} /> Server Verified Token
            </span>
          </div>
        </div>
      </section>

      {/* Detailed Event Inspection Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={open => !open && setSelectedEvent(null)}>
        <DialogContent style={{ maxWidth: '650px' }}>
          <DialogHeader>
            <DialogTitle style={{ fontSize: '19px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} color="#176f68" />
              Event Audit Record
            </DialogTitle>
            <DialogDescription>
              Detailed security and operational payload captured at the server boundary.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div style={{ display: 'grid', gap: '14px', margin: '10px 0' }}>
              <div className="sample-intake" style={{ margin: 0 }}>
                <div>
                  <span>Event Identifier</span>
                  <strong style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedEvent.id}</strong>
                </div>
                <div>
                  <span>Correlation UUID</span>
                  <strong style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedEvent.correlationId}</strong>
                </div>
                <div>
                  <span>Timestamp (Regina CST)</span>
                  <strong>{formatTime(selectedEvent.timestamp)}</strong>
                </div>
                <div>
                  <span>Event Classification</span>
                  <strong style={{ textTransform: 'capitalize' }}>{selectedEvent.type.replaceAll('_', ' ')}</strong>
                </div>
                <div>
                  <span>Action Invoked</span>
                  <strong>{selectedEvent.action}</strong>
                </div>
                <div>
                  <span>Actor / Subject</span>
                  <strong>{selectedEvent.actor}</strong>
                </div>
                <div>
                  <span>Verified Role</span>
                  <strong>{selectedEvent.role}</strong>
                </div>
                <div>
                  <span>Target Resource</span>
                  <code>{selectedEvent.resource}</code>
                </div>
                <div>
                  <span>Patient Identifier</span>
                  <strong>{selectedEvent.patientId || 'None (Organization Scope)'}</strong>
                </div>
                <div>
                  <span>Stated Purpose of Access</span>
                  <strong>{selectedEvent.purpose}</strong>
                </div>
                <div>
                  <span>Authorization Outcome</span>
                  <strong style={{ color: selectedEvent.status === 'allowed' ? '#20785f' : '#ab3434' }}>
                    {selectedEvent.status === 'allowed' ? 'Authorized and Allowed' : 'Denied / Access Blocked'}
                  </strong>
                </div>
                {selectedEvent.sessionContext && (
                  <div>
                    <span>Session Context</span>
                    <strong style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedEvent.sessionContext}</strong>
                  </div>
                )}
              </div>

              <div className="info" style={{ margin: '8px 0 0' }}>
                <span>
                  Audit records are permanent and write once. Modification or deletion of audit logs is programmatically
                  blocked by server side policy and relational integrity constraints.
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
