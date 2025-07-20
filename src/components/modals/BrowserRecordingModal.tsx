import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Video, VideoOff, Square, Upload, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { meetingService } from '../../services/meetingService';
import { showToast } from '../../utils/toast';

interface BrowserRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

const MAX_RECORDING_TIME = 15 * 60; // 15 minutes in seconds

export const BrowserRecordingModal: React.FC<BrowserRecordingModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  // Core states
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasAudio, setHasAudio] = useState(true);
  const [hasVideo, setHasVideo] = useState(true);

  // Recording states
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Stream states
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const blobRef = useRef<Blob | null>(null);

  // Utility functions
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecordingState = () => {
    setIsRecording(false);
    setIsStarting(false);
    setIsUploading(false);
    setDuration(0);
    setStreamError(null);
  };

  const cleanupResources = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Cleanup preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    // Reset states
    setRecordedBlob(null);
    setIsPreviewMode(false);
    setIsStreamReady(false);
  };

  // Timer management
  const startTimer = () => {
    setDuration(0);
    timerRef.current = window.setInterval(() => {
      setDuration((prev) => {
        const newDuration = prev + 1;
        if (newDuration >= MAX_RECORDING_TIME) {
          stopRecording();
          return newDuration;
        }
        return newDuration;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Stream management
  const initializeStream = async () => {
    try {
      setStreamError(null);

      // Stop existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const constraints = {
        audio: hasAudio,
        video: hasVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsStreamReady(true);

      // Set video source after a small delay to ensure DOM is ready
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error('Failed to get media stream:', error);
      setStreamError('Failed to access camera/microphone. Please check permissions.');
      setIsStreamReady(false);
    }
  };

  // Recording management
  const getSupportedMimeType = () => {
    // If video is disabled, use audio-only webm
    if (!hasVideo) {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        return 'audio/webm;codecs=opus';
      }
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        return 'audio/webm';
      }
      // Fallback to video webm with no video tracks
      if (MediaRecorder.isTypeSupported('video/webm;codecs=opus')) {
        return 'video/webm;codecs=opus';
      }
    }

    // Video recording - prefer VP9, fallback to VP8
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      return 'video/webm;codecs=vp9,opus';
    }
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      return 'video/webm;codecs=vp8,opus';
    }
    return 'video/webm';
  };

  const handleRecordingStop = (mimeType: string) => {
    if (chunksRef.current.length > 0) {
      // Force WebM MIME type regardless of what MediaRecorder reports
      const forcedMimeType = hasVideo ? 'video/webm' : 'audio/webm';

      console.log('Creating blob with forced MIME type:', {
        originalMimeType: mimeType,
        forcedMimeType,
        chunksCount: chunksRef.current.length,
      });

      // Create blob with forced WebM MIME type
      const blob = new Blob(chunksRef.current, { type: forcedMimeType });

      // Validate blob
      if (blob.size === 0) {
        console.error('Recording blob is empty');
        setStreamError('Recording failed - no data captured');
        resetRecordingState();
        stopTimer();
        return;
      }

      console.log('Recording completed:', {
        blobSize: blob.size,
        mimeType: blob.type,
        chunksCount: chunksRef.current.length,
      });

      // Store blob in ref to prevent garbage collection
      blobRef.current = blob;
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setIsPreviewMode(true);

      // Stop the live stream to prevent interference with preview
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } else {
      console.error('No recording data available');
      setStreamError('Recording failed - no data captured');
    }

    resetRecordingState();
    stopTimer();
  };

  const startRecording = async () => {
    if (!streamRef.current || isRecording) return;

    try {
      setIsStarting(true);

      // Cleanup previous recording
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setRecordedBlob(null);
      setIsPreviewMode(false);
      chunksRef.current = [];

      const mimeType = getSupportedMimeType();
      console.log('Starting recording with:', {
        mimeType,
        hasAudio,
        hasVideo,
        streamTracks: streamRef.current.getTracks().map((t) => ({ kind: t.kind, enabled: t.enabled })),
      });

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => handleRecordingStop(mimeType);

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        resetRecordingState();
        stopTimer();
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsStarting(false);
      startTimer();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsStarting(false);
      setStreamError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // File operations
  const uploadRecording = async () => {
    // Use blob from ref if state is null (prevents cache issues)
    const blobToUpload = recordedBlob || blobRef.current;

    if (!blobToUpload) {
      console.error('No recorded blob available');
      showToast.error('No recording available to upload');
      return;
    }

    try {
      setIsUploading(true);
      setStreamError(null);

      // Ensure blob is valid and has content
      if (blobToUpload.size === 0) {
        throw new Error('Recording file is empty');
      }

      console.log('Original blob before upload:', {
        size: blobToUpload.size,
        type: blobToUpload.type,
      });

      // Convert blob to array buffer to prevent cache issues
      const arrayBuffer = await blobToUpload.arrayBuffer();
      const safeBlob = new Blob([arrayBuffer], { type: blobToUpload.type });

      console.log('Safe blob created:', {
        size: safeBlob.size,
        type: safeBlob.type,
      });

      // Determine file extension based on MIME type
      const getFileExtension = (mimeType: string) => {
        if (mimeType.startsWith('audio/')) return 'webm';
        if (mimeType.startsWith('video/')) return 'webm';
        return 'webm'; // fallback
      };

      const filename = `harkley-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${getFileExtension(blobToUpload.type)}`;
      const file = new File([safeBlob], filename, { type: blobToUpload.type });

      console.log('File created for upload:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // Upload to backend
      const meeting = await meetingService.uploadRecording(file);

      console.log('Recording uploaded successfully:', meeting);

      // Show success message
      showToast.success(`Recording uploaded successfully!`);

      // Call success callback and close modal
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      handleClose();
    } catch (error) {
      console.error('Failed to upload recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload recording';
      setStreamError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // UI actions
  const startNewRecording = () => {
    cleanupResources();
    resetRecordingState();
    initializeStream();
  };

  const handleClose = () => {
    // Stop recording if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    cleanupResources();
    resetRecordingState();
    onClose();
  };

  const toggleAudio = () => {
    if (!isRecording) {
      setHasAudio(!hasAudio);
    }
  };

  const toggleVideo = () => {
    if (!isRecording) {
      setHasVideo(!hasVideo);
    }
  };

  // Effects
  useEffect(() => {
    if (isOpen) {
      initializeStream();
    }
  }, [isOpen, hasAudio, hasVideo]);

  useEffect(() => {
    if (!isOpen) {
      cleanupResources();
      resetRecordingState();
    }
  }, [isOpen]);

  // Render helpers
  const renderVideoPreview = () => {
    if (isPreviewMode && previewUrl) {
      return (
        <video
          key='preview-video'
          src={previewUrl}
          controls
          preload='metadata'
          className='w-full h-full object-cover'
          onError={(e) => console.error('Preview video error:', e)}
        />
      );
    }

    if (hasVideo && isStreamReady) {
      return <video key='live-video' ref={videoRef} autoPlay muted playsInline className='w-full h-full object-cover' />;
    }

    return (
      <div className='flex items-center justify-center h-full'>
        <VideoOff className='w-16 h-16 text-gray-600' />
      </div>
    );
  };

  const renderControls = () => {
    if (isRecording || isPreviewMode) return null;

    return (
      <div className='flex items-center justify-center space-x-4 mb-6'>
        <Button
          variant='outline'
          size='sm'
          onClick={toggleAudio}
          className={`p-3 ${hasAudio ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}`}
          title={hasAudio ? 'Audio On' : 'Audio Off'}
        >
          {hasAudio ? <Mic className='w-5 h-5' /> : <MicOff className='w-5 h-5' />}
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={toggleVideo}
          className={`p-3 ${hasVideo ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}`}
          title={hasVideo ? 'Video On' : 'Video Off'}
        >
          {hasVideo ? <Video className='w-5 h-5' /> : <VideoOff className='w-5 h-5' />}
        </Button>
      </div>
    );
  };

  const renderActionButtons = () => {
    if (isPreviewMode) {
      return (
        <>
          <Button onClick={startNewRecording} className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3' leftIcon={<Mic className='w-5 h-5' />}>
            Record Again
          </Button>
          <Button
            onClick={uploadRecording}
            disabled={isUploading}
            className='bg-green-600 hover:bg-green-700 text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed'
            leftIcon={isUploading ? <Loader2 className='w-5 h-5 animate-spin' /> : <Upload className='w-5 h-5' />}
          >
            {isUploading ? 'Uploading...' : 'Upload Recording'}
          </Button>
        </>
      );
    }

    if (!isRecording) {
      return (
        <Button
          onClick={startRecording}
          disabled={isStarting || !isStreamReady}
          className='bg-red-600 hover:bg-red-700 text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed'
          leftIcon={<Mic className='w-5 h-5' />}
        >
          {isStarting ? 'Starting...' : 'Start Recording'}
        </Button>
      );
    }

    return (
      <Button onClick={stopRecording} className='bg-gray-600 hover:bg-gray-700 text-white px-8 py-3' leftIcon={<Square className='w-5 h-5' />}>
        Stop Recording
      </Button>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className='bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'
          >
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h3 className='text-xl font-semibold text-gray-900'>Record Meeting</h3>
              <button onClick={handleClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'>
                <X className='w-5 h-5 text-gray-500' />
              </button>
            </div>

            {/* Content */}
            <div className='p-6'>
              {/* Error Message */}
              {streamError && (
                <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                  <p className='text-red-700 text-sm'>{streamError}</p>
                </div>
              )}

              {/* Video Preview */}
              <div className='relative bg-gray-900 rounded-lg overflow-hidden mb-6 aspect-video'>
                {renderVideoPreview()}

                {/* Recording Indicator */}
                {isRecording && (
                  <div className='absolute top-4 left-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full'>
                    <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                    <span className='text-sm font-medium'>{formatTime(duration)}</span>
                  </div>
                )}

                {/* Time Warning */}
                {isRecording && duration >= MAX_RECORDING_TIME - 60 && (
                  <div className='absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full'>
                    <span className='text-sm font-medium'>{Math.max(0, Math.ceil((MAX_RECORDING_TIME - duration) / 60))}m left</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              {renderControls()}

              {/* Action Buttons */}
              <div className='flex items-center justify-center space-x-4'>{renderActionButtons()}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
