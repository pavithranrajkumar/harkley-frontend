import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MeetingsPage from './pages/MeetingsPage';
import MeetingDetailsPage from './pages/MeetingDetailsPage';
import ActionItemsPage from './pages/ActionItemsPage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className='App'>
          <Routes>
            <Route
              path='/'
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path='/login'
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path='/signup'
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />
            <Route
              path='/dashboard'
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path='/meetings'
              element={
                <PrivateRoute>
                  <MeetingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path='/meetings/:meetingId'
              element={
                <PrivateRoute>
                  <MeetingDetailsPage />
                </PrivateRoute>
              }
            />
            <Route
              path='/action-items'
              element={
                <PrivateRoute>
                  <ActionItemsPage />
                </PrivateRoute>
              }
            />
            {/* Catch all route - redirect to appropriate page based on auth status */}
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
