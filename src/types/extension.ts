import { ACTIONS, MESSAGE_SOURCES } from '../constants/extension';

export interface RecordingData {
  data: string;
  timestamp: number;
  size: number;
  type: string;
}

export interface ExtensionStatus {
  isInstalled: boolean;
  isRecording: boolean;
  recordingDuration: number;
  error: string | null;
  isUploading: boolean;
}

export interface UseHarkleyExtensionReturn {
  status: ExtensionStatus;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  getRecordingData: () => Promise<RecordingData | null>;
  clearRecordingData: () => Promise<void>;
}

export type ExtensionAction = (typeof ACTIONS.OUTGOING)[keyof typeof ACTIONS.OUTGOING];
export type ExtensionResponseAction = (typeof ACTIONS.INCOMING)[keyof typeof ACTIONS.INCOMING];
export type MessageSource = (typeof MESSAGE_SOURCES)[keyof typeof MESSAGE_SOURCES];

export interface ExtensionMessage {
  source: MessageSource;
  action: ExtensionAction;
  [key: string]: unknown;
}

export interface ExtensionResponse {
  source: MessageSource;
  action: ExtensionResponseAction;
  [key: string]: unknown;
}

export interface RecordingCompleteData {
  data: string;
  timestamp: number;
}
