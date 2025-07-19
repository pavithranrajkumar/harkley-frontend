import { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import type { ChatSegment } from '../../types/meeting';

interface ChatContainerProps {
  chatSegments: ChatSegment[];
  activeSegment: string | null;
  onSegmentClick: (segment: ChatSegment) => void;
  formatTime: (seconds: number) => string;
  getSpeakerColor: (speakerNumber: number) => string;
  viewMode: 'chat' | 'transcript';
  transcription?: { fullText: string } | null;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  chatSegments,
  activeSegment,
  onSegmentClick,
  formatTime,
  getSpeakerColor,
  viewMode,
  transcription,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when chat segments load
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatSegments]);

  if (viewMode === 'transcript') {
    return (
      <div className='flex-1 overflow-y-auto p-4 chat-container'>
        <div className='max-w-4xl mx-auto'>
          <div className='bg-gray-50 rounded-lg p-6'>
            <h3 className='font-semibold text-gray-900 mb-4'>Full Transcription</h3>
            <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>{transcription?.fullText || 'No transcription available'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={chatContainerRef} className='flex-1 overflow-y-auto p-4 space-y-4 chat-container'>
      <div className='max-w-4xl mx-auto space-y-4'>
        {chatSegments.map((segment, index) => {
          const isActive = activeSegment === segment.id;
          const speakerColor = getSpeakerColor(segment.speakerNumber);
          const isFirstInGroup = index === 0 || chatSegments[index - 1].speakerNumber !== segment.speakerNumber;

          return (
            <ChatMessage
              key={segment.id}
              segment={segment}
              isActive={isActive}
              isFirstInGroup={isFirstInGroup}
              speakerColor={speakerColor}
              onSegmentClick={onSegmentClick}
              formatTime={formatTime}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ChatContainer;
