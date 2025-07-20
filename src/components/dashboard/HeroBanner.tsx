import SmartRecordingButton from '../shared/SmartRecordingButton';
import type { ExtensionStatus } from '../../types/extension';

interface HeroBannerProps {
  extensionStatus: ExtensionStatus;
  onStartRecording: () => void;
  onInstallExtension: () => void;
  onUploadSuccess: () => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ extensionStatus, onStartRecording, onInstallExtension, onUploadSuccess }) => {
  return (
    <div className='mx-auto mt-8 px-6'>
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white'>
        <div className='flex items-center justify-between'>
          <div className='text-white'>
            <h1 className='text-3xl font-bold mb-2'>Ready to start a new recording?</h1>
            <p className='text-blue-100 text-lg'>Harkley AI will record, transcribe, and extract action items automatically.</p>
          </div>

          <SmartRecordingButton
            extensionStatus={extensionStatus}
            onStartRecording={onStartRecording}
            onInstallExtension={onInstallExtension}
            disabled={extensionStatus.isUploading}
            onUploadSuccess={onUploadSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
