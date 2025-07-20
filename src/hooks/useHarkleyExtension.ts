import { useState, useEffect, useCallback, useRef } from 'react';
import { meetingService } from '../services/meetingService';
import { showToast } from '../utils/toast';
import { TIMING, RECORDING, MESSAGE_SOURCES, ACTIONS, LEGACY_STATUS, KEYBOARD_SHORTCUTS, ERROR_MESSAGES } from '../constants/extension';
import type {
  RecordingData,
  ExtensionStatus,
  UseHarkleyExtensionReturn,
  ExtensionAction,
  ExtensionMessage,
  ExtensionResponse,
  RecordingCompleteData,
} from '../types/extension';

// Utility functions
const isBrowserEnvironment = (): boolean => typeof window !== 'undefined';

const createExtensionMessage = (action: ExtensionAction, data?: Record<string, unknown>): ExtensionMessage => ({
  source: MESSAGE_SOURCES.REACT_APP,
  action,
  ...data,
});

const generateRecordingFilename = (timestamp: number): string => {
  const dateString = new Date(timestamp).toISOString().slice(0, 19).replace(/:/g, '-');
  return `${RECORDING.FILE_PREFIX}${dateString}${RECORDING.FILE_EXTENSION}`;
};

const cleanupBlobUrl = (blobUrl: string): void => {
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, TIMING.BLOB_CLEANUP_DELAY);
};

const isReloadShortcut = (event: KeyboardEvent): boolean => {
  const { key, metaKey, ctrlKey } = event;
  return (key === KEYBOARD_SHORTCUTS.RELOAD && (metaKey || ctrlKey)) || key === KEYBOARD_SHORTCUTS.F5 || key === KEYBOARD_SHORTCUTS.F12;
};

/**
 * React Hook for Harkley Extension Integration
 * Manages communication with the Harkley AI Chrome extension
 */
