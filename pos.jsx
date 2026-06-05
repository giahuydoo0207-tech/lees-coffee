import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  ChevronDown, ChevronUp, Lock, User, RefreshCw, Check, LogOut 
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
  const [role, setRole] = useState('order'); // Default to POS role
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const roles = [
    { key: 'order', icon: 'OD', label: 'Nhân Viên Gọi Món', desc: 'Quầy gọi món & tính tiền POS' },
    { key: 'cashier', icon: 'TN', label: 'Thu Ngân Ca', desc: 'Kết ca doanh thu & bàn giao két' },
    { key: 'barista', icon: 'PC', label: 'Pha Chế Ca', desc: 'Kiểm kê và bàn giao nguyên liệu' },
    { key: 'manager', icon: 'QL', label: 'Quản Lý Quán', desc: 'Giám sát hoạt động & kê khai ngày' }
  ];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedRoleObj = roles.find(r => r.key === role);
  const canLogin = name.trim() && password;

  const handleLogin = () => {
    if (!canLogin) return;
    const isMyQuyen = name.trim().toLowerCase() === 'mỹ quyên';
    const expectedPassword = isMyQuyen ? '12345678' : '123456';
    if (password !== expectedPassword) {
      setError(isMyQuyen ? 'Mật khẩu đăng nhập cho tài khoản Mỹ Quyên không chính xác.' : 'Mật khẩu đăng nhập dùng chung không chính xác.');
      return;
    }
    setLoading(true);
    recordLogin(name.trim()).finally(() => {
      setTimeout(() => {
        onLogin({ name: name.trim(), role });
        setLoading(false);
      }, 600);
    });
  };

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#6B7280',
    marginBottom: 6,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: "'DM Sans', 'Inter', sans-serif"
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 440 }}>
        {/* Eyebrow above card */}
        <div style={{
          fontSize: 11,
          letterSpacing: '0.15em',
          color: '#9CA3AF',
          fontWeight: 600,
          textTransform: 'uppercase',
          marginBottom: 16,
          fontFamily: "'DM Sans', 'Inter', sans-serif"
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
              fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
              textTransform: 'uppercase', padding: '6px 14px', borderRadius: 20,
              background: '#ECFEFF',
              color: '#0E7490',
              border: '1px solid #A5F3FC',
              display: 'inline-block',
              fontFamily: "'DM Sans', sans-serif"
            }}>
              Pocs Order — Table Ordering
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
                <div style={{ lineHeight: 1.1, marginBottom: 3 }}>
                  <span style={{ color: '#0E7490', fontSize: 26, fontWeight: 900, letterSpacing: '-0.01em' }}>P</span>
                  <span style={{ color: '#0E7490', fontSize: 26, fontWeight: 300, letterSpacing: '-0.01em' }}>order</span>
                </div>
                <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.22em', color: '#0E7490', textTransform: 'uppercase', opacity: 0.7 }}>TABLE ORDERING DEVICE</div>
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

          {/* Vị trí trực - dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative', marginBottom: 18 }}>
            <label style={labelStyle}>Vị trí trực POS</label>
            <button 
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#2D2D2D',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '13px'
              }}
            >
              {selectedRoleObj ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '4px',
                    background: 'rgba(10,126,164,0.2)',
                    color: '#0A7EA4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 10,
                    border: '1px solid rgba(10,126,164,0.3)'
                  }}>
                    {selectedRoleObj.icon}
                  </div>
                  <span style={{ fontWeight: 700 }}>{selectedRoleObj.label}</span>
                </div>
              ) : (
                <span style={{ color: '#9CA3AF' }}>Chọn vị trí làm việc...</span>
              )}
              {isOpen ? <ChevronUp size={16} style={{ color: '#9CA3AF' }} /> : <ChevronDown size={16} style={{ color: '#9CA3AF' }} />}
            </button>

            {isOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: '#2D2D2D',
                border: '1px solid #1A1A1A',
                borderRadius: '6px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                zIndex: 50, marginTop: 6,
                maxHeight: 180, overflowY: 'auto',
                padding: '6px 0'
              }}>
                {roles.map(r => (
                  <div 
                    key={r.key} 
                    onMouseDown={() => { setRole(r.key); setIsOpen(false); setError(''); }}
                    style={{
                      padding: '0 16px', height: 40, minHeight: 40,
                      cursor: 'pointer',
                      background: role === r.key ? 'rgba(255,255,255,0.06)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 12,
                      transition: 'background 0.1s'
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '4px',
                      background: role === r.key ? 'rgba(10,126,164,0.35)' : 'rgba(255,255,255,0.1)',
                      color: role === r.key ? '#0A7EA4' : '#9CA3AF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 10,
                      border: '1px solid rgba(255,255,255,0.05)',
                      flexShrink: 0
                    }}>
                      {r.icon}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: role === r.key ? '#0A7EA4' : '#FFFFFF' }}>{r.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

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
            <input 
              type="password"
              className="input-field mono" 
              value={password} 
              onChange={e => { setPassword(e.target.value); setError(''); }} 
              placeholder="••••••••" 
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
    // If the POS app ever tries to go back to dashboard, we can redirect them to the financial index page!
    if (pageName !== 'order') {
      window.location.href = 'index.html'; // Go back to financial portal!
    }
  };

  if (!user) {
    return <POSLoginPage onLogin={handleLogin} />;
  }

  return <OrderStep1 user={user} setPage={handleSetPage} />;
};

ReactDOM.createRoot(document.getElementById('root')).render(<StandalonePOSApp />);
