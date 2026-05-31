export interface FundingOpportunity {
  id: number;
  sourceName: string;
  amount: number;
  deadline: string;
  stage: FundingStage;
  lastAction: string;
  nextAction: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type FundingStage =
  | 'Lead'
  | 'Qualified'
  | 'Applied'
  | 'Interview'
  | 'Diligence'
  | 'Term Sheet'
  | 'Closed';

export interface GrantAccelerator {
  id: number;
  name: string;
  organization: string;
  checkSizeMin: number;
  checkSizeMax: number;
  stage: string;
  sector: string;
  location: string;
  deadline: string;
  description: string;
  applyUrl: string;
  fitScore?: number;
  status?: 'Not Applied' | 'Applied' | 'Interview' | 'Accepted' | 'Rejected';
}

export interface Contact {
  id: number;
  name: string;
  company: string;
  role: string;
  relationshipStrength: number;
  email?: string;
  notes?: string;
}

export interface Connection {
  id: number;
  fromContactId: number;
  toContactId: number;
  introPath?: string;
  status?: 'Pending' | 'Requested' | 'Intro Made' | 'Follow-up' | 'Closed';
  notes?: string;
}

export interface NetworkNode {
  id: number;
  name: string;
  company: string;
  role: string;
  relationshipStrength: number;
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
  filePath: string;
  fileSize: number;
  uploadedAt: string;
  shareableLink?: string;
  password?: string;
  views?: DocumentView[];
}

export interface DocumentView {
  id: number;
  documentId: number;
  viewerEmail?: string;
  viewedAt: string;
  ipAddress?: string;
}

export interface StartupProfile {
  id: number;
  name: string;
  stage: string;
  sector: string;
  location: string;
  foundedYear: number;
  teamSize: number;
  revenue?: number;
  description: string;
}
