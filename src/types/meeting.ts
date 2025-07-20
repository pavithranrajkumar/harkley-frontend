import type { Transcription } from './transcription';
import type { ActionItem } from './actionItem';

export type MeetingStatus = 'queued' | 'transcribing' | 'transcribed' | 'analyzing' | 'processed' | 'failed';

export interface Meeting {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
  duration: string | null;
  file_size: number;
  file_path: string;
  summary: string | null;
  status: MeetingStatus;
  userId: string;
}

export interface MeetingDetails extends Meeting {
  transcriptions: Transcription[];
  actionItems: ActionItem[];
}

export interface MeetingsResponse {
  meetings: Meeting[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MeetingStats {
  totalMeetings: number;
  totalDuration: number;
  averageDuration: number;
  transcribedMeetings: number;
}
