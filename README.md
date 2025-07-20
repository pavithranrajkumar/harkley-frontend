# Harkley AI - Meeting Intelligence Platform

A modern React application that transforms meetings into actionable insights using AI-powered transcription and action item extraction.

## 🚀 Setup Instructions

### **1. Environment Setup**

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Build the project(Required for chrome extension)**

```bash
npm run build
```

### **4. Chrome Extension Setup**

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder inside `chrome-extension` from this project
5. Pin the extension to your toolbar

### **5. Start Development Server**

```bash
npm run dev
```

## 🎯 Features

- **🎙️ Dual Recording Options**:
  - **Chrome Extension Recording** - Record any tab's audio/video including Google Meet, Zoom, Teams, and other meeting platforms
  - **In-App Browser Recording** - Direct recording within the application with camera and microphone
- **📝 AI Transcription** - Automatic speech-to-text conversion
- **✅ Action Item Extraction** - AI-powered task identification and categorization
- **📊 Meeting Analytics** - Duration, file size, and processing status tracking
- **🔐 Authentication** - Secure user authentication with Supabase

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development with strict configuration
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing with protected routes
- **Chrome Extension** - WebRTC API for browser-based audio recording
- **MediaRecorder API** - In-app browser recording with WebM support

## 🎯 Recording Options

### **Chrome Extension Recording**

Browsers have restrictions on tab-level recording and only allow tab's audio. Using a Chrome extension eliminates these limitations and provides:

- **Full audio recording** - Capture system audio, not just tab audio
- **Background recording** - Continue recording even when switching tabs
- **Meeting platform support** - Works with Google Meet, Zoom, Teams, Webex, and other meeting platforms
- **Seamless integration** - Works directly in the browser environment

### **In-App Browser Recording**

For users who prefer to record directly within the application:

- **Camera and microphone access** - Direct recording with device permissions
- **No extension required** - Works immediately without additional setup
- **Audio/video controls** - Toggle audio and video independently
- **Live preview** - See what you're recording in real-time
- **15-minute limit** - Optimized for meeting recordings
- **WebM format** - High-quality video with proper compression

## 🏗️ Architecture & Best Practices

### **Component Architecture**

```typescript
// Modular, reusable components with proper TypeScript interfaces
interface MeetingCardProps {
  meeting: Meeting;
  index: number;
  onClick: (meetingId: string) => void;
}

// Custom hooks for business logic separation
const useMeetings = () => {
  // API calls, state management, and business logic
};
```

### **State Management**

- **React Hooks** - useState, useEffect, useCallback for local state
- **Custom Hooks** - Reusable business logic (useMeetings, useActionItems)
- **Context API** - Global authentication state
- **Optimistic Updates** - Immediate UI feedback with error recovery

### **API Design**

```typescript
// Type-safe API requests with proper error handling
const apiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: unknown,
  config?: object
): Promise<ApiResponse<T>>

// Service layer for API abstraction
class MeetingService {
  async uploadRecording(recordingFile: File): Promise<Meeting>
  async getMeetings(params: GetMeetingsParams): Promise<MeetingsResponse>
  async getActionItems(params: ActionItemParams): Promise<ActionItemsResponse>
}
```

### **Performance Optimization**

- **React.memo** - Prevents unnecessary re-renders
- **useCallback/useMemo** - Optimized function and value memoization
- **Code Splitting** - Lazy loading for route-based components

### **Security Practices**

- **JWT Tokens** - Secure authentication with Bearer tokens
- **CORS Configuration** - Proper cross-origin request handling
- **Input Validation** - Client-side validation with TypeScript
