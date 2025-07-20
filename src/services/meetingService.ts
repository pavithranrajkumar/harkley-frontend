import { apiRequest } from './api';
import type { Meeting, MeetingsResponse, MeetingStats } from '../types/meeting';

export interface GetMeetingsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface UpdateMeetingData {
  title?: string;
  summary?: string;
  status?: string;
}

const BASE_PATH = '/meetings';
class MeetingService {
  /**
   * Get all meetings with pagination
   */
  async getMeetings(params: GetMeetingsParams = {}): Promise<MeetingsResponse> {
    const { page = 1, limit = 10, status } = params;

    const response = await apiRequest<MeetingsResponse>('GET', BASE_PATH, {
      params: {
        page,
        limit,
        status,
      },
    });
    if (!response.data) {
      throw new Error('No data received from API');
    }
    return response.data;
  }

  /**
   * Get a specific meeting by ID
   */
  async getMeeting(meetingId: string): Promise<Meeting> {
    const response = await apiRequest<Meeting>('GET', `${BASE_PATH}/${meetingId}`);
    if (!response.data) {
      throw new Error('No data received from API');
    }
    return response.data;
  }

  /**
   * Get meeting statistics
   */
  async getMeetingStats(): Promise<MeetingStats> {
    const response = await apiRequest<MeetingStats>('GET', `${BASE_PATH}/stats`);
    if (!response.data) {
      throw new Error('No stats data received from API');
    }
    return response.data;
  }

  /**
   * Update a meeting
   */
  async updateMeeting(meetingId: string, data: UpdateMeetingData): Promise<Meeting> {
    const response = await apiRequest<Meeting>('PATCH', `${BASE_PATH}/${meetingId}`, data);
    if (!response.data) {
      throw new Error('No data received from API');
    }
    return response.data;
  }

  /**
   * Delete a meeting
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    await apiRequest<void>('DELETE', `${BASE_PATH}/${meetingId}`);
  }

  /**
   * Get recent meetings (first 5) for dashboard
   */
  async getRecentMeetings(): Promise<Meeting[]> {
    const response = await this.getMeetings({ page: 1, limit: 5 });
    return response.meetings;
  }

  /**
   * Upload recording file to create a new meeting
   */
  async uploadRecording(recordingFile: File): Promise<Meeting> {
    const formData = new FormData();
    formData.append('recording', recordingFile);

    const response = await apiRequest<Meeting>('POST', BASE_PATH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data) {
      throw new Error('No meeting data received from API');
    }
    return response.data;
  }
}

export const meetingService = new MeetingService();
export default meetingService;
