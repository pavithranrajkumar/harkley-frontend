import { StreamInfo, AudioTrackInfo } from '../types';
import { ERROR_CODES } from '../constants';
import { logError, handleAsyncError } from '../utils/errorHandling';

export class AudioMixingService {
  private audioContext: AudioContext | null = null;
  private destination: MediaStreamAudioDestinationNode | null = null;

  /**
   * Mix screen and microphone audio streams using Web Audio API
   */
  async mixAudioStreams(screenStream: MediaStream, micStream: MediaStream): Promise<MediaStream> {
    return handleAsyncError(async () => {
      console.log('Creating audio mixer...');

      try {
        // Create audio context for mixing
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

        // Create sources for each audio stream
        const screenSource = this.audioContext.createMediaStreamSource(screenStream);
        const micSource = this.audioContext.createMediaStreamSource(micStream);

        // Create a destination node to combine audio
        this.destination = this.audioContext.createMediaStreamDestination();

        // Connect screen audio to destination
        if (screenStream.getAudioTracks().length > 0) {
          screenSource.connect(this.destination);
          console.log('Screen audio connected to mixer');
        }

        // Connect microphone audio to destination
        if (micStream.getAudioTracks().length > 0) {
          micSource.connect(this.destination);
          console.log('Microphone audio connected to mixer');
        }

        console.log('Web Audio API mixing successful');

        // Combine mixed audio with video tracks from screen stream
        const combinedStream = new MediaStream([
          // Video tracks from screen stream
          ...screenStream.getVideoTracks(),
          // Mixed audio from destination
          ...this.destination.stream.getAudioTracks(),
        ]);

        return combinedStream;
      } catch (error) {
        logError('AudioMixingService.mixAudioStreams', error);
        throw new Error(ERROR_CODES.AUDIO_MIXING_FAILED);
      }
    }, 'AudioMixingService.mixAudioStreams');
  }

  /**
   * Create a fallback combined stream without Web Audio API
   */
  createFallbackStream(screenStream: MediaStream, micStream: MediaStream): MediaStream {
    console.log('Using fallback stream combination');

    return new MediaStream([
      // Video tracks from screen
      ...screenStream.getVideoTracks(),
      // Audio tracks from screen (tab/system audio)
      ...screenStream.getAudioTracks(),
      // Audio tracks from microphone
      ...micStream.getAudioTracks(),
    ]);
  }

  /**
   * Get detailed information about audio tracks
   */
  getStreamInfo(screenStream: MediaStream, micStream: MediaStream, mixedStream?: MediaStream): StreamInfo {
    const videoTracks = screenStream.getVideoTracks().length;
    const screenAudioTracks = screenStream.getAudioTracks().length;
    const micAudioTracks = micStream.getAudioTracks().length;
    const mixedAudioTracks = mixedStream?.getAudioTracks().length || 0;
    const totalAudioTracks = mixedStream?.getAudioTracks().length || screenAudioTracks + micAudioTracks;

    return {
      videoTracks,
      screenAudioTracks,
      micAudioTracks,
      mixedAudioTracks,
      totalAudioTracks,
    };
  }

  /**
   * Get detailed information about audio tracks
   */
  getAudioTrackInfo(stream: MediaStream): AudioTrackInfo[] {
    return stream.getAudioTracks().map((track) => ({
      label: track.label,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState,
    }));
  }

  /**
   * Log stream information for debugging
   */
  logStreamInfo(screenStream: MediaStream, micStream: MediaStream, combinedStream: MediaStream): void {
    const info = this.getStreamInfo(screenStream, micStream, combinedStream);

    console.log('Combined streams:');
    console.log('- Video tracks:', info.videoTracks);
    console.log('- Screen audio tracks:', info.screenAudioTracks);
    console.log('- Microphone audio tracks:', info.micAudioTracks);
    console.log('- Mixed audio tracks:', info.mixedAudioTracks);
    console.log('- Total audio tracks in final stream:', info.totalAudioTracks);

    // Log track details for debugging
    combinedStream.getAudioTracks().forEach((track, index) => {
      console.log(`Final audio track ${index}:`, {
        label: track.label,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
      });
    });
  }

  /**
   * Clean up audio context resources
   */
  cleanup(): void {
    if (this.audioContext) {
      console.log('Closing audio context...');
      this.audioContext.close();
      this.audioContext = null;
      this.destination = null;
    }
  }
}
