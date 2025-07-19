import { EXTENSION_CONFIG } from '../constants';
import { RecordingService } from '../services/RecordingService';
import { CommunicationService } from '../services/CommunicationService';
import { logError } from '../utils/errorHandling';
import { handleAsyncOperation, handleBackgroundCommunication } from '../utils/messageHelpers';

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
    this.communicationService.registerHandler(EXTENSION_CONFIG.MESSAGES.ACTIONS.START_RECORDING, () =>
      handleAsyncOperation(
        () => this.recordingService.startRecording(),
        this.communicationService,
        EXTENSION_CONFIG.MESSAGES.ACTIONS.RECORDING_STARTED
      )
    );

    // Handle stop recording request
    this.communicationService.registerHandler(EXTENSION_CONFIG.MESSAGES.ACTIONS.STOP_RECORDING, () =>
      handleAsyncOperation(
        () => this.recordingService.stopRecording(),
        this.communicationService,
        EXTENSION_CONFIG.MESSAGES.ACTIONS.RECORDING_STOPPED
      )
    );

    // Handle get recording status request
    this.communicationService.registerHandler(EXTENSION_CONFIG.MESSAGES.ACTIONS.GET_RECORDING_STATUS, () =>
      handleBackgroundCommunication(
        EXTENSION_CONFIG.MESSAGES.ACTIONS.GET_RECORDING_STATUS,
        this.communicationService,
        EXTENSION_CONFIG.MESSAGES.ACTIONS.RECORDING_STATUS_RESPONSE
      )
    );

    // Handle get recording data request
    this.communicationService.registerHandler(EXTENSION_CONFIG.MESSAGES.ACTIONS.GET_RECORDING_DATA, () =>
      handleBackgroundCommunication(
        EXTENSION_CONFIG.MESSAGES.ACTIONS.GET_RECORDING_DATA,
        this.communicationService,
        EXTENSION_CONFIG.MESSAGES.ACTIONS.RECORDING_DATA_RESPONSE
      )
    );

    // Handle test connection request
    this.communicationService.registerHandler(EXTENSION_CONFIG.MESSAGES.ACTIONS.TEST_CONNECTION, () =>
      handleAsyncOperation(
        async () => {}, // No-op operation, just send success response
        this.communicationService,
        EXTENSION_CONFIG.MESSAGES.ACTIONS.EXTENSION_INSTALLED
      )
    );

    // Handle clear recording data request
    this.communicationService.registerHandler(EXTENSION_CONFIG.MESSAGES.ACTIONS.CLEAR_RECORDING_DATA, () =>
      handleBackgroundCommunication(
        EXTENSION_CONFIG.MESSAGES.ACTIONS.CLEAR_RECORDING_DATA,
        this.communicationService,
        EXTENSION_CONFIG.MESSAGES.ACTIONS.CLEAR_RECORDING_DATA_RESPONSE
      )
    );
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
          action: EXTENSION_CONFIG.MESSAGES.ACTIONS.RECORDING_RESUMED,
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
