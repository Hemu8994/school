import React, { useEffect, useState } from 'react';

export default function PrincipalDashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data from backend
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://school-backend-bv22.onrender.com/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        setStats(result);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>⏳</div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const totalExpected = 180000 * (stats?.totalStudents || 0);
  const totalCollected = stats?.totalCollected || 0;
  const percentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashibodi ya Mkuu</h1>
          <p style={styles.welcome}>Karibu, {user?.name}!</p>
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>
          <span style={styles.logoutIcon}>🚪</span> Toka
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderLeft: '4px solid #00C9A7'}}>
          <div style={styles.statIcon}>👨‍🎓</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats?.totalStudents || 0}</div>
            <div style={styles.statLabel}>Wanafunzi</div>
          </div>
        </div>

        <div style={{...styles.statCard, borderLeft: '4px solid #0097ff'}}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>TZS {totalCollected.toLocaleString()}</div>
            <div style={styles.statLabel}>Imekusanywa</div>
          </div>
        </div>

        <div style={{...styles.statCard, borderLeft: '4px solid #FFB347'}}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{percentage}%</div>
            <div style={styles.statLabel}>Asilimia</div>
          </div>
        </div>

        <div style={{...styles.statCard, borderLeft: '4px solid #FF6B6B'}}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>TZS {(totalExpected - totalCollected).toLocaleString()}</div>
            <div style={styles.statLabel}>Baki</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressTitle}>Maendeleo ya Ukusanyaji</span>
          <span style={styles.progressPercentage}>{percentage}%</span>
        </div>
        <div style={styles.progressBarContainer}>
          <div style={{...styles.progressBar, width: `${percentage}%`}}></div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Malipo ya Karibuni</h2>
        {stats?.recentTransactions?.length > 0 ? (
          stats.recentTransactions.map((t, index) => (
            <div key={index} style={styles.transactionItem}>
              <div style={styles.transactionLeft}>
                <div style={styles.transactionStudent}>{t.studentName}</div>
                <div style={styles.transactionClass}>{t.className}</div>
              </div>
              <div style={styles.transactionRight}>
                <div style={styles.transactionAmount}>TZS {t.amount?.toLocaleString()}</div>
                <div style={styles.transactionDate}>{new Date(t.transactionDate).toLocaleDateString('sw-TZ')}</div>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.noData}>Hakuna malipo ya karibuni</p>
        )}
      </div>

      {/* Classes Overview */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Madarasa</h2>
        <div style={styles.classGrid}>
          {stats?.classStats?.map((cls, index) => (
            <div key={index} style={styles.classCard}>
              <div style={styles.className}>{cls.className}</div>
              <div style={styles.classProgress}>
                <div style={{...styles.progressBarSmall, width: `${cls.percentage}%`}}></div>
              </div>
              <div style={styles.classStats}>
                <span>{cls.paid}/{cls.total}</span>
                <span style={{color: cls.percentage > 80 ? '#00C9A7' : '#FFB347'}}>{cls.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#080f17',
    color: '#fff',
    fontFamily: "'DM Sans', sans-serif",
    padding: '20px'
  },
  loadingContainer: {
    minHeight: '100vh',
    background: '#080f17',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingSpinner: {
    fontSize: '48px',
    marginBottom: '20px',
    animation: 'spin 1s linear infinite'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '24px',
    margin: 0,
    color: '#00C9A7'
  },
  welcome: {
    color: '#888',
    fontSize: '14px',
    margin: '5px 0 0'
  },
  logoutButton: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '12px 24px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s'
  },
  logoutIcon: {
    fontSize: '16px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '15px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  statIcon: {
    fontSize: '32px'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#fff',
    fontFamily: "'Syne', sans-serif",
    lineHeight: 1.2
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    marginTop: '5px'
  },
  progressSection: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '30px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  progressTitle: {
    color: '#fff',
    fontSize: '14px'
  },
  progressPercentage: {
    color: '#00C9A7',
    fontWeight: 700
  },
  progressBarContainer: {
    background: 'rgba(255,255,255,0.1)',
    height: '10px',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #00C9A7, #0097ff)',
    borderRadius: '5px',
    transition: 'width 0.5s ease'
  },
  section: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '30px'
  },
  sectionTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '18px',
    margin: '0 0 20px 0',
    color: '#fff'
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  transactionLeft: {
    flex: 1
  },
  transactionStudent: {
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '4px'
  },
  transactionClass: {
    fontSize: '12px',
    color: '#888'
  },
  transactionRight: {
    textAlign: 'right'
  },
  transactionAmount: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#00C9A7',
    marginBottom: '4px'
  },
  transactionDate: {
    fontSize: '11px',
    color: '#888'
  },
  noData: {
    color: '#888',
    textAlign: 'center',
    padding: '30px'
  },
  classGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px'
  },
  classCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '15px'
  },
  className: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '10px',
    color: '#00C9A7'
  },
  classProgress: {
    background: 'rgba(255,255,255,0.1)',
    height: '6px',
    borderRadius: '3px',
    marginBottom: '10px',
    overflow: 'hidden'
  },
  progressBarSmall: {
    height: '100%',
    background: 'linear-gradient(90deg, #00C9A7, #0097ff)',
    borderRadius: '3px',
    transition: 'width 0.5s ease'
  },
  classStats: {
    fontSize: '11px',
    color: '#888',
    display: 'flex',
    justifyContent: 'space-between'
  }
};

// Add animation style
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
