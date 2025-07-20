# Harkley AI Chrome Extension

A professional Chrome extension for recording meetings and syncing with the Harkley AI React application. This extension provides **tab-level recording** capabilities for capturing meetings from Google Meet, Zoom, Teams, and other meeting platforms.

## 🏗️ Architecture Overview

### **Monorepo Structure**

```
harkley-frontend/
├── src/                    # React application
└── chrome-extension/       # Harkley extension
    ├── src/
    │   ├── background/     # Service worker
    │   ├── content/        # Content scripts
    │   ├── popup/          # Extension popup UI
    │   └── utils/          # Shared utilities
    ├── assets/             # Icons and assets
    ├── dist/               # Built extension files
    ├── manifest.json       # Extension manifest
    ├── build.js           # Build script
    └── README.md          # This file
```

### **Core Components**

#### **1. Background Service Worker (`src/background/background.js`)**

- **Purpose**: Main extension logic and recording management
- **Responsibilities**:
  - Handle recording start/stop requests
  - Manage MediaRecorder instances
  - Coordinate with content scripts
  - Handle extension lifecycle events

#### **2. Content Script (`src/content/content.js`)**

- **Purpose**: Bridge between extension and React app
- **Responsibilities**:
  - Inject into web pages
  - Forward messages between extension and React app
  - Handle communication protocols

#### **3. Popup UI (`src/popup/`)**

- **Purpose**: User interface for extension control
- **Components**:
  - `popup.html`: Structure and accessibility
  - `popup.css`: Modern, responsive styling
  - `popup.js`: Interactive functionality

#### **4. Utility Modules (`src/utils/`)**

- **`constants.js`**: Centralized configuration
- **`storage.js`**: Harkley storage management
- **`communication.js`**: Message passing utilities
- **`recording.js`**: Screen recording logic

## 🚀 Features

### **Core Functionality**

- ✅ **Tab Recording**: Record any tab's audio/video including meeting platforms
- ✅ **Meeting Platform Support**: Google Meet, Zoom, Teams, Webex, and more
- ✅ **Real-time Sync**: Perfect synchronization with React app
- ✅ **Chunked Upload**: 10-second chunks for reliability
- ✅ **Local Storage**: 100MB temporary storage limit
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Resource Management**: Proper cleanup and memory management

### **User Experience**

- ✅ **Professional UI**: Modern, accessible popup interface
- ✅ **Visual Feedback**: Recording indicators and status updates
- ✅ **Duration Display**: Real-time recording timer
- ✅ **Error Recovery**: Graceful error handling and user feedback
- ✅ **Responsive Design**: Works across different screen sizes
- ✅ **Smart Integration**: Automatically detects when React app is available

### **Technical Excellence**

- ✅ **Clean Architecture**: Separation of concerns
- ✅ **Type Safety**: JSDoc comments and proper typing
- ✅ **Error Boundaries**: Comprehensive error handling
- ✅ **Performance**: Optimized for smooth operation
- ✅ **Security**: Proper permission handling

## 🛠️ Development Setup

### **Prerequisites**

- Node.js 18+
- Chrome browser (or Chromium-based browsers)
- React app running on `http://localhost:5173`

### **Installation**

1. **Build the Extension**

   ```bash
   cd chrome-extension
   node build.js
   ```

2. **Load in Chrome**

   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `chrome-extension/dist` folder

3. **Verify Installation**
   - Extension icon should appear in Chrome toolbar
   - Click icon to open popup
   - Should show "Ready to record" status

### **Development Workflow**

1. **Make Changes**

   - Edit files in `src/` directory
   - Follow the established patterns and conventions

2. **Rebuild**

   ```bash
   node build.js
   ```

3. **Reload Extension**
   - Go to `chrome://extensions/`
   - Click reload button on extension card
   - Or click "Update" button

## 📡 Communication Protocol

### **Message Types**

#### **Extension → React App**

```javascript
{
  source: 'harkley-extension',
  action: 'startRecording' | 'stopRecording' | 'recordingChunk' | 'recordingComplete' | 'statusUpdate',
  data?: string,        // Base64 encoded video data
  timestamp?: number,   // Unix timestamp
  size?: number,        // Data size in bytes
  type?: string         // MIME type
}
```

#### **React App → Extension**

```javascript
{
  source: 'harkley-react-app',
  action: 'startRecording' | 'stopRecording' | 'getRecordingStatus' | 'getRecordingData' | 'clearRecordingData'
}
```

### **Storage Keys**

- `recording_status`: Boolean recording state
- `recording_data`: Base64 encoded video data
- `extension_settings`: Extension configuration

## 🎯 Recording Options

### **Extension vs In-App Recording**

Harkley AI now supports **two recording methods**:

#### **Chrome Extension Recording** (This Extension)

