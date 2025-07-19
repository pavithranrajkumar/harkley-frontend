import type { ChatSegment } from '../../types/meeting';

interface ChatMessageProps {
  segment: ChatSegment;
  isActive: boolean;
  isFirstInGroup: boolean;
  speakerColor: string;
  onSegmentClick: (segment: ChatSegment) => void;
  formatTime: (seconds: number) => string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ segment, isActive, isFirstInGroup, speakerColor, onSegmentClick, formatTime }) => {
  // Alternate alignment based on speaker number (even = left, odd = right)
  const isRightAligned = segment.speakerNumber % 2 === 1;

  return (
    <div className={`group relative ${isActive ? 'bg-blue-50 rounded-lg p-2 -m-2' : ''}`}>
      {isFirstInGroup && (
        <div className={`flex items-center space-x-3 mb-2 ${isRightAligned ? 'justify-end' : 'justify-start'}`}>
          {!isRightAligned && (
            <div className={`w-8 h-8 rounded-full ${speakerColor} flex items-center justify-center text-white text-sm font-medium`}>
              {segment.speakerNumber + 1}
            </div>
          )}
          <div className={`text-center ${isRightAligned ? 'order-first' : ''}`}>
            <span className='font-medium text-gray-900'>Speaker {segment.speakerNumber + 1}</span>
            <span className='text-sm text-gray-500 ml-2'>{formatTime(segment.startTime / 1000)}</span>
          </div>
          {isRightAligned && (
            <div className={`w-8 h-8 rounded-full ${speakerColor} flex items-center justify-center text-white text-sm font-medium`}>
              {segment.speakerNumber + 1}
            </div>
          )}
        </div>
      )}

      <div
        onClick={() => onSegmentClick(segment)}
        className={`cursor-pointer transition-all duration-200 ${isActive ? 'bg-blue-100' : 'hover:bg-gray-50'} rounded-lg p-3 chat-message ${
          isRightAligned ? 'ml-auto mr-0 max-w-xs bg-blue-600 text-white' : 'mr-auto ml-0 max-w-xs bg-gray-100'
        } ${!isFirstInGroup ? (isRightAligned ? 'ml-auto' : 'mr-auto') : ''}`}
      >
        <p className={`leading-relaxed ${isRightAligned ? 'text-white' : 'text-gray-800'}`}>{segment.text}</p>
        <div className={`flex items-center justify-between mt-2 text-xs ${isRightAligned ? 'text-blue-100' : 'text-gray-500'}`}>
          <span>Confidence: {segment.confidence}%</span>
          <span>{formatTime((segment.endTime - segment.startTime) / 1000)}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
