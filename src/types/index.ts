export type Role = 'Founder' | 'Ops Manager' | 'Team Leader' | 'Agent' | 'Auditor';

export interface User {
  agentId: string;
  userCode: string;
  name: string;
  role: Role;
  email: string;
  forcePwdChange: boolean;
  teamLeaderId?: string | null;
  clientIdsAssigned: string[];
}

export interface Client {
  client_id: string;
  client_name: string;
  contract_start: string;
  contract_end: string;
  commission_structure: any;
  data_retention_days: number;
  active_flag: boolean;
}

export interface Allocation {
  allocation_id: string;
  batch_id: string;
  client_id: string;
  client_name: string;
  loan_id: string;
  borrower_name: string;
  borrower_phone?: string;
  borrower_phone_masked?: string;
  borrower_city: string;
  dpd: number;
  dpd_bucket: '1-30' | '31-60' | '61-90' | '90+';
  pos_amount: number;
  emi_due_amount: number;
  total_due: number;
  assigned_agent_id?: string;
  agent_name?: string;
  assigned_at?: string;
  current_status: string;
  last_action_at?: string;
  queue_priority?: string;
}

export interface ActivityLogItem {
  activity_id: string;
  allocation_id: string;
  agent_id: string;
  agent_name?: string;
  timestamp: string;
  contact_mode: string;
  disposition_code: string;
  sub_disposition?: string;
  remarks: string;
  next_action_date?: string;
}

export interface PtpRecord {
  ptp_id: string;
  allocation_id: string;
  agent_id: string;
  created_at: string;
  promised_amount: number;
  promised_date: string;
  ptp_status: 'Active' | 'Kept' | 'Broken' | 'Partially Kept';
  broken_reason?: string;
}

export interface PaymentItem {
  payment_id: string;
  client_id: string;
  client_name: string;
  loan_id: string;
  payment_date: string;
  payment_amount: number;
  payment_mode: string;
  source_file_id: string;
  ingested_at: string;
}

export interface PaymentExceptionItem {
  exception_id: string;
  client_id: string;
  client_name: string;
  loan_id: string;
  payment_date: string;
  payment_amount: number;
  source_file_id: string;
  resolution_status: 'UNRESOLVED' | 'MANUALLY_MATCHED' | 'DISCARDED';
  resolver_name?: string;
  resolved_at?: string;
  notes?: string;
}

export interface AuditLogItem {
  log_id: string;
  user_id: string;
  actor_name?: string;
  actor_code?: string;
  actor_role?: string;
  action_type: string;
  entity: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  timestamp: string;
  ip_address: string;
}

export interface AgentMetrics {
  agentId: string;
  name: string;
  accountsAssigned: number;
  touchedToday: number;
  connectedToday: number;
  ptpTakenToday: number;
  ptpDueToday: number;
  collectionsCreditedThisMonth: number;
  ptpKeptPercentage: number;
  zeroActivityToday: boolean;
}

export interface TeamLeaderData {
  teamTotals: {
    accountsAssigned: number;
    touchedToday: number;
    connectedToday: number;
    ptpTakenToday: number;
    ptpDueToday: number;
    collectionsThisMonth: number;
    avgPtpKeptPercentage: number;
    zeroActivityAgentsCount: number;
  };
  agentMetrics: AgentMetrics[];
}

export interface FounderOpsData {
  overall: {
    totalAllocatedCount: number;
    totalAllocatedValue: number;
    totalTouchedPercentage: number;
    contactRate: number;
    ptpConversionRate: number;
    resolutionRateCount: number;
    resolutionRateValue: number;
    totalCollected: number;
  };
  byBucket: {
    bucket: string;
    allocatedCount: number;
    allocatedValue: number;
    resolvedCount: number;
    amountCollected: number;
    resolutionRateCount: number;
    resolutionRateValue: number;
  }[];
  byClient: {
    clientId: string;
    clientName: string;
    allocatedCount: number;
    totalDue: number;
    amountCollected: number;
    resolvedCount: number;
    resolutionRateValue: number;
  }[];
  dailyTrend: {
    payment_date: string;
    total_amount: number;
    txn_count: number;
  }[];
}
