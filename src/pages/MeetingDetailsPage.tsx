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
import { formatTime, getPriorityColor, getStatusColor, getSpeakerColor } from '../utils/meetingUtils';
import type { Meeting, ChatSegment } from '../types/meeting';

const MeetingDetailsPage = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'transcript'>('chat');

  useEffect(() => {
    if (meetingId) {
      fetchMeeting();
    }
  }, [meetingId]);

  useEffect(() => {
    // Scroll to bottom when chat segments load
    if (chatContainerRef.current && !loading) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [loading, meeting]);

  const fetchMeeting = async () => {
    if (!meetingId) return;

    setLoading(true);
    setError(null);

    try {
      const meetingData = await meetingService.getMeeting(meetingId);
      setMeeting(meetingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      // Find active segment based on current time
      const transcription = meeting?.transcriptions[0];
      if (transcription) {
        const currentTimeMs = audioRef.current.currentTime * 1000;
        const activeSeg = transcription.chatSegments.find((segment) => currentTimeMs >= segment.startTime && currentTimeMs <= segment.endTime);
        setActiveSegment(activeSeg?.id || null);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSpeakerColor = (speakerNumber: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[speakerNumber % colors.length];
  };

  if (loading) {
    return (
      <div className='flex h-screen bg-gray-50'>
        <Sidebar />
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-4' />
            <p className='text-gray-600'>Loading meeting details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className='flex h-screen bg-gray-50'>
        <Sidebar />
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
    );
  }

  const transcription = meeting.transcriptions[0];
  const chatSegments = transcription?.chatSegments || [];

  return (
    <div className='flex h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        <DashboardHeader currentSection='Meeting Details' />

        {/* Header */}
        <div className='bg-white border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <button onClick={() => navigate('/meetings')} className='flex items-center text-gray-600 hover:text-gray-900 transition-colors'>
              <ArrowLeft className='w-5 h-5 mr-2' />
              Back
            </button>
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setViewMode(viewMode === 'chat' ? 'transcript' : 'chat')}
                className='flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
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
            <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='bg-blue-100 p-2 rounded-full'>
                    <Mic className='w-5 h-5 text-blue-600' />
                  </div>
                  <div>
                    <h2 className='font-semibold text-gray-900'>{meeting.title}</h2>
                    <p className='text-sm text-gray-500'>
                      {new Date(meeting.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      | {chatSegments.length} messages
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-2 text-sm text-gray-500'>
                  <span>Duration: {formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className='flex-1 overflow-y-auto p-4 space-y-4 chat-container'>
              {viewMode === 'transcript' ? (
                <div className='max-w-4xl mx-auto'>
                  <div className='bg-gray-50 rounded-lg p-6'>
                    <h3 className='font-semibold text-gray-900 mb-4'>Full Transcription</h3>
                    <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>{transcription?.fullText || 'No transcription available'}</p>
                  </div>
                </div>
              ) : (
                <div className='max-w-4xl mx-auto space-y-4'>
                  {chatSegments.map((segment, index) => {
                    const isActive = activeSegment === segment.id;
                    const speakerColor = getSpeakerColor(segment.speakerNumber);
                    const isFirstInGroup = index === 0 || chatSegments[index - 1].speakerNumber !== segment.speakerNumber;

                    return (
                      <div key={segment.id} className={`group relative ${isActive ? 'bg-blue-50 rounded-lg p-2 -m-2' : ''}`}>
                        {isFirstInGroup && (
                          <div className='flex items-center space-x-3 mb-2'>
                            <div className={`w-8 h-8 rounded-full ${speakerColor} flex items-center justify-center text-white text-sm font-medium`}>
                              {segment.speakerNumber + 1}
                            </div>
                            <div>
                              <span className='font-medium text-gray-900'>Speaker {segment.speakerNumber + 1}</span>
                              <span className='text-sm text-gray-500 ml-2'>{formatTime(segment.startTime / 1000)}</span>
                            </div>
                          </div>
                        )}

                        <div
                          onClick={() => handleSegmentClick(segment)}
                          className={`ml-11 cursor-pointer transition-all duration-200 ${
                            isActive ? 'bg-blue-100' : 'hover:bg-gray-50'
                          } rounded-lg p-3`}
                        >
                          <p className='text-gray-800 leading-relaxed'>{segment.text}</p>
                          <div className='flex items-center justify-between mt-2 text-xs text-gray-500'>
                            <span>Confidence: {segment.confidence}%</span>
                            <span>{formatTime((segment.endTime - segment.startTime) / 1000)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Audio Player */}
            <div className='border-t border-gray-200 bg-gray-50 p-4'>
              <div className='max-w-4xl mx-auto'>
                <audio
                  ref={audioRef}
                  src={meeting.file_path}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />

                <div className='flex items-center space-x-4'>
                  <button onClick={handlePlayPause} className='bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg'>
                    {isPlaying ? <Pause className='w-5 h-5' /> : <Play className='w-5 h-5' />}
                  </button>

                  <div className='flex-1'>
                    <input
                      type='range'
                      min={0}
                      max={duration}
                      value={currentTime}
                      onChange={handleSeek}
                      className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider'
                    />
                    <div className='flex justify-between text-sm text-gray-500 mt-1'>
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className='text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-200'
                  >
                    {isMuted ? <VolumeX className='w-5 h-5' /> : <Volume2 className='w-5 h-5' />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Action Items */}
          <div className='w-96 bg-white border-l border-gray-200 flex flex-col'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 flex items-center'>
                  <CheckSquare className='w-5 h-5 mr-2' />
                  Action Items
                </h2>
                <span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>{meeting.actionItems.length}</span>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-4'>
              {meeting.actionItems.length === 0 ? (
                <div className='text-center py-12'>
                  <CheckSquare className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                  <p className='text-gray-500 font-medium'>No action items</p>
                  <p className='text-sm text-gray-400 mt-1'>Action items will appear here</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {meeting.actionItems.map((item) => (
                    <div key={item.id} className='bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors'>
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex items-center space-x-2'>
                          <div
                            className={`w-6 h-6 rounded-full ${getSpeakerColor(
                              item.speakerNumber
                            )} flex items-center justify-center text-white text-xs font-medium`}
                          >
                            {item.speakerNumber + 1}
                          </div>
                          <span className='text-sm font-medium text-gray-900'>Speaker {item.speakerNumber + 1}</span>
                        </div>
                        <div className='flex items-center space-x-1'>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                            <Flag className='w-3 h-3 inline mr-1' />
                            {item.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>{item.status}</span>
                        </div>
                      </div>

                      <p className='text-gray-700 text-sm leading-relaxed mb-3'>{item.description}</p>

                      {item.dueDate && (
                        <div className='flex items-center text-xs text-gray-500'>
                          <Calendar className='w-3 h-3 mr-1' />
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailsPage;
