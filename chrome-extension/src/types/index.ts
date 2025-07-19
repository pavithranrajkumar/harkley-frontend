// Core types for the Chrome extension

export interface ExtensionConfig {
  MESSAGES: {
    SOURCE: {
      EXTENSION: string;
      REACT_APP: string;
    };
    ACTIONS: {
      EXTENSION_INSTALLED: string;
      START_RECORDING: string;
      STOP_RECORDING: string;
      RECORDING_COMPLETE: string;

      // Response actions
      RECORDING_STARTED: string;
      RECORDING_STOPPED: string;
      RECORDING_ERROR: string;
      RECORDING_RESUMED: string;

      // Status and data actions
      GET_RECORDING_STATUS: string;
      RECORDING_STATUS_RESPONSE: string;
      GET_RECORDING_DATA: string;
      RECORDING_DATA_RESPONSE: string;
      CLEAR_RECORDING_DATA: string;
      CLEAR_RECORDING_DATA_RESPONSE: string;

      // Connection testing
      TEST_CONNECTION: string;
    };
  };
  STORAGE_KEYS: {
    RECORDING_STATUS: string;
    RECORDING_DATA: string;
  };
}

export interface RecordingSession {
  mediaRecorder: MediaRecorder;
  screenStream: MediaStream;
  micStream: MediaStream;
  combinedStream: MediaStream;
  audioContext: AudioContext | null;
  destination: MediaStreamAudioDestinationNode | null;
}

export interface ExtensionMessage {
  source: string;
  action: string;
  [key: string]: unknown;
}

export interface RecordingData {
  data: string; // Blob URL
  size: number;
  type: string;
  timestamp: number;
}

export interface RecordingError {
  message: string;
  code: string;
  recoverable: boolean;
}

export interface AudioTrackInfo {
  label: string;
  enabled: boolean;
  muted: boolean;
  readyState: MediaStreamTrackState;
}

export interface StreamInfo {
  videoTracks: number;
  screenAudioTracks: number;
  micAudioTracks: number;
  mixedAudioTracks: number;
  totalAudioTracks: number;
}

export type MessageHandler = (message: ExtensionMessage) => Promise<void> | void;
export type UnsubscribeFunction = () => void;
