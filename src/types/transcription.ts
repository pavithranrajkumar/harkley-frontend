export interface ChatSegment {
  id: string;
  transcriptionId: string;
  speakerNumber: number;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface Transcription {
  id: string;
  meetingId: string;
  status: string;
  fullText: string;
  summary: string;
  confidence: number;
  language: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  chatSegments: ChatSegment[];
}

export interface TranscriptionResponse {
  success: boolean;
  data: Transcription;
  message: string;
}
