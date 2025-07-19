import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path='/' element={<LoginPage />} />
          <Route path='/login' element={<LoginPage />} />
          {/* Add more routes here as we build them */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
