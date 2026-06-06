import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  ChevronDown, ChevronUp, Lock, User, RefreshCw, Check, LogOut, Eye, EyeOff 
} from 'lucide-react';
import { OrderStep1 } from './OrderStep1.jsx';

// ── LOCAL STORAGE HELPER ──
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); if (v == null) return d; const parsed = JSON.parse(v); return parsed != null ? parsed : d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

const getServerTime = async () => {
  try {
    const res = await fetch(window.location.href, { method: 'HEAD', cache: 'no-cache' });
    const dateHeader = res.headers.get('Date');
    if (dateHeader) return new Date(dateHeader);
  } catch (e) {
    console.warn("Failed to get server time from host HEAD, trying public API...", e);
  }
  try {
    const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Ho_Chi_Minh');
    const data = await res.json();
    if (data && data.datetime) return new Date(data.datetime);
  } catch (e) {
    console.warn("Failed to get server time from WorldTimeAPI, using local time...", e);
  }
  return new Date();
};

const recordLogin = async (name) => {
  try {
    const serverTime = await getServerTime();
    const formattedTime = serverTime.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const history = LS.get('lc_login_history', []);
    history.unshift({ name, time: formattedTime });
    LS.set('lc_login_history', history);
  } catch (e) {
    console.error("Failed to record login history", e);
  }
};

// ── ROLES DEFINITION ──
const ROLES = { 
  order: 'Nhân Viên Gọi Món',
  cashier: 'Thu Ngân Ca', 
  barista: 'Pha Chế Ca',
  manager: 'Quản Lý Quán',
  accountant: 'Kế Toán',
  director: 'Giám Đốc'
};

