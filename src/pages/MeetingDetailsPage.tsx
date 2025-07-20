import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle, Loader2 } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Sidebar from '../components/layout/Sidebar';
import ChatHeader from '../components/meetings/ChatHeader';
import ChatContainer from '../components/meetings/ChatContainer';
import AudioPlayer from '../components/meetings/AudioPlayer';
import ActionItemsPanel from '../components/meetings/ActionItemsPanel';
import { meetingService } from '../services/meetingService';
import { transcriptionService } from '../services/transcriptionService';
import { useActionItems } from '../hooks/useActionItems';
import { useActionItemCompletion } from '../hooks/useActionItemCompletion';

import { formatTime, getSpeakerColor } from '../utils/meetingUtils';
import type { Meeting } from '../types/meeting';
import type { Transcription, ChatSegment } from '../types/transcription';

const MeetingDetailsPage = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const { actionItems, fetchActionItems, loading: actionItemsLoading, updateActionItem } = useActionItems();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'transcript'>('chat');
  const { pendingCompletions, countdowns, handleToggle, handleUndo } = useActionItemCompletion();

  useEffect(() => {
    if (meetingId) {
      fetchMeeting();
    }
  }, [meetingId]);

  const fetchMeeting = async () => {
    if (!meetingId) return;

    setLoading(true);
    setError(null);

    try {
      const [meetingData, transcriptionData] = await Promise.all([
        meetingService.getMeeting(meetingId),
        transcriptionService.getTranscription(meetingId).catch(() => null), // Handle case where transcription doesn't exist
      ]);

      setMeeting(meetingData);
      setTranscription(transcriptionData || null);

      // Fetch action items for this meeting
      console.log('Fetching action items for meeting:', meetingId);
      await fetchActionItems({ meetingId });
      console.log('Action items fetched:', actionItems);
    } catch (err) {
      console.error('Error fetching meeting data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && transcription) {
      setCurrentTime(audioRef.current.currentTime);

      // Find active segment based on current time
      const currentTimeMs = audioRef.current.currentTime * 1000;
      const activeSeg = transcription.chatSegments.find(
        (segment: ChatSegment) => currentTimeMs >= segment.startTime && currentTimeMs <= segment.endTime
      );
      setActiveSegment(activeSeg?.id || null);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSegmentClick = (segment: ChatSegment) => {
    if (audioRef.current) {
      audioRef.current.currentTime = segment.startTime / 1000;
      setCurrentTime(segment.startTime / 1000);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleActionItemToggle = (actionItemId: string) => {
    const actionItem = actionItems.find((item) => item.id === actionItemId);
    if (!actionItem) return;
    handleToggle(actionItemId, actionItem.status, updateActionItem);
  };

  const handleActionItemUndo = (actionItemId: string) => {
    const actionItem = actionItems.find((item) => item.id === actionItemId);
    if (!actionItem) return;
    handleUndo(actionItemId, actionItem.status, updateActionItem);
  };

  if (loading) {
    return (
      <div className='flex h-screen bg-gray-50'>
        <Sidebar />
        <div className='flex-1 flex flex-col'>
          <DashboardHeader currentSection='Meeting Details' />
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-4' />
              <p className='text-gray-600'>Loading meeting details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className='flex h-screen bg-gray-50'>
        <Sidebar />
        <div className='flex-1 flex flex-col'>
          <DashboardHeader currentSection='Meeting Details' />
          <div className='flex-1 flex items-center justify-center'>
            <div className='text-center'>
              <AlertCircle className='w-8 h-8 text-red-600 mx-auto mb-4' />
              <p className='text-red-600 mb-4'>{error || 'Meeting not found'}</p>
              <button onClick={() => navigate('/meetings')} className='text-blue-600 hover:text-blue-800'>
                Back to Meetings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chatSegments = transcription?.chatSegments || [];

  return (
    <div className='flex h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        <DashboardHeader currentSection='Meeting Details' />

        {/* Header */}
        <div className='bg-white border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <button
              onClick={() => navigate('/meetings')}
              className='flex cursor-pointer items-center text-gray-600 hover:text-gray-900 transition-colors'
            >
              <ArrowLeft className='w-5 h-5 mr-2' />
              Back
            </button>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setViewMode(viewMode === 'chat' ? 'transcript' : 'chat')}
                className='flex cursor-pointer items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <FileText className='w-4 h-4 mr-2' />
                {viewMode === 'chat' ? 'Full Text' : 'Chat View'}
              </button>
            </div>
          </div>
        </div>

        <div className='flex flex-1 overflow-hidden'>
          {/* Left Panel - Chat/Transcript */}
          <div className='flex-1 flex flex-col bg-white'>
            {/* Chat Header */}
            <ChatHeader
              title={meeting.title}
              createdAt={meeting.createdAt}
              messageCount={chatSegments.length}
              duration={meeting.duration ? parseFloat(meeting.duration) : 0}
              formatTime={formatTime}
            />

            {/* Chat Container */}
            <ChatContainer
              chatSegments={chatSegments}
              activeSegment={activeSegment}
              onSegmentClick={handleSegmentClick}
              formatTime={formatTime}
              getSpeakerColor={getSpeakerColor}
              viewMode={viewMode}
              transcription={transcription}
            />

            {/* Audio Player */}
            <AudioPlayer
              audioRef={audioRef}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={meeting.duration ? parseFloat(meeting.duration) : 0}
              isMuted={isMuted}
              onPlayPause={handlePlayPause}
              onTimeUpdate={handleTimeUpdate}
              onSeek={handleSeek}
              onToggleMute={() => setIsMuted(!isMuted)}
              formatTime={formatTime}
              filePath={meeting.file_path}
            />
          </div>

          {/* Right Panel - Action Items */}
          <ActionItemsPanel
            actionItems={actionItems}
            onToggle={handleActionItemToggle}
            onUndo={handleActionItemUndo}
            pendingCompletions={pendingCompletions}
            countdowns={countdowns}
            loading={actionItemsLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailsPage;
