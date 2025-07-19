import { EXTENSION_CONFIG } from '../constants';
import { CommunicationService } from '../services/CommunicationService';
import { logError } from './errorHandling';

/**
 * Helper function to handle async operations with consistent error handling
 */
export const handleAsyncOperation = async (
  operation: () => Promise<void>,
  communicationService: CommunicationService,
  successAction: string,
  errorAction: string = EXTENSION_CONFIG.MESSAGES.ACTIONS.RECORDING_ERROR
): Promise<void> => {
  try {
    await operation();

    // Send success message
    communicationService.sendToReactApp({
      action: successAction,
      timestamp: Date.now(),
    });
  } catch (error) {
    logError(`ContentScript error`, error);

    // Send error message
    communicationService.sendToReactApp({
      action: errorAction,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
    });
  }
};

/**
 * Helper function to handle background communication with consistent error handling
 */
export const handleBackgroundCommunication = async (
  action: string,
  communicationService: CommunicationService,
  responseAction: string
): Promise<void> => {
  try {
    const response = await communicationService.sendToBackground({
      source: EXTENSION_CONFIG.MESSAGES.SOURCE.EXTENSION,
      action,
    });

    // Forward response back to React app
    communicationService.sendToReactApp({
      action: responseAction,
      ...(response as Record<string, unknown>),
    });
  } catch (error) {
    logError(`ContentScript.${action}`, error);

    communicationService.sendToReactApp({
      action: responseAction,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
