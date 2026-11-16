import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Academics from './pages/Academics';
import Certificates from './pages/Certificates';
import Projects from './pages/Projects';
import Achievements from './pages/Achievements';
import Hackathons from './pages/Hackathons';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AIAssistant from './components/AIAssistant';
import BackendHealth from './components/BackendHealth';
import { mockUser } from './lib/mockData';

// Helper component to track route changes and update active page in navigation
function RouteTracker({ setCurrentPage }) {
  const location = useLocation();
  React.useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    setCurrentPage(path);
  }, [location, setCurrentPage]);
  return null;
}

// Protected layout wrapping all authenticated app screens
function AuthenticatedLayout() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Derive displayName from user metadata or email or fallback
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || mockUser.name;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <RouteTracker setCurrentPage={setCurrentPage} />

      {/* Sidebar Navigation */}
      <Sidebar
        activePage={currentPage}
        onNavigate={(page) => {
          if (page === 'ai-assistant') {
            setIsAIOpen(true);
          } else {
            setCurrentPage(page);
          }
        }}
        userName={displayName}
      />

      {/* Main Workspace */}
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
            {/* Fallback to dashboard within protected routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      
      {/* AI Assistant Overlay */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        userName={displayName}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Application Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
        <BackendHealth />
      </AuthProvider>
    </BrowserRouter>
  );
}
