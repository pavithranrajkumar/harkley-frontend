import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleMute: () => void;
  formatTime: (seconds: number) => string;
  filePath: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioRef,
  isPlaying,
  currentTime,
  duration,
  isMuted,
  onPlayPause,
  onTimeUpdate,
  onLoadedMetadata,
  onSeek,
  onToggleMute,
  formatTime,
  filePath,
}) => {
  return (
    <div className='border-t border-gray-200 bg-gray-50 p-4'>
      <div className='max-w-4xl mx-auto'>
        <audio ref={audioRef} src={filePath} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} />

        <div className='flex items-center space-x-4'>
          <button onClick={onPlayPause} className='bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg'>
            {isPlaying ? <Pause className='w-5 h-5' /> : <Play className='w-5 h-5' />}
          </button>

          <div className='flex-1'>
            <input
              type='range'
              min={0}
              max={duration}
              value={currentTime}
              onChange={onSeek}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider'
            />
            <div className='flex justify-between text-sm text-gray-500 mt-1'>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <button onClick={onToggleMute} className='text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-200'>
            {isMuted ? <VolumeX className='w-5 h-5' /> : <Volume2 className='w-5 h-5' />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
