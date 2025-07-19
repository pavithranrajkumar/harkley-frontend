import { ExtensionConfig } from '../types';

export const EXTENSION_CONFIG: ExtensionConfig = {
  MESSAGES: {
    SOURCE: {
      EXTENSION: 'harkley-extension',
      REACT_APP: 'harkley-react-app',
    },
    ACTIONS: {
      EXTENSION_INSTALLED: 'extensionInstalled',
      START_RECORDING: 'startRecording',
      STOP_RECORDING: 'stopRecording',
      RECORDING_COMPLETE: 'recordingComplete',
    },
  },
  STORAGE_KEYS: {
    RECORDING_STATUS: 'recordingStatus',
    RECORDING_DATA: 'recordingData',
  },
};

export const RECORDING_CONFIG = {
  VIDEO: {
    displaySurface: 'browser' as const,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
  SCREEN_AUDIO: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
  MIC_AUDIO: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  MIME_TYPE: 'video/webm;codecs=vp9',
} as const;

export const ERROR_CODES = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  NOT_FOUND: 'NOT_FOUND',
  AUDIO_MIXING_FAILED: 'AUDIO_MIXING_FAILED',
  NO_ACTIVE_RECORDING: 'NO_ACTIVE_RECORDING',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.PERMISSION_DENIED]: 'Permission denied. Please allow screen sharing when prompted.',
  [ERROR_CODES.NOT_SUPPORTED]: 'Screen recording is not supported in this browser.',
  [ERROR_CODES.NOT_FOUND]: 'No screen or tab found to record.',
  [ERROR_CODES.AUDIO_MIXING_FAILED]: 'Audio mixing failed, using fallback method.',
  [ERROR_CODES.NO_ACTIVE_RECORDING]: 'No active recording to stop.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unknown error occurred.',
} as const;
