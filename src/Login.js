import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1); // 1=phone, 2=pin
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.length === 10 && phone.startsWith('0')) {
      setStep(2);
      setError('');
    } else {
      setError('Tafadhali weka namba sahihi (07XXXXXXXX)');
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN lazima iwe na tarakimu 4');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://your-backend-url.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Call parent component's onLogin
      onLogin(data.user, data.dashboard);
      
      // Redirect based on role
      if (data.user.role === 'principal') {
        navigate('/dashboard');
      } else if (data.user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/parent');
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setPin('');
    setError('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🏫</div>
          <h1 style={styles.title}>Felix Mrema</h1>
          <p style={styles.subtitle}>Secondary School</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handlePhoneSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Namba ya Simu / Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                style={styles.input}
                maxLength="10"
                autoFocus
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" style={styles.button}>
              Endelea → Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handlePinSubmit}>
            <div style={styles.backButton} onClick={handleBack}>
              ← Badilisha namba / Change number
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Weka PIN yako / Enter PIN</label>
              <div style={styles.pinContainer}>
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="password"
                    maxLength="1"
                    value={pin[i] || ''}
                    onChange={(e) => {
                      const newPin = pin.split('');
                      newPin[i] = e.target.value.replace(/[^0-9]/g, '');
                      setPin(newPin.join(''));
                      
                      // Auto-focus next input
                      if (e.target.value && i < 3) {
                        document.getElementById(`pin-${i + 1}`).focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !pin[i] && i > 0) {
                        document.getElementById(`pin-${i - 1}`).focus();
                      }
                    }}
                    id={`pin-${i}`}
                    style={styles.pinInput}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button 
              type="submit" 
              style={styles.button}
              disabled={loading || pin.length !== 4}
            >
              {loading ? 'Inaingia...' : 'Ingia → Login'}
            </button>

            <div style={styles.forgotPin}>
              Umesahau PIN? / Forgot PIN? <span style={styles.contactLink}>Wasiliana na Mwalimu / Contact Teacher</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#080f17',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'DM Sans', sans-serif"
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '24px',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
    backdropFilter: 'blur(10px)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logo: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  title: {
    color: '#fff',
    fontFamily: "'Syne', sans-serif",
    fontSize: '22px',
    fontWeight: 800,
    margin: 0
  },
  subtitle: {
    color: '#00C9A7',
    fontSize: '12px',
    margin: '4px 0 0'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    color: '#888',
    fontSize: '12px',
    marginBottom: '8px',
    fontWeight: 600
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#fff',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  pinContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'space-between'
  },
  pinInput: {
    width: '60px',
    height: '60px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    background: 'linear-gradient(135deg,#00C9A7,#0097ff)',
    border: 'none',
    borderRadius: '14px',
    padding: '16px',
    color: '#fff',
    fontWeight: 800,
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px',
    fontFamily: "'Syne', sans-serif"
  },
  error: {
    color: '#FF6B6B',
    fontSize: '13px',
    marginTop: '8px',
    textAlign: 'center'
  },
  backButton: {
    color: '#00C9A7',
    fontSize: '13px',
    marginBottom: '20px',
    cursor: 'pointer',
    display: 'inline-block'
  },
  forgotPin: {
    color: '#888',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '20px'
  },
  contactLink: {
    color: '#0097ff',
    cursor: 'pointer'
  }
};
