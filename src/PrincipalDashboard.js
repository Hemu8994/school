import React, { useEffect, useState } from 'react';

export default function PrincipalDashboard({ user, onLogout }) {
  const [lang, setLang] = useState('sw'); // 'sw' or 'en'
  const [stats, setStats] = useState({
    walimu: 2,
    wanafunzi: 1,
    masomo: 10,
    madarasa: 13,
    wafanyakazi: 0,
    departments: 0,
    total_collections: 0
  });
  const [recentActivities, setRecentActivities] = useState([
    { action: 'Assigned subject to stream', details: 'English to stream ID 15 with teacher ID 33', created_at: '2026-03-15' },
    { action: 'Edited stream', details: 'STD 3A for class ID 7', created_at: '2026-03-15' },
    { action: 'Assigned subject to stream', details: 'Mathematics to stream ID 15 with teacher ID 34', created_at: '2026-03-15' },
    { action: 'Assigned subject to stream', details: 'Mathematics to stream ID 14 with teacher ID 34', created_at: '2026-03-15' },
    { action: 'Ongeza Mwalimu', details: 'Ameongeza: Teacher Mamadavuu', created_at: '2026-03-15' }
  ]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  // Language translations
  const t = {
    en: {
      dashboard: 'Admin Dashboard',
      school: 'School',
      teachers: 'Teachers',
      students: 'Students',
      subjects: 'Subjects',
      classes: 'Classes',
      timetable: 'Timetable',
      departments: 'Departments',
      contributions: 'Contributions',
      work_plans: 'Work Plans',
      logout: 'Logout',
      profile: 'Profile',
      quick_actions: 'Quick Actions',
      recent_activities: 'Recent Activities',
      todays_timetable: "Today's Timetable",
      view_list: 'View List',
      view_timetable: 'View Timetable',
      view_departments: 'View Departments',
      view_contributions: 'View Contributions',
      add_teacher: 'Add Teacher',
      add_student: 'Add Student',
      add_subject: 'Add Subject',
      add_class: 'Add Class',
      create_timetable: 'Create Timetable',
      add_department: 'Add Department',
      record_payment: 'Record Payment',
      no_activities: 'No recent activities',
      no_timetable: 'No timetable for today. Please check the general schedule.',
      time: 'Time',
      class: 'Class',
      subject: 'Subject',
      teacher: 'Teacher',
      stream: 'Stream',
      break: 'Break'
    },
    sw: {
      dashboard: 'Dashibodi ya Mkuu',
      school: 'Shule',
      teachers: 'Walimu',
      students: 'Wanafunzi',
      subjects: 'Masomo',
      classes: 'Madarasa',
      timetable: 'Ratiba',
      departments: 'Idara',
      contributions: 'Michango',
      work_plans: 'Mipango ya Kazi',
      logout: 'Toka',
      profile: 'Wasifu',
      quick_actions: 'Vitendo Haraka',
      recent_activities: 'Shughuli Za Hivi Karibuni',
      todays_timetable: 'Ratiba ya Leo',
      view_list: 'Angalia orodha',
      view_timetable: 'Angalia ratiba',
      view_departments: 'Angalia idara',
      view_contributions: 'Angalia michango',
      add_teacher: 'Ongeza Mwalimu',
      add_student: 'Ongeza Mwanafunzi',
      add_subject: 'Ongeza Somo',
      add_class: 'Ongeza Darasa',
      create_timetable: 'Unda Ratiba',
      add_department: 'Ongeza Idara',
      record_payment: 'Rekodi Malipo',
      no_activities: 'Hakuna shughuli za hivi karibuni',
      no_timetable: 'Hakuna ratiba ya leo. Tafadhali angalia ratiba ya jumla.',
      time: 'Saa',
      class: 'Darasa',
      subject: 'Somo',
      teacher: 'Mwalimu',
      stream: 'Daraja',
      break: 'Pumziko'
    }
  };

  const currentLang = t[lang];

  // Get current date
  const today = new Date();
  const formattedDate = today.toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  // Subject colors for timetable
  const subjectColors = [
    '#FFCCCB', '#FFE4B5', '#FFFACD', '#E6E6FA', '#B0E0E6',
    '#98FB98', '#F0E68C', '#FFD700', '#FFA07A', '#87CEFA',
    '#20B2AA', '#FFB6C1', '#00FA9A', '#DDA0DD', '#F0FFF0',
    '#F5DEB3', '#FDF5E6', '#FFEFD5', '#FFF0F5', '#E0FFFF'
  ];

  const subjects = [
    { id: 1, name: 'Mathematics', code: 'MATH', color: subjectColors[0] },
    { id: 2, name: 'English', code: 'ENG', color: subjectColors[1] },
    { id: 3, name: 'Kiswahili', code: 'KISW', color: subjectColors[2] },
    { id: 4, name: 'Science', code: 'SCI', color: subjectColors[3] },
    { id: 5, name: 'Social Studies', code: 'SST', color: subjectColors[4] },
    { id: 6, name: 'Religious Education', code: 'RE', color: subjectColors[5] },
    { id: 7, name: 'Civics', code: 'CIV', color: subjectColors[6] },
    { id: 8, name: 'History', code: 'HIS', color: subjectColors[7] },
    { id: 9, name: 'Geography', code: 'GEO', color: subjectColors[8] },
    { id: 10, name: 'Biology', code: 'BIO', color: subjectColors[9] }
  ];

  const classes = [
    { id: 1, name: 'Form 1A' },
    { id: 2, name: 'Form 1B' },
    { id: 3, name: 'Form 2A' },
    { id: 4, name: 'Form 2B' },
    { id: 5, name: 'Form 3A' },
    { id: 6, name: 'Form 3B' },
    { id: 7, name: 'Form 4A' },
    { id: 8, name: 'Form 4B' },
    { id: 9, name: 'Form 5A' },
    { id: 10, name: 'Form 5B' },
    { id: 11, name: 'Form 6A' },
    { id: 12, name: 'Form 6B' },
    { id: 13, name: 'Form 7A' }
  ];

  // Mock timetable data
  const periods = [
    { id: 1, start: '07:30', end: '08:15', isBreak: false },
    { id: 2, start: '08:15', end: '09:00', isBreak: false },
    { id: 3, start: '09:00', end: '09:45', isBreak: false },
    { id: 4, start: '09:45', end: '10:00', isBreak: true, breakName: 'Morning Break' },
    { id: 5, start: '10:00', end: '10:45', isBreak: false },
    { id: 6, start: '10:45', end: '11:30', isBreak: false },
    { id: 7, start: '11:30', end: '12:15', isBreak: false },
    { id: 8, start: '12:15', end: '13:00', isBreak: true, breakName: 'Lunch' },
    { id: 9, start: '13:00', end: '13:45', isBreak: false },
    { id: 10, start: '13:45', end: '14:30', isBreak: false },
    { id: 11, start: '14:30', end: '15:15', isBreak: false },
    { id: 12, start: '15:15', end: '15:30', isBreak: true, breakName: 'Afternoon Break' },
    { id: 13, start: '15:30', end: '16:15', isBreak: false }
  ];

  // Mock timetable entries
  const timetableEntries = [
    { periodId: 1, classId: 1, streamId: null, subjectId: 1, teacher: 'John Doe' },
    { periodId: 1, classId: 3, streamId: null, subjectId: 2, teacher: 'Jane Smith' },
    { periodId: 2, classId: 1, streamId: null, subjectId: 3, teacher: 'John Doe' },
    { periodId: 2, classId: 5, streamId: null, subjectId: 4, teacher: 'Alice Brown' },
    { periodId: 3, classId: 2, streamId: null, subjectId: 5, teacher: 'Bob Wilson' }
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>⏳</div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Admin Setup Instructions */}
      <div style={styles.alertCard}>
        <h5 style={styles.alertTitle}>⚙️ Admin Setup Instructions / Maelekezo kwa Msimamizi</h5>
        
        <p><strong>🇬🇧 English:</strong><br />
          To ensure the system works perfectly, please follow these steps in order:
          <ol style={{ marginTop: '10px', marginBottom: '15px' }}>
            <li>First, add <strong>Classrooms (Streams)</strong> to your classes</li>
            <li>Then, assign <strong>Subjects</strong> to each class and link them to the respective teachers</li>
            <li>After that, you can create the <strong>Timetable</strong></li>
            <li>Finally, enter <strong>Students</strong> along with their <strong>Parents</strong></li>
          </ol>
        </p>

        <p><strong>🇹🇿 Swahili:</strong><br />
          Ili kuhakikisha mfumo unafanya kazi vizuri, tafadhali fuata hatua hizi kwa mpangilio:
          <ol style={{ marginTop: '10px', marginBottom: '5px' }}>
            <li>Kwanza, ongeza <strong>Vyumba vya Darasa (Mikondo)</strong> kwenye madarasa</li>
            <li>Halafu, weka <strong>Masomo</strong> kwenye kila darasa na waunganishe na <strong>Walimu</strong> husika</li>
            <li>Baada ya hapo, unaweza kuunda <strong>Ratiba ya Masomo</strong></li>
            <li>Mwisho, ingiza <strong>Wanafunzi</strong> pamoja na <strong>Wazazi</strong> wao</li>
          </ol>
        </p>
      </div>

      {/* Top Navigation */}
      <div style={styles.topNav}>
        <h4 style={styles.pageTitle}>{currentLang.dashboard}</h4>
        <div style={styles.navRight}>
          <div style={styles.languageSwitcher}>
            <button 
              onClick={() => setLang('sw')} 
              style={{...styles.langBtn, ...(lang === 'sw' ? styles.langBtnActive : {})}}
            >
              SW
            </button>
            <button 
              onClick={() => setLang('en')} 
              style={{...styles.langBtn, ...(lang === 'en' ? styles.langBtnActive : {})}}
            >
              EN
            </button>
          </div>
          <div style={styles.userDropdown}>
            <i className="bi bi-person-circle" style={styles.userIcon}></i>
            <span style={styles.userName}>{user?.name || 'Admin'}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        {/* Teachers */}
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
          <div style={styles.statContent}>
            <h5 style={styles.statTitle}>{currentLang.teachers}</h5>
            <h2 style={styles.statValue}>{stats.walimu}</h2>
          </div>
          <i className="bi bi-person-video3" style={styles.statIcon}></i>
          <a href="#" style={styles.statLink}>{currentLang.view_list} →</a>
        </div>

        {/* Students */}
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #6b8cff 0%, #8e2de2 100%)'}}>
          <div style={styles.statContent}>
            <h5 style={styles.statTitle}>{currentLang.students}</h5>
            <h2 style={styles.statValue}>{stats.wanafunzi}</h2>
          </div>
          <i className="bi bi-mortarboard" style={styles.statIcon}></i>
          <a href="#" style={styles.statLink}>{currentLang.view_list} →</a>
        </div>

        {/* Subjects */}
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #3b8dff 0%, #2b6cbe 100%)'}}>
          <div style={styles.statContent}>
            <h5 style={styles.statTitle}>{currentLang.subjects}</h5>
            <h2 style={styles.statValue}>{stats.masomo}</h2>
          </div>
          <i className="bi bi-book" style={styles.statIcon}></i>
          <a href="#" style={styles.statLink}>{currentLang.view_list} →</a>
        </div>

        {/* Classes */}
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
          <div style={styles.statContent}>
            <h5 style={styles.statTitle}>{currentLang.classes}</h5>
            <h2 style={styles.statValue}>{stats.madarasa}</h2>
          </div>
          <i className="bi bi-layers" style={styles.statIcon}></i>
          <a href="#" style={styles.statLink}>{currentLang.view_list} →</a>
        </div>

        {/* Staff */}
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
          <div style={styles.statContent}>
            <h5 style={styles.statTitle}>Wafanyakazi</h5>
            <h2 style={styles.statValue}>{stats.wafanyakazi}</h2>
          </div>
          <i className="bi bi-person-lines-fill" style={styles.statIcon}></i>
          <a href="#" style={styles.statLink}>{currentLang.view_list} →</a>
        </div>

        {/* Timetable */}
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)'}}>
          <div style={styles.statContent}>
            <h5 style={styles.statTitle}>{currentLang.timetable}</h5>
            <h2 style={styles.statValue}>{formattedDate}</h2>
          </div>
          <i className="bi bi-calendar-week" style={styles.statIcon}></i>
          <a href="#" style={styles.statLink}>{currentLang.view_timetable} →</a>
        </div>

        {/* Departments */}
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'}}>
          <div style={styles.statContent}>
            <h5 style={styles.statTitle}>{currentLang.departments}</h5>
            <h2 style={styles.statValue}>{stats.departments}</h2>
          </div>
          <i className="bi bi-building" style={styles.statIcon}></i>
          <a href="#" style={styles.statLink}>{currentLang.view_departments} →</a>
        </div>

        {/* Contributions */}
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
          <div style={styles.statContent}>
            <h5 style={styles.statTitle}>{currentLang.contributions}</h5>
            <h2 style={styles.statValue}>{stats.total_collections.toLocaleString()} TZS</h2>
          </div>
          <i className="bi bi-cash-stack" style={styles.statIcon}></i>
          <a href="#" style={styles.statLink}>{currentLang.view_contributions} →</a>
        </div>
      </div>

      {/* Quick Actions and Recent Activities */}
      <div style={styles.twoColumnGrid}>
        {/* Quick Actions */}
        <div style={styles.card}>
          <div style={{...styles.cardHeader, background: '#667eea'}}>
            <h5 style={styles.cardTitle}>
              <i className="bi bi-lightning" style={styles.cardIcon}></i> 
              {currentLang.quick_actions}
            </h5>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.actionGrid}>
              <a href="#" style={styles.actionBtn}>➕ {currentLang.add_teacher}</a>
              <a href="#" style={styles.actionBtn}>➕ {currentLang.add_student}</a>
              <a href="#" style={styles.actionBtn}>➕ {currentLang.add_subject}</a>
              <a href="#" style={styles.actionBtn}>➕ {currentLang.add_class}</a>
              <a href="#" style={styles.actionBtn}>📅 {currentLang.create_timetable}</a>
              <a href="#" style={styles.actionBtn}>🏢 {currentLang.add_department}</a>
              <a href="#" style={styles.actionBtn}>📋 Mipango ya Kazi</a>
              <a href="#" style={styles.actionBtn}>💰 {currentLang.record_payment}</a>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div style={styles.card}>
          <div style={{...styles.cardHeader, background: '#6b8cff'}}>
            <h5 style={styles.cardTitle}>
              <i className="bi bi-clock-history" style={styles.cardIcon}></i> 
              {currentLang.recent_activities}
            </h5>
          </div>
          <div style={styles.cardBody}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} style={styles.activityItem}>
                  <div style={styles.activityContent}>
                    <i className="bi bi-activity" style={styles.activityIcon}></i>
                    <div>
                      <div style={styles.activityAction}>{activity.action}</div>
                      <div style={styles.activityDetails}>{activity.details}</div>
                    </div>
                  </div>
                  <span style={styles.activityDate}>
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p style={styles.noData}>{currentLang.no_activities}</p>
            )}
          </div>
        </div>
      </div>

      {/* Today's Timetable */}
      <div style={styles.card}>
        <div style={{...styles.cardHeader, background: '#3b8dff'}}>
          <h5 style={styles.cardTitle}>
            <i className="bi bi-calendar-day" style={styles.cardIcon}></i> 
            {currentLang.todays_timetable} ({formattedDate})
          </h5>
        </div>
        <div style={styles.cardBody}>
          {/* Subject Legend */}
          <div style={styles.legend}>
            {subjects.map(subject => (
              <div key={subject.id} style={styles.legendItem}>
                <span style={{...styles.legendColor, backgroundColor: subject.color}}></span>
                {subject.name} ({subject.code})
              </div>
            ))}
            <div style={styles.legendItem}>
              <span style={{...styles.legendColor, backgroundColor: '#d4edda'}}></span>
              {currentLang.break}
            </div>
          </div>

          {/* Timetable Table */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>{currentLang.time}</th>
                  <th style={styles.tableHeader}>{currentLang.class}</th>
                  <th style={styles.tableHeader}>{currentLang.stream}</th>
                  <th style={styles.tableHeader}>{currentLang.subject}</th>
                  <th style={styles.tableHeader}>{currentLang.teacher}</th>
                </tr>
              </thead>
              <tbody>
                {periods.map(period => {
                  if (period.isBreak) {
                    return (
                      <tr key={period.id} style={{ backgroundColor: '#d4edda' }}>
                        <td style={styles.tableCell}>{period.start} - {period.end}</td>
                        <td style={styles.tableCell}>-</td>
                        <td style={styles.tableCell}>-</td>
                        <td style={styles.tableCell}>{currentLang.break} {period.breakName ? `(${period.breakName})` : ''}</td>
                        <td style={styles.tableCell}>-</td>
                      </tr>
                    );
                  }

                  return classes.map(classItem => {
                    const entry = timetableEntries.find(e => 
                      e.periodId === period.id && e.classId === classItem.id
                    );
                    const subject = entry ? subjects.find(s => s.id === entry.subjectId) : null;

                    return (
                      <tr key={`${period.id}-${classItem.id}`} style={{ backgroundColor: subject?.color || '#f8f9fa' }}>
                        <td style={styles.tableCell}>{period.start} - {period.end}</td>
                        <td style={styles.tableCell}>{classItem.name}</td>
                        <td style={styles.tableCell}>-</td>
                        <td style={styles.tableCell}>{entry ? subject?.name : '-'}</td>
                        <td style={styles.tableCell}>{entry?.teacher || '-'}</td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f4f6f9',
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
  alertCard: {
    background: '#e7f3ff',
    border: '1px solid #b8daff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    color: '#004085'
  },
  alertTitle: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    fontWeight: 600
  },
  topNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '15px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  pageTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  languageSwitcher: {
    display: 'flex',
    gap: '5px'
  },
  langBtn: {
    padding: '5px 10px',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '4px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '14px'
  },
  langBtnActive: {
    background: '#667eea',
    color: 'white',
    border: 'none'
  },
  userDropdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  userIcon: {
    fontSize: '24px',
    color: '#666'
  },
  userName: {
    fontSize: '14px',
    fontWeight: 500
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  statCard: {
    borderRadius: '12px',
    padding: '20px',
    color: 'white',
    position: 'relative',
    minHeight: '150px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  },
  statContent: {
    position: 'relative',
    zIndex: 1
  },
  statTitle: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    fontWeight: 500,
    opacity: 0.9
  },
  statValue: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700
  },
  statIcon: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '48px',
    opacity: 0.3
  },
  statLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '13px',
    opacity: 0.9,
    marginTop: '15px',
    display: 'block'
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '15px 20px',
    color: 'white'
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600
  },
  cardIcon: {
    marginRight: '8px'
  },
  cardBody: {
    padding: '20px'
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },
  actionBtn: {
    display: 'block',
    padding: '12px',
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    color: '#495057',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.3s',
    textAlign: 'center'
  },
  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #eee'
  },
  activityContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  activityIcon: {
    color: '#667eea'
  },
  activityAction: {
    fontSize: '14px',
    fontWeight: 500
  },
  activityDetails: {
    fontSize: '12px',
    color: '#6c757d'
  },
  activityDate: {
    fontSize: '12px',
    color: '#6c757d'
  },
  noData: {
    color: '#6c757d',
    textAlign: 'center',
    margin: '20px 0'
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '20px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px'
  },
  legendColor: {
    width: '15px',
    height: '15px',
    borderRadius: '3px'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },
  tableHeader: {
    background: '#667eea',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 500
  },
  tableCell: {
    padding: '10px 12px',
    borderBottom: '1px solid #dee2e6'
  }
};

// Add animation style
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }
  .action-btn:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;
document.head.appendChild(style);
