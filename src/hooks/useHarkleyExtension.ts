import { useState, useEffect, useCallback, useRef } from 'react';

interface RecordingData {
  data: string;
  timestamp: number;
  size: number;
  type: string;
}

interface ExtensionStatus {
  isInstalled: boolean;
  isRecording: boolean;
  recordingDuration: number;
  error: string | null;
}

interface UseHarkleyExtensionReturn {
  status: ExtensionStatus;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  getRecordingData: () => Promise<RecordingData | null>;
  clearRecordingData: () => Promise<void>;
}

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
  });

  const durationIntervalRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const extensionCheckTimeoutRef = useRef<number | null>(null);

  /**
   * Send message to Harkley extension
   */
  const sendMessageToExtension = useCallback((action: string, data?: Record<string, unknown>): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          reject(new Error('Not in browser environment'));
          return;
        }

        // Send message to extension
        window.postMessage(
          {
            source: 'harkley-react-app',
            action,
            ...data,
          },
          '*'
        );

        // For now, we'll resolve immediately since the extension will respond via message events
        // In a more robust implementation, you might want to implement a request-response pattern
        resolve({ success: true });
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  /**
   * Start recording
   */
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      // Check if extension is installed
      if (!status.isInstalled) {
        throw new Error('Harkley extension is not installed. Please install the extension to record meetings.');
      }

      setStatus((prev) => ({ ...prev, error: null }));

      await sendMessageToExtension('startRecording');

      // Update local state
      setStatus((prev) => ({
        ...prev,
        isRecording: true,
        error: null,
      }));

      recordingStartTimeRef.current = Date.now();
      startDurationTimer();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      setStatus((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, [sendMessageToExtension, status.isInstalled]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(async (): Promise<void> => {
    try {
      // Check if extension is installed
      if (!status.isInstalled) {
        throw new Error('Harkley extension is not installed.');
      }

      setStatus((prev) => ({ ...prev, error: null }));

      await sendMessageToExtension('stopRecording');

      // Update local state
      setStatus((prev) => ({
        ...prev,
        isRecording: false,
        error: null,
      }));

      stopDurationTimer();
      recordingStartTimeRef.current = null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop recording';
      setStatus((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      throw error;
    }
  }, [sendMessageToExtension, status.isInstalled]);

  /**
   * Get recording data from extension
   */
  const getRecordingData = useCallback(async (): Promise<RecordingData | null> => {
    try {
      if (!status.isInstalled) {
        throw new Error('Harkley extension is not installed.');
      }

      await sendMessageToExtension('getRecordingData');

      // The extension will respond via message event
      // For now, return null - in a real implementation, you'd wait for the response
      return null;
    } catch (error) {
      console.error('Failed to get recording data:', error);
      return null;
    }
  }, [sendMessageToExtension, status.isInstalled]);

  /**
   * Download recording
   */
  const downloadRecording = useCallback((blobUrl: string, timestamp: number) => {
    try {
      console.log('Starting download with blobUrl:', blobUrl, 'timestamp:', timestamp);

      const filename = `harkley-recording-${new Date(timestamp).toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the blob URL
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);

      alert(`Recording downloaded successfully!\n\nFile: ${filename}\nLocation: Your Downloads folder`);
    } catch (error) {
      console.error('Failed to download recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to download recording: ${errorMessage}`);
    }
  }, []);

  /**
   * Clear recording data
   */
  const clearRecordingData = useCallback(async (): Promise<void> => {
    try {
      if (!status.isInstalled) {
        throw new Error('Harkley extension is not installed.');
      }

      await sendMessageToExtension('clearRecordingData');
    } catch (error) {
      console.error('Failed to clear recording data:', error);
      throw error;
    }
  }, [sendMessageToExtension, status.isInstalled]);

  /**
   * Start duration timer
   */
  const startDurationTimer = useCallback(() => {
    stopDurationTimer(); // Clear any existing timer

    durationIntervalRef.current = window.setInterval(() => {
      if (recordingStartTimeRef.current) {
        const duration = Date.now() - recordingStartTimeRef.current;
        setStatus((prev) => ({
          ...prev,
          recordingDuration: duration,
        }));
      }
    }, 1000);
  }, []);

  /**
   * Stop duration timer
   */
  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  /**
   * Handle messages from Harkley extension
   */
  const handleExtensionMessage = useCallback(
    (event: MessageEvent) => {
      // Validate message source
      if (event.source !== window) return;
      if (event.data.source !== 'harkley-extension') return;

      const { action, ...data } = event.data;

      switch (action) {
        case 'extensionInstalled':
          setStatus((prev) => ({
            ...prev,
            isInstalled: true,
            error: null,
          }));
          break;

        case 'recordingStarted':
          // Handle recording started
          console.log('Recording started:', data);
          setStatus((prev) => ({
            ...prev,
            isRecording: true,
            error: null,
          }));
          recordingStartTimeRef.current = data.timestamp || Date.now();
          startDurationTimer();
          break;

        case 'recordingStopped':
          // Handle recording stopped
          console.log('Recording stopped:', data);
          setStatus((prev) => ({
            ...prev,
            isRecording: false,
            error: null,
          }));
          stopDurationTimer();
          break;

        case 'recordingError':
          // Handle recording error
          console.error('Recording error:', data);
          setStatus((prev) => ({
            ...prev,
            isRecording: false,
            error: data.error || 'Recording error occurred',
          }));
          stopDurationTimer();
          break;

        case 'recordingChunk':
          // Handle recording chunk
          console.log('Received recording chunk:', data);
          // You can store chunks in state or process them immediately
          break;

        case 'recordingComplete':
          // Handle complete recording
          console.log('Recording completed:', data);
          setStatus((prev) => ({
            ...prev,
            isRecording: false,
          }));
          stopDurationTimer();

          // Download the recording
          if (data.data) {
            const timestamp = data.timestamp || Date.now();
            downloadRecording(data.data, timestamp);
          }
          break;

        case 'statusUpdate':
          // Handle status updates (legacy)
          if (data.status === 'recording_started') {
            setStatus((prev) => ({
              ...prev,
              isRecording: true,
              error: null,
            }));
            recordingStartTimeRef.current = data.startTime || Date.now();
            startDurationTimer();
          } else if (data.status === 'recording_stopped') {
            setStatus((prev) => ({
              ...prev,
              isRecording: false,
              error: null,
            }));
            stopDurationTimer();
          } else if (data.status === 'recording_error') {
            setStatus((prev) => ({
              ...prev,
              error: data.error || 'Recording error occurred',
            }));
          }
          break;

        case 'recordingStatusResponse':
          // Handle recording status response
          if (data.success) {
            setStatus((prev) => ({
              ...prev,
              isRecording: data.isRecording || false,
            }));
          } else {
            setStatus((prev) => ({
              ...prev,
              error: data.error || 'Failed to get recording status',
            }));
          }
          break;

        case 'recordingDataResponse':
          // Handle recording data response
          if (data.success && data.data) {
            console.log('Received recording data:', data.data);
            // You can store this in state or process it
          } else {
            console.error('Failed to get recording data:', data.error);
          }
          break;

        default:
          console.log('Unknown extension message:', action, data);
      }
    },
    [startDurationTimer, stopDurationTimer]
  );

  /**
   * Check if extension is installed
   */
  const checkExtensionInstalled = useCallback(() => {
    // Clear any existing timeout
    if (extensionCheckTimeoutRef.current) {
      clearTimeout(extensionCheckTimeoutRef.current);
    }

    // Send a test message to check if extension is installed
    window.postMessage(
      {
        source: 'harkley-react-app',
        action: 'testConnection',
      },
      '*'
    );

    // Set a timeout to check if extension responded
    extensionCheckTimeoutRef.current = window.setTimeout(() => {
      if (!status.isInstalled) {
        setStatus((prev) => ({
          ...prev,
          isInstalled: false,
          error: 'Harkley extension not detected. Please install the extension to record meetings.',
        }));
      }
    }, 2000); // Wait 2 seconds for extension to respond
  }, [status.isInstalled]);

  /**
   * Setup message listener
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    messageListenerRef.current = handleExtensionMessage;
    window.addEventListener('message', messageListenerRef.current);

    // Check if extension is installed
    checkExtensionInstalled();

    return () => {
      if (messageListenerRef.current) {
        window.removeEventListener('message', messageListenerRef.current);
      }
      if (extensionCheckTimeoutRef.current) {
        clearTimeout(extensionCheckTimeoutRef.current);
      }
    };
  }, [handleExtensionMessage, checkExtensionInstalled]);

  /**
   * Prevent page reload when recording is active
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (status.isRecording) {
        // Show warning message
        const message = 'Recording is in progress. Are you sure you want to leave? Your recording will be lost.';
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (status.isRecording) {
        // Prevent common reload shortcuts
        const isReloadShortcut =
          (event.key === 'r' && (event.metaKey || event.ctrlKey)) || // Cmd/Ctrl + R
          event.key === 'F5' || // F5
          event.key === 'F12'; // F12 (developer tools)

        if (isReloadShortcut) {
          event.preventDefault();
          alert('Recording is in progress. Please stop recording before reloading the page.');
          return false;
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
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
      if (extensionCheckTimeoutRef.current) {
        clearTimeout(extensionCheckTimeoutRef.current);
      }
    };
  }, [stopDurationTimer]);

  return {
    status,
    startRecording,
    stopRecording,
    getRecordingData,
    clearRecordingData,
  };
};
