import { ExtensionMessage, MessageHandler } from '../types';
import { EXTENSION_CONFIG } from '../constants';
import { logError } from '../utils/errorHandling';

// Chrome extension types
declare const chrome: {
  runtime: {
    sendMessage: (message: unknown) => Promise<unknown>;
    onMessage: {
      addListener: (callback: (message: ExtensionMessage, sender: unknown, sendResponse: (response?: unknown) => void) => void) => void;
      removeListener: (callback: (message: ExtensionMessage, sender: unknown, sendResponse: (response?: unknown) => void) => void) => void;
    };
  };
};

export class CommunicationService {
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private unsubscribeFunctions: (() => void)[] = [];

  /**
   * Initialize communication service
   */
  initialize(): void {
    this.setupChromeMessageListener();
    this.setupWindowMessageListener();
  }

  /**
   * Register a message handler
   */
  registerHandler(action: string, handler: MessageHandler): void {
    this.messageHandlers.set(action, handler);
  }

  /**
   * Send message to React app
   */
  sendToReactApp(message: Omit<ExtensionMessage, 'source'>): void {
    try {
      const messageWithSource: ExtensionMessage = {
        source: EXTENSION_CONFIG.MESSAGES.SOURCE.EXTENSION,
        action: message.action as string,
        ...message,
      };

      window.postMessage(messageWithSource, '*');
    } catch (error) {
      logError('CommunicationService.sendToReactApp', error);
    }
  }

  /**
   * Send message to background script
   */
  async sendToBackground(message: ExtensionMessage): Promise<unknown> {
    try {
      return await (chrome as unknown as { runtime: { sendMessage: (msg: unknown) => Promise<unknown> } }).runtime.sendMessage(message);
    } catch (error) {
      logError('CommunicationService.sendToBackground', error);
      throw error;
    }
  }

  /**
   * Setup Chrome runtime message listener
   */
  private setupChromeMessageListener(): void {
    const backgroundMessageHandler = (message: ExtensionMessage, sender: unknown, sendResponse: (response?: unknown) => void) => {
      console.log('Content script received message from background:', message);

      // Handle messages from background script
      if (message.source === 'harkley-extension') {
        const handler = this.messageHandlers.get(message.action);
        if (handler) {
          handler(message);
        } else {
          console.warn('Unknown message action from background:', message.action);
        }
      }

      // Send response back to background script
      if (sendResponse) {
        sendResponse({ success: true });
      }
    };

    chrome.runtime.onMessage.addListener(backgroundMessageHandler);
    this.unsubscribeFunctions.push(() => {
      chrome.runtime.onMessage.removeListener(backgroundMessageHandler);
    });
  }

  /**
   * Setup window message listener for React app communication
   */
  private setupWindowMessageListener(): void {
    const reactAppMessageHandler = (event: MessageEvent): void => {
      // Validate message source
      if (event.source !== window) return;
      if (event.data.source !== EXTENSION_CONFIG.MESSAGES.SOURCE.REACT_APP) return;

      console.log('Content script received message from React app:', event.data);

      // Handle message
      const handler = this.messageHandlers.get(event.data.action);
      if (handler) {
        handler(event.data);
      } else {
        console.warn('Unknown message action from React app:', event.data.action);
      }
    };

    window.addEventListener('message', reactAppMessageHandler);
    this.unsubscribeFunctions.push(() => {
      window.removeEventListener('message', reactAppMessageHandler);
    });
  }

  /**
   * Clean up all event listeners
   */
  cleanup(): void {
    this.unsubscribeFunctions.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        logError('CommunicationService.cleanup', error);
      }
    });

    this.unsubscribeFunctions = [];
    this.messageHandlers.clear();
  }
}
