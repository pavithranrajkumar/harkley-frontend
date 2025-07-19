import { EXTENSION_CONFIG } from '../constants';
import { RecordingService } from '../services/RecordingService';
import { CommunicationService } from '../services/CommunicationService';
import { logError } from '../utils/errorHandling';

export class ContentScript {
  private isInitialized = false;
  private recordingService: RecordingService;
  private communicationService: CommunicationService;

  constructor() {
    this.recordingService = new RecordingService();
    this.communicationService = new CommunicationService();
  }

  /**
   * Initialize the content script
   */
  initialize(): void {
    if (this.isInitialized) return;

    try {
      console.log('Initializing content script...');

      // Initialize communication service
      this.communicationService.initialize();

      // Setup message handlers
      this.setupMessageHandlers();

      // Notify React app that extension is installed
      this.notifyExtensionInstalled();

      // Check if recording is already active (after page reload)
      this.checkRecordingStatus();

      this.isInitialized = true;
      console.log('Content script initialized successfully');
    } catch (error) {
      logError('ContentScript.initialize', error);
    }
  }

  /**
   * Setup message handlers for React app communication
   */
  private setupMessageHandlers(): void {
    // Handle start recording request
    this.communicationService.registerHandler(EXTENSION_CONFIG.MESSAGES.ACTIONS.START_RECORDING, async () => {
      try {
        await this.recordingService.startRecording();

        // Notify React app that recording started successfully
        this.communicationService.sendToReactApp({
          action: 'recordingStarted',
          timestamp: Date.now(),
        });
      } catch (error) {
        logError('ContentScript.startRecording', error);

        // Send error to React app
        this.communicationService.sendToReactApp({
          action: 'recordingError',
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof Error ? error.name : 'Unknown',
        });
      }
    });

    // Handle stop recording request
    this.communicationService.registerHandler(EXTENSION_CONFIG.MESSAGES.ACTIONS.STOP_RECORDING, async () => {
      try {
        await this.recordingService.stopRecording();

        // Notify React app that recording stopped
        this.communicationService.sendToReactApp({
          action: 'recordingStopped',
          timestamp: Date.now(),
        });
      } catch (error) {
        logError('ContentScript.stopRecording', error);

        // Send error to React app
        this.communicationService.sendToReactApp({
          action: 'recordingError',
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof Error ? error.name : 'Unknown',
        });
      }
    });

    // Handle get recording status request
    this.communicationService.registerHandler('getRecordingStatus', async () => {
      try {
        const response = await this.communicationService.sendToBackground({
          source: EXTENSION_CONFIG.MESSAGES.SOURCE.EXTENSION,
          action: 'getRecordingStatus',
        });

        // Forward response back to React app
        this.communicationService.sendToReactApp({
          action: 'recordingStatusResponse',
          ...(response as Record<string, unknown>),
        });
      } catch (error) {
        logError('ContentScript.getRecordingStatus', error);

        this.communicationService.sendToReactApp({
          action: 'recordingStatusResponse',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Handle get recording data request
    this.communicationService.registerHandler('getRecordingData', async () => {
      try {
        const response = await this.communicationService.sendToBackground({
          source: EXTENSION_CONFIG.MESSAGES.SOURCE.EXTENSION,
          action: 'getRecordingData',
        });

        // Forward response back to React app
        this.communicationService.sendToReactApp({
          action: 'recordingDataResponse',
          ...(response as Record<string, unknown>),
        });
      } catch (error) {
        logError('ContentScript.getRecordingData', error);

        this.communicationService.sendToReactApp({
          action: 'recordingDataResponse',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Handle test connection request
    this.communicationService.registerHandler('testConnection', async () => {
      try {
        // Send back a response to confirm extension is installed
        this.communicationService.sendToReactApp({
          action: 'extensionInstalled',
          timestamp: Date.now(),
        });
      } catch (error) {
        logError('ContentScript.testConnection', error);
      }
    });

    // Handle clear recording data request
    this.communicationService.registerHandler('clearRecordingData', async () => {
      try {
        const response = await this.communicationService.sendToBackground({
          source: EXTENSION_CONFIG.MESSAGES.SOURCE.EXTENSION,
          action: 'clearRecordingData',
        });

        // Forward response back to React app
        this.communicationService.sendToReactApp({
          action: 'clearRecordingDataResponse',
          ...(response as Record<string, unknown>),
        });
      } catch (error) {
        logError('ContentScript.clearRecordingData', error);

        this.communicationService.sendToReactApp({
          action: 'clearRecordingDataResponse',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }

  /**
   * Notify React app that extension is installed
   */
  private notifyExtensionInstalled(): void {
    console.log('Notifying React app that extension is installed...');
    this.communicationService.sendToReactApp({
      action: EXTENSION_CONFIG.MESSAGES.ACTIONS.EXTENSION_INSTALLED,
      timestamp: Date.now(),
    });
    console.log('Extension installed notification sent');
  }

  /**
   * Check if recording is already active (after page reload)
   */
  private async checkRecordingStatus(): Promise<void> {
    try {
      // Check if there's an active MediaRecorder in the page
      const mediaRecorders = window.mediaRecorders || [];
      if (mediaRecorders.length > 0) {
        console.log('Found active recording after page reload');
        this.communicationService.sendToReactApp({
          action: 'recordingResumed',
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      logError('ContentScript.checkRecordingStatus', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Don't stop recording on page reload - let it continue
    // The recording will be managed by the background script
    console.log('Content script cleanup - recording continues in background');

    // Clean up services
    this.recordingService.cleanup();
    this.communicationService.cleanup();

    this.isInitialized = false;
  }
}

// Prevent multiple content script instances
if (window.harkleyContentScript) {
  console.log('Content script already initialized, skipping...');
} else {
  // Create and initialize content script
  const contentScript = new ContentScript();
  window.harkleyContentScript = contentScript;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      contentScript.initialize();
    });
  } else {
    contentScript.initialize();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    contentScript.cleanup();
  });
}

// Extend Window interface for global recording storage
declare global {
  interface Window {
    mediaRecorders?: MediaRecorder[];
    harkleyContentScript?: ContentScript;
  }
}
