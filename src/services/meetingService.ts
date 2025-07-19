import { apiRequest } from './api';
import type { Meeting, MeetingsResponse } from '../types/meeting';

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

class MeetingService {
  /**
   * Get all meetings with pagination
   */
  async getMeetings(params: GetMeetingsParams = {}): Promise<MeetingsResponse> {
    const { page = 1, limit = 10, status } = params;

    let endpoint = `/meetings?page=${page}&limit=${limit}`;
    if (status) {
      endpoint += `&status=${status}`;
    }

    const response = await apiRequest<MeetingsResponse>('GET', endpoint);
    if (!response.data) {
      throw new Error('No data received from API');
    }
    return response.data;
  }

  /**
   * Get a specific meeting by ID
   */
  async getMeeting(meetingId: string): Promise<Meeting> {
    const response = await apiRequest<Meeting>('GET', `/meetings/${meetingId}`);
    if (!response.data) {
      throw new Error('No data received from API');
    }
    return response.data;
  }

  /**
   * Update a meeting
   */
  async updateMeeting(meetingId: string, data: UpdateMeetingData): Promise<Meeting> {
    const response = await apiRequest<Meeting>('PATCH', `/meetings/${meetingId}`, data);
    if (!response.data) {
      throw new Error('No data received from API');
    }
    return response.data;
  }

  /**
   * Delete a meeting
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    await apiRequest<void>('DELETE', `/meetings/${meetingId}`);
  }

  /**
   * Get recent meetings (first 5) for dashboard
   */
  async getRecentMeetings(): Promise<Meeting[]> {
    const response = await this.getMeetings({ page: 1, limit: 5 });
    return response.meetings;
  }
}

export const meetingService = new MeetingService();
export default meetingService;