- **Use Case**: Recording meetings from Google Meet, Zoom, Teams, Webex, etc.
- **Advantages**:
  - Works with any meeting platform
  - Captures system audio (not just tab audio)
  - Background recording (continues when switching tabs)
  - No camera/microphone permissions needed
- **Best For**: Professional meetings, conference calls, webinars

#### **In-App Browser Recording**

- **Use Case**: Direct recording within the Harkley AI application
- **Advantages**:
  - No extension installation required
  - Camera and microphone access
  - Live preview during recording
  - Audio/video toggle controls
- **Best For**: Quick recordings, presentations, personal notes

### **Smart Recording Button**

The React app includes a **Smart Recording Button** that:

- Automatically detects if the Chrome extension is installed
- Shows extension recording option when available
- Falls back to in-app recording when extension is not available
- Provides consistent UI regardless of recording method

## 🎯 Integration with React App

### **React App Requirements**

The React app must implement message listeners:

```javascript
// Listen for extension messages
window.addEventListener('message', (event) => {
  if (event.data.source === 'harkley-extension') {
    // Handle extension messages
    switch (event.data.action) {
      case 'recordingChunk':
        // Handle video chunk
        break;
      case 'recordingComplete':
        // Handle complete recording
        break;
      case 'statusUpdate':
        // Handle status updates
        break;
    }
  }
});

// Send messages to extension
window.postMessage(
  {
    source: 'harkley-react-app',
    action: 'startRecording',
  },
  '*'
);
```

### **Recording Data Format**

- **Format**: WebM with VP9 codec
- **Quality**: 1920x1080 @ 30fps, 5 Mbps
- **Audio**: 44.1kHz stereo with noise suppression
- **Chunk Size**: 10-second intervals

## 🔧 Configuration

### **Recording Settings**

```javascript
// src/utils/constants.js
RECORDING: {
  CHUNK_INTERVAL: 10000,        // 10 seconds
  VIDEO_CONFIG: {
    width: 1920,
    height: 1080,
    frameRate: 30
  },
  AUDIO_CONFIG: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  },
  MEDIA_CONFIG: {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 5000000 // 5 Mbps
  }
}
```

### **Storage Limits**

- **Temporary Storage**: 100MB per recording
- **Chunk Size**: ~10MB per 10-second chunk
- **Auto Cleanup**: After successful upload

## 🧪 Testing

### **Manual Testing Checklist**

- [ ] Extension loads without errors
- [ ] Popup UI displays correctly
- [ ] Start recording works
- [ ] Stop recording works
- [ ] Recording data reaches React app
- [ ] Error handling works
- [ ] Storage management works
- [ ] UI syncs between extension and React app

### **Debugging**

- **Extension Logs**: Check `chrome://extensions/` → Extension → "service worker"
- **Content Script Logs**: Browser DevTools → Console
- **React App Logs**: React app DevTools → Console

## 🚀 Production Deployment

### **Build for Production**

1. Update version in `manifest.json`
2. Add proper icons to `assets/` directory
3. Run build script: `node build.js`
4. Test thoroughly
5. Package `dist/` folder for Harkley Web Store

### **Harkley Web Store Requirements**

- [ ] Privacy policy
- [ ] Screenshots and descriptions
- [ ] Proper permissions justification
- [ ] Content security policy
- [ ] Accessibility compliance

## 📋 Code Quality Standards

### **JavaScript Standards**

- ✅ **ES6+ Features**: Use modern JavaScript
- ✅ **JSDoc Comments**: Document all functions
- ✅ **Error Handling**: Comprehensive try-catch blocks
- ✅ **Resource Management**: Proper cleanup
- ✅ **Performance**: Optimize for speed and memory

### **Architecture Principles**

- ✅ **Single Responsibility**: Each module has one purpose
- ✅ **Dependency Injection**: Loose coupling between components
- ✅ **Error Boundaries**: Graceful error handling
- ✅ **State Management**: Centralized state handling
- ✅ **Event-Driven**: Message-based communication

### **Security Considerations**

- ✅ **Permission Minimization**: Request only necessary permissions
- ✅ **Data Validation**: Validate all inputs
- ✅ **Secure Communication**: Use postMessage safely
- ✅ **Resource Cleanup**: Proper memory management

## 🤝 Contributing

### **Development Guidelines**

1. Follow existing code patterns
2. Add JSDoc comments for new functions
3. Include error handling
4. Test thoroughly before committing
5. Update documentation as needed

### **Code Review Checklist**

- [ ] Code follows established patterns
- [ ] Error handling is comprehensive
- [ ] Performance is optimized
- [ ] Security is considered
- [ ] Documentation is updated
- [ ] Tests pass

## 📄 License

This extension is part of the Harkley AI project and follows the same licensing terms.

---

**Built with ❤️ for professional meeting recording and AI-powered insights.**
