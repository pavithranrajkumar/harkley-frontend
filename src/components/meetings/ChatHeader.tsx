import { Mic } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  createdAt: string;
  messageCount: number;
  duration: number;
  formatTime: (seconds: number) => string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, createdAt, messageCount, duration, formatTime }) => {
  return (
    <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='bg-blue-100 p-2 rounded-full'>
            <Mic className='w-5 h-5 text-blue-600' />
          </div>
          <div>
            <h2 className='font-semibold text-gray-900'>{title}</h2>
            <p className='text-sm text-gray-500'>
              {new Date(createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              | {messageCount} messages
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-2 text-sm text-gray-500'>
          <span>Duration: {formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
