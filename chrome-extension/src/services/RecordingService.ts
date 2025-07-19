import { RecordingSession, RecordingData } from '../types';
import { RECORDING_CONFIG, ERROR_CODES } from '../constants';
import { logError, handleAsyncError } from '../utils/errorHandling';
import { AudioMixingService } from './AudioMixingService';

export class RecordingService {
  private currentRecording: RecordingSession | null = null;
  private audioMixingService: AudioMixingService;

  constructor() {
    this.audioMixingService = new AudioMixingService();
  }

  /**
   * Check if recording is currently active
   */
  isRecording(): boolean {
    return !!this.currentRecording;
  }

  /**
   * Check if there's a global recording (persists across page reloads)
   */
  hasGlobalRecording(): boolean {
    return !!(window.mediaRecorders && window.mediaRecorders.length > 0);
  }

  /**
   * Start recording with combined audio streams
   */
  async startRecording(): Promise<void> {
    return handleAsyncError(async () => {
      // Prevent multiple recording requests
      if (this.currentRecording) {
        console.log('Recording already in progress, skipping...');
        return;
      }

      // Check if there's already a global recording
      if (this.hasGlobalRecording()) {
        console.log('Global recording already exists, skipping...');
        return;
      }

      console.log('Starting recording with combined audio streams...');

      // Step 1: Get screen capture with audio
      const screenStream = await this.getScreenStream();

      // Step 2: Get microphone audio
      const micStream = await this.getMicrophoneStream();

      // Step 3: Combine the streams
      const combinedStream = await this.combineStreams(screenStream, micStream);

      // Step 4: Create MediaRecorder
      const mediaRecorder = this.createMediaRecorder(combinedStream);

      // Step 5: Store recording session
      this.currentRecording = {
        mediaRecorder,
        screenStream,
        micStream,
        combinedStream,
        audioContext: this.audioMixingService['audioContext'],
        destination: this.audioMixingService['destination'],
      };

      // Step 6: Store globally for persistence
      this.storeGlobally(mediaRecorder);

      // Step 7: Start recording
      mediaRecorder.start();
      console.log('Recording started with combined audio streams');
    }, 'RecordingService.startRecording');
  }

  /**
   * Stop the current recording
   */
  async stopRecording(): Promise<void> {
    return handleAsyncError(async () => {
      if (!this.currentRecording) {
        throw new Error(ERROR_CODES.NO_ACTIVE_RECORDING);
      }

      // Stop the MediaRecorder
      this.currentRecording.mediaRecorder.stop();

      // Stop all tracks from all streams
      this.stopAllTracks();

      // Clean up audio context
      this.audioMixingService.cleanup();

      // Clear recording session
      this.currentRecording = null;

      // Clear global mediaRecorders array
      this.clearGlobalRecording();

      console.log('Recording stopped (all streams)');
    }, 'RecordingService.stopRecording');
  }

  /**
   * Get screen capture stream
   */
  private async getScreenStream(): Promise<MediaStream> {
    return navigator.mediaDevices.getDisplayMedia({
      video: RECORDING_CONFIG.VIDEO,
      audio: RECORDING_CONFIG.SCREEN_AUDIO,
    });
  }

  /**
   * Get microphone stream
   */
  private async getMicrophoneStream(): Promise<MediaStream> {
    console.log('Requesting microphone access...');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: RECORDING_CONFIG.MIC_AUDIO,
    });
    console.log('Microphone access granted:', stream.getAudioTracks().length, 'tracks');
    return stream;
  }

  /**
   * Combine screen and microphone streams
   */
  private async combineStreams(screenStream: MediaStream, micStream: MediaStream): Promise<MediaStream> {
    console.log('Creating combined stream...');

    try {
      // Try Web Audio API mixing first
      const mixedStream = await this.audioMixingService.mixAudioStreams(screenStream, micStream);
      this.audioMixingService.logStreamInfo(screenStream, micStream, mixedStream);
      return mixedStream;
    } catch (error) {
      logError('RecordingService.combineStreams', error);
      // Fallback to simple stream combination
      const fallbackStream = this.audioMixingService.createFallbackStream(screenStream, micStream);
      this.audioMixingService.logStreamInfo(screenStream, micStream, fallbackStream);
      return fallbackStream;
    }
  }

  /**
   * Create MediaRecorder with proper configuration
   */
  private createMediaRecorder(stream: MediaStream): MediaRecorder {
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: RECORDING_CONFIG.MIME_TYPE,
    });

    const chunks: Blob[] = [];
    let isStopped = false;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (isStopped) {
        console.log('Recording already stopped, skipping duplicate onstop');
        return;
      }
      isStopped = true;

      const blob = new Blob(chunks, { type: RECORDING_CONFIG.MIME_TYPE });
      console.log('Recording completed, size:', blob.size);

      // Notify React app with blob data
      this.notifyRecordingComplete(blob);
    };

    return mediaRecorder;
  }

  /**
   * Stop all tracks from all streams
   */
  private stopAllTracks(): void {
    if (!this.currentRecording) return;

    const { screenStream, micStream, combinedStream } = this.currentRecording;

    // Stop screen stream tracks
    screenStream.getTracks().forEach((track) => {
      console.log('Stopping screen track:', track.label);
      track.stop();
    });

    // Stop microphone stream tracks
    micStream.getTracks().forEach((track) => {
      console.log('Stopping microphone track:', track.label);
      track.stop();
    });

    // Stop combined stream tracks
    combinedStream.getTracks().forEach((track) => {
      console.log('Stopping combined stream track:', track.label);
      track.stop();
    });
  }

  /**
   * Store MediaRecorder globally for persistence
   */
  private storeGlobally(mediaRecorder: MediaRecorder): void {
    if (!window.mediaRecorders) {
      window.mediaRecorders = [];
    }
    window.mediaRecorders.push(mediaRecorder);
  }

  /**
   * Clear global recording storage
   */
  private clearGlobalRecording(): void {
    if (window.mediaRecorders) {
      window.mediaRecorders = [];
    }
  }

  /**
   * Notify React app about recording completion
   */
  private notifyRecordingComplete(blob: Blob): void {
    const recordingData: RecordingData = {
      data: URL.createObjectURL(blob),
      size: blob.size,
      type: blob.type,
      timestamp: Date.now(),
    };

    // Send message to React app
    window.postMessage(
      {
        source: 'harkley-extension',
        action: 'recordingComplete',
        ...recordingData,
      },
      '*'
    );
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.audioMixingService.cleanup();
    this.currentRecording = null;
  }
}

// Extend Window interface for global recording storage
declare global {
  interface Window {
    mediaRecorders?: MediaRecorder[];
  }
}
