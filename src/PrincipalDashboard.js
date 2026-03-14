import React from 'react';
export default function PrincipalDashboard({ user, data, onLogout }) {
  return (
    <div style={{padding: '20px', color: 'white'}}>
      <h1>Principal Dashboard</h1>
      <p>Welcome, {user?.name}</p>
    </div>
  );
}
