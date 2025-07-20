import { useState, useCallback, useRef } from 'react';
import { meetingService } from '../services/meetingService';
import { showToast } from '../utils/toast';

interface BrowserRecordingStatus {
  isRecording: boolean;
  isUploading: boolean;
  error: string | null;
  recordingDuration: number;
}

interface UseBrowserRecordingReturn {
  status: BrowserRecordingStatus;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  canRecord: boolean;
}

export const useBrowserRecording = (): UseBrowserRecordingReturn => {
  const [status, setStatus] = useState<BrowserRecordingStatus>({
    isRecording: false,
    isUploading: false,
    error: null,
    recordingDuration: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);

  // Check if browser supports MediaRecorder
  const canRecord = typeof window !== 'undefined' && 'MediaRecorder' in window;

  const startDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) return;

    recordingStartTimeRef.current = Date.now();
    durationIntervalRef.current = window.setInterval(() => {
      if (recordingStartTimeRef.current) {
        const duration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setStatus((prev) => ({ ...prev, recordingDuration: duration }));
      }
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    recordingStartTimeRef.current = null;
    setStatus((prev) => ({ ...prev, recordingDuration: 0 }));
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      if (!canRecord) {
        throw new Error('Browser recording is not supported in this browser.');
      }

      setStatus((prev) => ({ ...prev, error: null }));

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        try {
          setStatus((prev) => ({ ...prev, isUploading: true }));

          // Create blob from chunks
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

          // Create file from blob
          const filename = `browser-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
          const file = new File([blob], filename, { type: 'audio/webm' });

          // Upload to backend
          const meeting = await meetingService.uploadRecording(file);

          showToast.success(`Browser recording uploaded successfully! Meeting ID: ${meeting.id}`);

          // Clean up
          chunksRef.current = [];
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload recording';
          setStatus((prev) => ({ ...prev, error: errorMessage }));
          showToast.error(errorMessage);
        } finally {
          setStatus((prev) => ({ ...prev, isUploading: false }));
        }
      };

      // Start recording
      mediaRecorder.start();
      setStatus((prev) => ({ ...prev, isRecording: true }));
      startDurationTimer();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start browser recording';
      setStatus((prev) => ({ ...prev, error: errorMessage }));
      showToast.error(errorMessage);
      throw error;
    }
  }, [canRecord, startDurationTimer]);

  const stopRecording = useCallback(async (): Promise<void> => {
    try {
      if (!mediaRecorderRef.current) {
        throw new Error('No active recording to stop.');
      }

      setStatus((prev) => ({ ...prev, error: null }));

      // Stop recording
      mediaRecorderRef.current.stop();
      setStatus((prev) => ({ ...prev, isRecording: false }));
      stopDurationTimer();

      // Clean up MediaRecorder
      mediaRecorderRef.current = null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop browser recording';
      setStatus((prev) => ({ ...prev, error: errorMessage }));
      showToast.error(errorMessage);
      throw error;
    }
  }, [stopDurationTimer]);

  return {
    status,
    startRecording,
    stopRecording,
    canRecord,
  };
};