// ── STANDALONE POS LOGIN PAGE ──
const POSLoginPage = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canLogin = name.trim() && password;

  const handleLogin = () => {
    if (!canLogin) return;
    const accounts = LS.get('lc_staff_accounts', {});
    const customUser = accounts[name.trim()];
    const isMyQuyen = name.trim().toLowerCase() === 'mỹ quyên';
    const expectedPassword = customUser ? customUser.password : (isMyQuyen ? '12345678' : '123456');
    if (password !== expectedPassword) {
      setError(customUser ? 'Mật khẩu đăng nhập cho tài khoản của bạn không chính xác.' : (isMyQuyen ? 'Mật khẩu đăng nhập cho tài khoản Mỹ Quyên không chính xác.' : 'Mật khẩu đăng nhập dùng chung không chính xác.'));
      return;
    }
    setLoading(true);
    recordLogin(name.trim()).finally(() => {
      setTimeout(() => {
        onLogin({ name: name.trim(), role: 'order' });
        setLoading(false);
      }, 600);
    });
  };

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 800,
    color: '#6B7280',
    marginBottom: 6,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: "'Inter', sans-serif"
  };

  const handleBackToModules = () => {
    window.location.href = 'index.html';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F2F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .eye-toggle-btn {
          color: rgba(255, 255, 255, 0.7) !important;
          transition: color 0.15s ease;
        }
        .eye-toggle-btn:hover {
          color: #ffffff !important;
        }
        input:-webkit-autofill ~ .eye-toggle-btn {
          color: #000000 !important;
        }
        input:autofill ~ .eye-toggle-btn {
          color: #000000 !important;
        }
      ` }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 440 }}>
        {/* Eyebrow above card */}
        <div style={{
          fontSize: 11,
          letterSpacing: '0.15em',
          color: '#9CA3AF',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: 16,
          fontFamily: "'Inter', sans-serif"
        }}>
          POCS ORDER — LOGIN
        </div>

        <div className="fade" style={{
          background: '#FFFFFF',
          borderRadius: 24,
          padding: '36px 32px 32px',
          width: '100%',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
          border: '1px solid #E5E8EF',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Back to module selector */}
          <button onClick={handleBackToModules} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9CA3AF', fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 4,
            marginBottom: 20, padding: 0, transition: 'color 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#4b5563'}
            onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
          >
            ← Đổi module
          </button>

          {/* Module badge */}
          <div style={{ marginBottom: 20 }}>
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase', padding: '6px 14px', borderRadius: 20,
              background: '#ECFEFF',
              color: '#0E7490',
              border: '1px solid #A5F3FC',
              display: 'inline-block',
              fontFamily: "'Inter', sans-serif"
            }}>
              Pocs Order — Counter Ordering
            </span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {/* Porder Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 12 }}>
              {/* Icon 3 lines */}
              <div style={{
                width: 58, height: 58, borderRadius: 14,
                background: '#ECFEFF',
                border: '1.5px solid #A5F3FC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="28" height="3.5" rx="1.75" fill="#0E7490"/>
                  <rect x="0" y="9.25" width="28" height="3.5" rx="1.75" fill="#0E7490"/>
                  <rect x="0" y="18.5" width="28" height="3.5" rx="1.75" fill="#0E7490"/>
                </svg>
              </div>
              {/* Wordmark */}
              <div style={{ textAlign: 'left' }}>
                <div style={{ lineHeight: 1.1, marginBottom: 4 }}>
                  <span style={{ color: '#22D3EE', fontSize: 28, fontWeight: 900, letterSpacing: '-0.01em' }}>P</span>
                  <span style={{ color: '#0E7490', fontSize: 28, fontWeight: 900, letterSpacing: '-0.01em' }}>order</span>
                </div>
                <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.22em', color: '#0E7490', textTransform: 'uppercase', opacity: 0.7 }}>COUNTER ORDERING DEVICE</div>
              </div>
            </div>
            <p style={{ color: '#9CA3AF', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Hệ Thống Gọi Món &amp; Bán Hàng Tại Quầy</p>
          </div>

          {error && (
            <div style={{
              background: '#fff1f2',
              border: '1.5px solid #fca5a5',
              color: '#be123c',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: 11.5,
              fontWeight: 700,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>Lỗi:</span>
              <span>{error}</span>
            </div>
          )}


          {/* Name Input */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Họ và tên nhân viên trực quầy</label>
            <input 
              className="input-field" 
              value={name} 
              onChange={e => { setName(e.target.value); setError(''); }} 
              placeholder="Nhập tên thu ngân / người order..." 
              style={{ 
                width: '100%',
                padding: '12px 16px',
                background: '#2D2D2D',
                border: 'none',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none'
              }} 
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Mật khẩu đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                className="input-field mono" 
                value={password} 
                onChange={e => { setPassword(e.target.value); setError(''); }} 
                placeholder="••••••••" 
                style={{ 
                  width: '100%',
                  padding: '12px 44px 12px 16px',
                  background: '#2D2D2D',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none'
                }} 
              />
              <button 
                type="button"
                className="eye-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ fontSize: 10.5, color: '#9CA3AF', marginTop: 8, fontWeight: 500 }}>
              <span>Mật khẩu dùng chung: <strong className="mono" style={{ color: '#4B5563' }}>123456</strong></span>
            </div>
          </div>

          <button 
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '6px',
              border: 'none',
              background: '#0E7490',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.2s',
              marginTop: 8
            }}
            onClick={handleLogin}
            disabled={loading}
            onMouseEnter={e => e.currentTarget.style.background = '#0e7490'}
            onMouseLeave={e => e.currentTarget.style.background = '#0E7490'}
          >
            {loading ? 'Đang mở quầy...' : 'Bắt Đầu Bán Hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── STANDALONE POS APPLICATION ENTRY ──
const StandalonePOSApp = () => {
  const [user, setUser] = useState(() => LS.get('lc_user', null));

  const handleLogin = (u) => {
    LS.set('lc_user', u);
    setUser(u);
  };

  const handleSetPage = (pageName) => {
    // 'module' = user pressed "Quay Lại" → go back to module selector
    if (pageName === 'module' || pageName !== 'order') {
      window.location.href = 'index.html#module';
    }
  };

  if (!user) {
    return <POSLoginPage onLogin={handleLogin} />;
  }

  return <OrderStep1 user={user} setPage={handleSetPage} />;
};

ReactDOM.createRoot(document.getElementById('root')).render(<StandalonePOSApp />);
