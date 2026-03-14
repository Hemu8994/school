import React from 'react';
export default function ParentDashboard({ user, data, onLogout }) {
  return (
    <div style={{padding: '20px', color: 'white'}}>
      <h1>Parent Dashboard</h1>
      <p>Welcome, {user?.name}</p>
    </div>
  );
}
