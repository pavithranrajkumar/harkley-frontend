import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Mic, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface RecordingInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRecording: () => void;
}

const RecordingInstructionsModal = ({ isOpen, onClose, onStartRecording }: RecordingInstructionsModalProps) => {
  const handleStartRecording = () => {
    onStartRecording();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-gray-900'>Recording Instructions</h2>
              <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors'>
                <X size={20} />
              </button>
            </div>

            {/* Instructions */}
            <div className='space-y-4 mb-6'>
              <div className='flex items-start gap-3'>
                <div className='bg-blue-100 p-2 rounded-lg'>
                  <Monitor className='text-blue-600' size={20} />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-1'>Choose "Share Tab" Only</h3>
                  <p className='text-gray-600 text-sm'>
                    When prompted, select <strong>"Share Tab"</strong> instead of "Share Screen" or "Share Window" for the best audio quality.
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <div className='bg-green-100 p-2 rounded-lg'>
                  <Mic className='text-green-600' size={20} />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-1'>Enable Audio Sharing</h3>
                  <p className='text-gray-600 text-sm'>
                    Make sure to check <strong>"Share audio"</strong> when selecting the tab to capture meeting audio.
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <div className='bg-orange-100 p-2 rounded-lg'>
                  <AlertCircle className='text-orange-600' size={20} />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900 mb-1'>Why Tab Only?</h3>
                  <p className='text-gray-600 text-sm'>
                    Sharing only the meeting tab ensures both <strong>tab audio</strong> and <strong>microphone audio</strong> are captured clearly.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className='bg-gray-50 rounded-lg p-4 mb-6'>
              <h4 className='font-semibold text-gray-900 mb-3'>Quick Steps:</h4>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold'>1</div>
                  <span className='text-sm text-gray-700'>Click "Start Recording" below</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold'>2</div>
                  <span className='text-sm text-gray-700'>Select the meeting tab (not entire screen)</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold'>3</div>
                  <span className='text-sm text-gray-700'>Check "Share audio" and click "Share"</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold'>4</div>
                  <span className='text-sm text-gray-700'>Allow microphone access when prompted</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3'>
              <Button onClick={onClose} variant='outline' className='flex-1'>
                Cancel
              </Button>
              <Button onClick={handleStartRecording} className='flex-1 bg-blue-600 hover:bg-blue-700' leftIcon={<CheckCircle size={16} />}>
                Start Recording
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecordingInstructionsModal;
