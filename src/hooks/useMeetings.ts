import { useState, useCallback } from 'react';
import { meetingService } from '../services/meetingService';
import type { Meeting, MeetingsResponse } from '../types/meeting';

interface UseMeetingsReturn {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  fetchMeetings: (page?: number, limit?: number) => Promise<void>;
  fetchRecentMeetings: () => Promise<void>;
  refreshMeetings: () => Promise<void>;
}

export const useMeetings = (): UseMeetingsReturn => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMeetings = useCallback(async (pageNum = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response: MeetingsResponse = await meetingService.getMeetings({
        page: pageNum,
        limit,
      });

      setMeetings(response.meetings);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const recentMeetings = await meetingService.getRecentMeetings();
      setMeetings(recentMeetings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMeetings = useCallback(async () => {
    await fetchMeetings(page);
  }, [fetchMeetings, page]);

  return {
    meetings,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchMeetings,
    fetchRecentMeetings,
    refreshMeetings,
  };
};
