import React from 'react';
export default function TeacherDashboard({ user, data, onLogout }) {
  return (
    <div style={{padding: '20px', color: 'white'}}>
      <h1>Teacher Dashboard</h1>
      <p>Welcome, {user?.name}</p>
    </div>
  );
}
