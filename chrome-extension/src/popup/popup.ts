/**
 * Popup Controller
 * Manages the extension popup UI and user interactions
 */

import { EXTENSION_CONFIG } from '../constants';
import { logError } from '../utils/errorHandling';

// Chrome extension types
declare const chrome: {
  storage: {
    local: {
      get: (keys: string[]) => Promise<Record<string, unknown>>;
      set: (data: Record<string, unknown>) => Promise<void>;
    };
    onChanged: {
      addListener: (callback: (changes: Record<string, { newValue: unknown }>, namespace: string) => void) => void;
    };
  };
  runtime: {
    sendMessage: (message: unknown) => Promise<{ success: boolean; error?: string }>;
  };
  tabs: {
    create: (options: { url: string }) => Promise<void>;
  };
};

interface PopupElements {
  recordButton: HTMLButtonElement;
  statusText: HTMLElement;
  durationText: HTMLElement;
  recordingIndicator: HTMLElement;
  openDashboardButton: HTMLElement;
}

interface PopupState {
  isRecording: boolean;
  recordingStartTime: number | null;
  durationInterval: number | null;
}

export class PopupController {
  private isInitialized = false;
  private state: PopupState = {
    isRecording: false,
    recordingStartTime: null,
    durationInterval: null,
  };

  private elements: PopupElements | null = null;
  private eventHandlers: Map<string, () => void> = new Map();

  /**
   * Initialize the popup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize DOM elements
      this.initializeElements();

      // Setup event handlers
      this.setupEventHandlers();

      // Load initial state
      await this.loadInitialState();

      // Setup storage listeners
      this.setupStorageListeners();

      this.isInitialized = true;
      console.log('Popup initialized');
    } catch (error) {
      logError('PopupController.initialize', error);
      this.showError('Failed to initialize popup');
    }
  }

  /**
   * Initialize DOM elements
   */
  private initializeElements(): void {
    const recordButton = document.getElementById('recordButton') as HTMLButtonElement;
    const statusText = document.getElementById('statusText');
    const durationText = document.getElementById('durationText');
    const recordingIndicator = document.getElementById('recordingIndicator');
    const openDashboardButton = document.getElementById('openDashboardButton');

    // Validate all elements exist
    if (!recordButton || !statusText || !durationText || !recordingIndicator || !openDashboardButton) {
      throw new Error('Required popup elements not found');
    }

    this.elements = {
      recordButton,
      statusText,
      durationText,
      recordingIndicator,
      openDashboardButton,
    };
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.elements) return;

    // Record button click handler
    this.eventHandlers.set('recordButton', async () => {
      await this.handleRecordButtonClick();
    });

    // Dashboard button click handler
    this.eventHandlers.set('openDashboardButton', () => {
      this.handleDashboardButtonClick();
    });

