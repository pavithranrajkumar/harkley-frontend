export interface ChatSegment {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  transcriptionId: string;
  speakerNumber: number;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface Transcription {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  meetingId: string;
  status: string;
  fullText: string;
  summary: string;
  confidence: number;
  language: string;
  wordCount: number;
  chatSegments: ChatSegment[];
}

export interface ActionItem {
  id: string;
  meetingId: string;
  speakerNumber: number;
  description: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'in_progress';
}

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
  status: string;
  userId: string;
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

// Legacy interface for backward compatibility with existing components
export interface LegacyMeeting {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  participants: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
}
