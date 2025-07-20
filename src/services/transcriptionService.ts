import { apiRequest } from './api';
import type { Transcription } from '../types/transcription';

const BASE_PATH = '/transcriptions/meetings';
class TranscriptionService {
  /**
   * Get transcription for a meeting
   */
  async getTranscription(meetingId: string): Promise<Transcription> {
    const response = await apiRequest<Transcription>('GET', `${BASE_PATH}/${meetingId}`);
    if (!response.data) {
      throw new Error('No transcription data received from API');
    }
    return response.data;
  }

  /**
   * Create transcription for a meeting
   */
  async createTranscription(meetingId: string): Promise<Transcription> {
    const response = await apiRequest<Transcription>('POST', `${BASE_PATH}/${meetingId}`);
    if (!response.data) {
      throw new Error('No transcription data received from API');
    }
    return response.data;
  }

  /**
   * Update transcription for a meeting
   */
  async updateTranscription(meetingId: string, data: Partial<Transcription>): Promise<Transcription> {
    const response = await apiRequest<Transcription>('PUT', `${BASE_PATH}/${meetingId}`, data);
    if (!response.data) {
      throw new Error('No transcription data received from API');
    }
    return response.data;
  }

  /**
   * Delete transcription for a meeting
   */
  async deleteTranscription(meetingId: string): Promise<void> {
    await apiRequest<void>('DELETE', `${BASE_PATH}/${meetingId}`);
  }
}

export const transcriptionService = new TranscriptionService();
export default transcriptionService;