    // Attach event listeners
    this.elements.recordButton.addEventListener('click', this.eventHandlers.get('recordButton')!);
    this.elements.openDashboardButton.addEventListener('click', this.eventHandlers.get('openDashboardButton')!);
  }

  /**
   * Load initial state from storage
   */
  private async loadInitialState(): Promise<void> {
    try {
      // Get recording status from storage
      const result = await chrome.storage.local.get([EXTENSION_CONFIG.STORAGE_KEYS.RECORDING_STATUS]);
      this.state.isRecording = (result[EXTENSION_CONFIG.STORAGE_KEYS.RECORDING_STATUS] as boolean) || false;
      this.updateUI();
    } catch (error) {
      logError('PopupController.loadInitialState', error);
      this.showError('Failed to load recording status');
    }
  }

  /**
   * Setup storage change listeners
   */
  private setupStorageListeners(): void {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace !== 'local') return;

      const recordingStatusKey = EXTENSION_CONFIG.STORAGE_KEYS.RECORDING_STATUS;
      if (changes[recordingStatusKey]) {
        const newValue = changes[recordingStatusKey].newValue as boolean;
        this.handleRecordingStatusChange(newValue);
      }
    });
  }

  /**
   * Handle record button click
   */
  private async handleRecordButtonClick(): Promise<void> {
    try {
      if (!this.elements) return;

      // Prevent multiple clicks
      if (this.elements.recordButton.classList.contains('loading')) {
        return;
      }

      this.setLoadingState(true);

      if (!this.state.isRecording) {
        await this.startRecording();
      } else {
        await this.stopRecording();
      }
    } catch (error) {
      logError('PopupController.handleRecordButtonClick', error);
      this.showError('Failed to toggle recording');
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Start recording
   */
  private async startRecording(): Promise<void> {
    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: EXTENSION_CONFIG.MESSAGES.ACTIONS.START_RECORDING,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to start recording');
      }

      // Update local state
      this.state.isRecording = true;
      this.state.recordingStartTime = Date.now();

      // Update UI
      this.updateUI();
      this.startDurationTimer();

      // Update storage
      await chrome.storage.local.set({
        [EXTENSION_CONFIG.STORAGE_KEYS?.RECORDING_STATUS || 'recordingStatus']: true,
      });

      console.log('Recording started successfully');
    } catch (error) {
      logError('PopupController.startRecording', error);
      this.showError(error instanceof Error ? error.message : 'Failed to start recording');
      throw error;
    }
  }

  /**
   * Stop recording
   */
  private async stopRecording(): Promise<void> {
    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: EXTENSION_CONFIG.MESSAGES.ACTIONS.STOP_RECORDING,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to stop recording');
      }

      // Update local state
      this.state.isRecording = false;

      // Update UI
      this.updateUI();
      this.stopDurationTimer();

      // Update storage
      await chrome.storage.local.set({
        [EXTENSION_CONFIG.STORAGE_KEYS?.RECORDING_STATUS || 'recordingStatus']: false,
      });

      console.log('Recording stopped successfully');
    } catch (error) {
      logError('PopupController.stopRecording', error);
      this.showError(error instanceof Error ? error.message : 'Failed to stop recording');
      throw error;
    }
  }

  /**
   * Handle recording status change from storage
   */
  private handleRecordingStatusChange(isRecording: boolean): void {
    this.state.isRecording = isRecording;

    if (isRecording && !this.state.recordingStartTime) {
      this.state.recordingStartTime = Date.now();
      this.startDurationTimer();
    } else if (!isRecording) {
      this.stopDurationTimer();
    }

    this.updateUI();
  }

  /**
   * Update UI based on current state
   */
  private updateUI(): void {
    if (!this.elements) return;

    const { recordButton, statusText, durationText, recordingIndicator } = this.elements;

    if (this.state.isRecording) {
      // Recording state
      recordButton.textContent = 'Stop Recording';
      recordButton.classList.add('recording');
      statusText.textContent = 'Recording in progress...';
      recordingIndicator.classList.add('active');
      durationText.style.display = 'block';
    } else {
      // Not recording state
      recordButton.textContent = 'Start Recording';
      recordButton.classList.remove('recording');
      statusText.textContent = 'Ready to record';
      recordingIndicator.classList.remove('active');
      durationText.style.display = 'none';
    }
  }

  /**
   * Start duration timer
   */
  private startDurationTimer(): void {
    this.stopDurationTimer(); // Clear any existing timer

    this.state.durationInterval = window.setInterval(() => {
      if (this.state.recordingStartTime && this.elements) {
        const duration = Date.now() - this.state.recordingStartTime;
        this.elements.durationText.textContent = this.formatDuration(duration);
      }
    }, 1000);
  }

  /**
   * Stop duration timer
   */
  private stopDurationTimer(): void {
    if (this.state.durationInterval) {
      clearInterval(this.state.durationInterval);
      this.state.durationInterval = null;
    }
  }

  /**
   * Format duration in MM:SS format
   */
  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Handle dashboard button click
   */
  private handleDashboardButtonClick(): void {
    try {
      // Open the React app in a new tab
      chrome.tabs.create({
        url: 'http://localhost:5173', // React app URL
      });
    } catch (error) {
      logError('PopupController.handleDashboardButtonClick', error);
      this.showError('Failed to open dashboard');
    }
  }

  /**
   * Set loading state for record button
   */
  private setLoadingState(isLoading: boolean): void {
    if (!this.elements) return;

    if (isLoading) {
      this.elements.recordButton.classList.add('loading');
      this.elements.recordButton.disabled = true;
    } else {
      this.elements.recordButton.classList.remove('loading');
      this.elements.recordButton.disabled = false;
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    console.error('Popup error:', message);
    // You can implement a toast or notification system here
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    console.log('Popup success:', message);
    // You can implement a toast or notification system here
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopDurationTimer();

    // Remove event listeners
    if (this.elements) {
      this.elements.recordButton.removeEventListener('click', this.eventHandlers.get('recordButton')!);
      this.elements.openDashboardButton.removeEventListener('click', this.eventHandlers.get('openDashboardButton')!);
    }

    this.eventHandlers.clear();
    this.isInitialized = false;
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const popup = new PopupController();
  popup.initialize();
});

// Cleanup on popup close
window.addEventListener('beforeunload', () => {
  // Cleanup will be handled by the popup instance
});
