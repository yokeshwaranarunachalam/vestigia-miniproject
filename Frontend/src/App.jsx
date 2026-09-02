import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Academics from './pages/Academics';
import Certificates from './pages/Certificates';
import Projects from './pages/Projects';
import Achievements from './pages/Achievements';
import Hackathons from './pages/Hackathons';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OTPVerification from './pages/OTPVerification';
import AIAssistant from './components/AIAssistant';
import { mockUser } from './lib/mockData';

// Helper component to track route changes and update active page
function RouteTracker({ setCurrentPage }) {
  const location = useLocation();
  React.useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    setCurrentPage(path);
  }, [location, setCurrentPage]);
  return null;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [currentUser, setCurrentUser] = useState(mockUser);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <BrowserRouter>
      <RouteTracker setCurrentPage={setCurrentPage} />
      
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp" element={<OTPVerification />} />

        {isAuthenticated ? (
          <Route path="/*" element={
            <div className="flex h-screen overflow-hidden bg-gray-50">
              <Sidebar 
                activePage={currentPage} 
                onNavigate={(page) => {
                  if(page === 'ai-assistant') {
                    setIsAIOpen(true);
                  } else {
                    setCurrentPage(page);
                  }
                }} 
                userName={currentUser?.name} 
              />
              
              <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <TopBar title={currentPage} subtitle="Overview" />
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/academics" element={<Academics />} />
                    <Route path="/certificates" element={<Certificates />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/hackathons" element={<Hackathons />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
              
              {/* Global Overlays */}
              <AIAssistant 
                isOpen={isAIOpen} 
                onClose={() => setIsAIOpen(false)} 
                userName={currentUser?.name} 
              />
            </div>
          } />
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