export const useHarkleyExtension = (): UseHarkleyExtensionReturn => {
  const [status, setStatus] = useState<ExtensionStatus>({
    isInstalled: false,
    isRecording: false,
    recordingDuration: 0,
    error: null,
    isUploading: false,
  });

  const durationIntervalRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const extensionCheckTimeoutRef = useRef<number | null>(null);

  // State update helpers
  const updateStatus = useCallback((updates: Partial<ExtensionStatus>) => {
    setStatus((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateStatus({ error: null });
  }, [updateStatus]);

  const setError = useCallback(
    (error: string) => {
      updateStatus({ error });
    },
    [updateStatus]
  );

  const setRecordingState = useCallback(
    (isRecording: boolean) => {
      updateStatus({ isRecording, error: null });
    },
    [updateStatus]
  );

  const setUploadingState = useCallback(
    (isUploading: boolean) => {
      updateStatus({ isUploading, error: null });
    },
    [updateStatus]
  );

  // Timer management
  const clearTimer = useCallback((timerId: number | null) => {
    if (timerId) {
      clearTimeout(timerId);
    }
  }, []);

  const clearInterval = useCallback((intervalId: number | null) => {
    if (intervalId) {
      window.clearInterval(intervalId);
    }
  }, []);

  /**
   * Send message to Harkley extension
   */
  const sendMessageToExtension = useCallback((action: ExtensionAction, data?: Record<string, unknown>): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
      try {
        if (!isBrowserEnvironment()) {
          reject(new Error(ERROR_MESSAGES.NOT_IN_BROWSER));
          return;
        }

        const message = createExtensionMessage(action, data);
        window.postMessage(message, '*');
        resolve({ success: true });
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  /**
   * Start duration timer
   */
  const startDurationTimer = useCallback(() => {
    clearInterval(durationIntervalRef.current);

    durationIntervalRef.current = window.setInterval(() => {
      if (recordingStartTimeRef.current) {
        const duration = Date.now() - recordingStartTimeRef.current;
        updateStatus({ recordingDuration: duration });
      }
    }, TIMING.DURATION_UPDATE_INTERVAL);
  }, [clearInterval, updateStatus]);

  /**
   * Stop duration timer
   */
  const stopDurationTimer = useCallback(() => {
    clearInterval(durationIntervalRef.current);
    durationIntervalRef.current = null;
  }, [clearInterval]);

  /**
   * Upload recording to backend
   */
  const uploadRecording = useCallback(
    async (blobUrl: string, timestamp: number) => {
      try {
        console.log('Starting upload with blobUrl:', blobUrl, 'timestamp:', timestamp);
        setUploadingState(true);

        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const filename = generateRecordingFilename(timestamp);
        const file = new File([blob], filename, { type: RECORDING.MIME_TYPE });

        console.log('File created:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        });

        const meeting = await meetingService.uploadRecording(file);
        console.log('Recording uploaded successfully:', meeting);

        cleanupBlobUrl(blobUrl);
        showToast.success(`Recording uploaded successfully! Meeting ID: ${meeting.id}`);

        return meeting;
      } catch (error) {
        console.error('Failed to upload recording:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        showToast.error(`${ERROR_MESSAGES.FAILED_TO_UPLOAD_RECORDING}: ${errorMessage}`);
        throw error;
      } finally {
        setUploadingState(false);
      }
    },
    [setUploadingState]
  );

  /**
   * Handle recording completion
   */
  const handleRecordingComplete = useCallback(
    (data: RecordingCompleteData) => {
      console.log('Recording completed:', data);
      setRecordingState(false);
      stopDurationTimer();

      if (data.data) {
        const timestamp = data.timestamp || Date.now();
        uploadRecording(data.data, timestamp)
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            console.error('Failed to upload recording:', error);
          });
      }
    },
    [setRecordingState, stopDurationTimer, uploadRecording]
  );

  /**
   * Handle legacy status updates
   */
  const handleLegacyStatusUpdate = useCallback(
    (data: Record<string, unknown>) => {
      const statusValue = data.status as string;

      switch (statusValue) {
        case LEGACY_STATUS.RECORDING_STARTED:
          setRecordingState(true);
          recordingStartTimeRef.current = (data.startTime as number) || Date.now();
          startDurationTimer();
          break;
        case LEGACY_STATUS.RECORDING_STOPPED:
          setRecordingState(false);
          stopDurationTimer();
          break;
        case LEGACY_STATUS.RECORDING_ERROR:
          setError((data.error as string) || ERROR_MESSAGES.RECORDING_ERROR_OCCURRED);
          break;
      }
    },
    [setRecordingState, setError, startDurationTimer, stopDurationTimer]
  );

  /**
   * Handle messages from Harkley extension
   */
  const handleExtensionMessage = useCallback(
    (event: MessageEvent) => {
      if (event.source !== window) return;

      const response = event.data as ExtensionResponse;
      if (response.source !== MESSAGE_SOURCES.EXTENSION) return;

      const { action, ...data } = response;

      switch (action) {
        case ACTIONS.INCOMING.EXTENSION_INSTALLED:
          updateStatus({ isInstalled: true, error: null });
          break;

        case ACTIONS.INCOMING.RECORDING_STARTED:
          console.log('Recording started:', data);
          setRecordingState(true);
          recordingStartTimeRef.current = (data.timestamp as number) || Date.now();
          startDurationTimer();
          break;

        case ACTIONS.INCOMING.RECORDING_STOPPED:
          console.log('Recording stopped:', data);
          setRecordingState(false);
          stopDurationTimer();
          break;

        case ACTIONS.INCOMING.RECORDING_ERROR:
          console.error('Recording error:', data);
          setRecordingState(false);
          setError((data.error as string) || ERROR_MESSAGES.RECORDING_ERROR_OCCURRED);
          stopDurationTimer();
          break;

        case ACTIONS.INCOMING.RECORDING_CHUNK:
          console.log('Received recording chunk:', data);
          break;

        case ACTIONS.INCOMING.RECORDING_COMPLETE:
          handleRecordingComplete({
            data: data.data as string,
            timestamp: data.timestamp as number,
          });
          break;

        case ACTIONS.INCOMING.STATUS_UPDATE:
          handleLegacyStatusUpdate(data);
          break;

        case ACTIONS.INCOMING.RECORDING_STATUS_RESPONSE:
          if (data.success) {
            updateStatus({ isRecording: (data.isRecording as boolean) || false });
          } else {
            setError((data.error as string) || ERROR_MESSAGES.FAILED_TO_GET_RECORDING_STATUS);
          }
          break;

        case ACTIONS.INCOMING.RECORDING_DATA_RESPONSE:
          if (data.success && data.data) {
            console.log('Received recording data:', data.data);
          } else {
            console.error('Failed to get recording data:', data.error);
          }
          break;

        default:
          console.log('Unknown extension message:', action, data);
      }
    },
    [updateStatus, setRecordingState, setError, startDurationTimer, stopDurationTimer, handleRecordingComplete, handleLegacyStatusUpdate]
  );

  /**
   * Check if extension is installed
   */
  const checkExtensionInstalled = useCallback(() => {
    clearTimer(extensionCheckTimeoutRef.current);

    window.postMessage(createExtensionMessage(ACTIONS.OUTGOING.TEST_CONNECTION), '*');

    extensionCheckTimeoutRef.current = window.setTimeout(() => {
      if (!status.isInstalled) {
        setError(ERROR_MESSAGES.EXTENSION_NOT_DETECTED);
      }
    }, TIMING.EXTENSION_CHECK_TIMEOUT);
  }, [status.isInstalled, setError, clearTimer]);

  /**
   * Start recording
   */
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      if (!status.isInstalled) {
        throw new Error(ERROR_MESSAGES.EXTENSION_NOT_INSTALLED);
      }

      clearError();
      await sendMessageToExtension(ACTIONS.OUTGOING.START_RECORDING);
      setRecordingState(true);
      recordingStartTimeRef.current = Date.now();
      startDurationTimer();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.FAILED_TO_START_RECORDING;
      setError(errorMessage);
      throw error;
    }
  }, [status.isInstalled, clearError, sendMessageToExtension, setRecordingState, startDurationTimer]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(async (): Promise<void> => {
    try {
      if (!status.isInstalled) {
        throw new Error(ERROR_MESSAGES.EXTENSION_NOT_INSTALLED);
      }

      clearError();
      await sendMessageToExtension(ACTIONS.OUTGOING.STOP_RECORDING);
      setRecordingState(false);
      stopDurationTimer();
      recordingStartTimeRef.current = null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.FAILED_TO_STOP_RECORDING;
      setError(errorMessage);
      throw error;
    }
  }, [status.isInstalled, clearError, sendMessageToExtension, setRecordingState, stopDurationTimer]);

  /**
   * Get recording data from extension
   */
  const getRecordingData = useCallback(async (): Promise<RecordingData | null> => {
    try {
      if (!status.isInstalled) {
        throw new Error(ERROR_MESSAGES.EXTENSION_NOT_INSTALLED);
      }

      await sendMessageToExtension(ACTIONS.OUTGOING.GET_RECORDING_DATA);
      return null; // Extension will respond via message event
    } catch (error) {
      console.error(ERROR_MESSAGES.FAILED_TO_GET_RECORDING_DATA, error);
      return null;
    }
  }, [status.isInstalled, sendMessageToExtension]);

  /**
   * Clear recording data
   */
  const clearRecordingData = useCallback(async (): Promise<void> => {
    try {
      if (!status.isInstalled) {
        throw new Error(ERROR_MESSAGES.EXTENSION_NOT_INSTALLED);
      }

      await sendMessageToExtension(ACTIONS.OUTGOING.CLEAR_RECORDING_DATA);
    } catch (error) {
      console.error(ERROR_MESSAGES.FAILED_TO_CLEAR_RECORDING_DATA, error);
      throw error;
    }
  }, [status.isInstalled, sendMessageToExtension]);

  /**
   * Setup message listener
   */
  useEffect(() => {
    if (!isBrowserEnvironment()) return;

    messageListenerRef.current = handleExtensionMessage;
    window.addEventListener('message', messageListenerRef.current);
    checkExtensionInstalled();

    return () => {
      if (messageListenerRef.current) {
        window.removeEventListener('message', messageListenerRef.current);
      }
      clearTimer(extensionCheckTimeoutRef.current);
    };
  }, [handleExtensionMessage, checkExtensionInstalled, clearTimer]);

  /**
   * Prevent page reload when recording is active
   */
  useEffect(() => {
    if (!isBrowserEnvironment()) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (status.isRecording) {
        event.preventDefault();
        event.returnValue = ERROR_MESSAGES.RECORDING_IN_PROGRESS_WARNING;
        return ERROR_MESSAGES.RECORDING_IN_PROGRESS_WARNING;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (status.isRecording && isReloadShortcut(event)) {
        event.preventDefault();
        alert(ERROR_MESSAGES.RECORDING_IN_PROGRESS_RELOAD);
        return false;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status.isRecording]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopDurationTimer();
      clearTimer(extensionCheckTimeoutRef.current);
    };
  }, [stopDurationTimer, clearTimer]);

  return {
    status,
    startRecording,
    stopRecording,
    getRecordingData,
    clearRecordingData,
  };
};
