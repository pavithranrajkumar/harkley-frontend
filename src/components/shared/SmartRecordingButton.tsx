import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Download, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { BrowserRecordingModal } from '../modals/BrowserRecordingModal';
import type { ExtensionStatus } from '../../types/extension';

interface SmartRecordingButtonProps {
  extensionStatus: ExtensionStatus;
  onStartRecording: () => void;
  onInstallExtension?: () => void;
  onUploadSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

const SmartRecordingButton: React.FC<SmartRecordingButtonProps> = ({
  extensionStatus,
  onStartRecording,
  onInstallExtension,
  onUploadSuccess,
  disabled = false,
  className = '',
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(false);

  const getButtonConfig = () => {
    if (extensionStatus.isInstalled) {
      return {
        text: extensionStatus.isRecording ? 'Stop Recording' : 'Record Meeting',
        icon: extensionStatus.isRecording ? <CheckCircle className='w-5 h-5' /> : <Mic className='w-5 h-5' />,
        className: '!bg-white !hover:bg-gray-50 !text-gray-900 shadow-xl border border-gray-200',
        badge: { text: 'Extension', color: 'bg-emerald-400 text-emerald-900 font-semibold' },
        tooltip: 'Record any tab with perfect quality',
        onClick: onStartRecording,
      };
    } else {
      return {
        text: 'Record Meeting',
        icon: <Mic className='w-5 h-5' />,
        className: '!bg-white !hover:bg-gray-50 !text-gray-900 shadow-xl border border-gray-200',
        badge: { text: 'Browser', color: 'bg-blue-400 text-blue-900 font-semibold' },
        tooltip: 'Record current tab only. Install extension for better quality.',
        onClick: () => setShowBrowserModal(true),
      };
    }
  };

  const config = getButtonConfig();

  return (
    <div className='relative' onMouseEnter={() => !extensionStatus.isInstalled && setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={config.onClick}
          disabled={disabled}
          variant='secondary'
          className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${config.className} ${className} relative overflow-hidden group`}
        >
          <div className='flex items-center justify-center'>
            {config.icon}
            <span className='ml-3 text-base'>{config.text}</span>
            <span className={`ml-3 px-3 py-1 cursor-pointer rounded-full text-xs font-bold ${config.badge.color} shadow-sm`}>
              {config.badge.text}
            </span>
          </div>
          {/* Shimmer effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>
        </Button>
      </motion.div>

      {/* Upgrade Tooltip for non-extension users */}
      <AnimatePresence>
        {isHovering && !extensionStatus.isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='absolute top-full mt-3 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50'
          >
            <div className='flex items-start space-x-3'>
              <div className='flex-1'>
                <h4 className='font-semibold text-gray-900 mb-2'>🚀 Upgrade to Extension</h4>
                <ul className='text-sm text-gray-600 space-y-1 mb-3'>
                  <li className='flex items-center'>
                    <CheckCircle className='w-3 h-3 text-green-500 mr-2 flex-shrink-0' />
                    Record any tab (Zoom, Teams, Meet)
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='w-3 h-3 text-green-500 mr-2 flex-shrink-0' />
                    Perfect audio quality
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='w-3 h-3 text-green-500 mr-2 flex-shrink-0' />
                    System audio capture
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='w-3 h-3 text-green-500 mr-2 flex-shrink-0' />
                    One-click recording
                  </li>
                </ul>
                <div className='pt-2'>
                  <Button
                    size='sm'
                    className='w-full bg-green-600 hover:bg-green-700 text-white'
                    leftIcon={<Download className='w-4 h-4' />}
                    onClick={onInstallExtension}
                  >
                    Install Extension
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Browser Recording Modal */}
      <BrowserRecordingModal isOpen={showBrowserModal} onClose={() => setShowBrowserModal(false)} onUploadSuccess={onUploadSuccess} />
    </div>
  );
};

export default SmartRecordingButton;
