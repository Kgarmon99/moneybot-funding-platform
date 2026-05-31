export interface FundingOpportunity {
  id: number;
  source_name: string;
  amount: number;
  deadline: string;
  stage: FundingStage;
  last_action: string;
  next_action: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type FundingStage =
  | 'Lead'
  | 'Qualified'
  | 'Applied'
  | 'Interview'
  | 'Diligence'
  | 'Term Sheet'
  | 'Closed';

export const FUNDING_STAGES: FundingStage[] = [
  'Lead', 'Qualified', 'Applied', 'Interview', 'Diligence', 'Term Sheet', 'Closed'
];

export interface GrantAccelerator {
  id: number;
  name: string;
  organization: string;
  check_size_min: number;
  check_size_max: number;
  stage: string;
  sector: string;
  location: string;
  deadline: string;
  description: string;
  apply_url: string;
  fitScore?: number;
  status?: 'Not Applied' | 'Applied' | 'Interview' | 'Accepted' | 'Rejected';
}

export interface Contact {
  id: number;
  name: string;
  company: string;
  role: string;
  relationship_strength: number;
  email?: string;
  notes?: string;
}

export interface Connection {
  id: number;
  from_contact_id: number;
  to_contact_id: number;
  from_name?: string;
  to_name?: string;
  intro_path?: string;
  status?: 'Pending' | 'Requested' | 'Intro Made' | 'Follow-up' | 'Closed';
  notes?: string;
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface NetworkNode {
  id: number;
  name: string;
  company: string;
  role: string;
  relationship_strength: number;
}

export interface NetworkEdge {
  from: number;
  to: number;
  status?: string;
}

export interface DataRoomDocument {
  id: number;
  name: string;
  folder: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  shareable_link?: string;
  password?: string;
  views?: DocumentView[];
}

export interface DocumentView {
  id: number;
  document_id: number;
  viewer_email?: string;
  viewed_at: string;
  ip_address?: string;
}

export interface StartupProfile {
  id: number;
  name: string;
  stage: string;
  sector: string;
  location: string;
  founded_year: number;
  team_size: number;
  revenue?: number;
  description: string;
}
