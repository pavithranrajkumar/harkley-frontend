// Timing constants
export const TIMING = {
  EXTENSION_CHECK_TIMEOUT: 2000,
  DURATION_UPDATE_INTERVAL: 1000,
  BLOB_CLEANUP_DELAY: 1000,
} as const;

// Recording file constants
export const RECORDING = {
  FILE_PREFIX: 'harkley-recording-',
  FILE_EXTENSION: '.webm',
  MIME_TYPE: 'video/webm',
} as const;

export const MESSAGE_SOURCES = {
  REACT_APP: 'harkley-react-app',
  EXTENSION: 'harkley-extension',
} as const;

export const ACTIONS = {
  // Outgoing actions
  OUTGOING: {
    TEST_CONNECTION: 'testConnection',
    START_RECORDING: 'startRecording',
    STOP_RECORDING: 'stopRecording',
    GET_RECORDING_DATA: 'getRecordingData',
    CLEAR_RECORDING_DATA: 'clearRecordingData',
  },
  // Incoming response actions
  INCOMING: {
    EXTENSION_INSTALLED: 'extensionInstalled',
    RECORDING_STARTED: 'recordingStarted',
    RECORDING_STOPPED: 'recordingStopped',
    RECORDING_ERROR: 'recordingError',
    RECORDING_CHUNK: 'recordingChunk',
    RECORDING_COMPLETE: 'recordingComplete',
    STATUS_UPDATE: 'statusUpdate',
    RECORDING_STATUS_RESPONSE: 'recordingStatusResponse',
    RECORDING_DATA_RESPONSE: 'recordingDataResponse',
  },
} as const;

export const LEGACY_STATUS = {
  RECORDING_STARTED: 'recording_started',
  RECORDING_STOPPED: 'recording_stopped',
  RECORDING_ERROR: 'recording_error',
} as const;

export const KEYBOARD_SHORTCUTS = {
  RELOAD: 'r',
  F5: 'F5',
  F12: 'F12',
} as const;

export const ERROR_MESSAGES = {
  NOT_IN_BROWSER: 'Not in browser environment',
  EXTENSION_NOT_INSTALLED: 'Harkley extension is not installed. Please install the extension to record meetings.',
  EXTENSION_NOT_DETECTED: 'Harkley extension not detected. Please install the extension to record meetings.',
  FAILED_TO_START_RECORDING: 'Failed to start recording',
  FAILED_TO_STOP_RECORDING: 'Failed to stop recording',
  FAILED_TO_GET_RECORDING_DATA: 'Failed to get recording data',
  FAILED_TO_CLEAR_RECORDING_DATA: 'Failed to clear recording data',
  FAILED_TO_UPLOAD_RECORDING: 'Failed to upload recording',
  RECORDING_ERROR_OCCURRED: 'Recording error occurred',
  FAILED_TO_GET_RECORDING_STATUS: 'Failed to get recording status',
  RECORDING_IN_PROGRESS_WARNING: 'Recording is in progress. Are you sure you want to leave? Your recording will be lost.',
  RECORDING_IN_PROGRESS_RELOAD: 'Recording is in progress. Please stop recording before reloading the page.',
} as const;
