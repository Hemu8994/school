import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import PrincipalDashboard from './PrincipalDashboard';
import TeacherDashboard from './TeacherDashboard';
import ParentDashboard from './ParentDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const handleLogin = (userData, dashboard) => {
    setUser(userData);
    setDashboardData(dashboard);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDashboardData(null);
  };

  // Protected Route component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) return <Navigate to="/login" />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['principal']}>
            <PrincipalDashboard 
              user={user} 
              data={dashboardData} 
              onLogout={handleLogout} 
            />
          </ProtectedRoute>
        } />
        
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard 
              user={user} 
              data={dashboardData} 
              onLogout={handleLogout} 
            />
          </ProtectedRoute>
        } />
        
        <Route path="/parent" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard 
              user={user} 
              data={dashboardData} 
              onLogout={handleLogout} 
            />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
