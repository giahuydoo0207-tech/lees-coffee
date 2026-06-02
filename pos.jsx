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
  const canLogin = role && name.trim() && password;

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 20%, #0f172a 0%, #1e293b 90%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative'
    }}>
      {/* Visual background glowing orb */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '25%',
        width: '300px',
        height: '300px',
        background: 'rgba(30, 64, 175, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }}></div>

      <div className="fade" style={{
        background: 'rgba(255, 255, 255, 0.94)',
        borderRadius: '2px',
        padding: '24px 32px 32px',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img 
            src="https://theme.hstatic.net/200000885783/1001244158/14/logo.png?v=745"
            alt="Lee's Coffee"
            style={{ width: "80px", objectFit: "contain", margin: "0 auto 8px", display: "block", mixBlendMode: "multiply" }}
          />
          <h1 style={{ color: '#0f0f0e', fontSize: 20, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 4 }}>LEE'S COFFEE POS</h1>
          <p style={{ color: '#64748b', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Hệ Thống Gọi Món & Bán Hàng Tại Quầy</p>
        </div>

        {error && (
          <div style={{
            background: '#fff1f2',
            border: '1.5px solid #fca5a5',
            color: '#be123c',
            padding: '8px 12px',
            borderRadius: '2px',
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
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Họ và tên nhân viên trực quầy</label>
          <input 
            className="input-field" 
            value={name} 
            onChange={e => { setName(e.target.value); setError(''); }} 
            placeholder="Nhập tên thu ngân / người order..." 
            style={{ borderRadius: '2px', padding: '10px 14px' }} 
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Mật khẩu đăng nhập</label>
          <input 
            type="password"
            className="input-field mono" 
            value={password} 
            onChange={e => { setPassword(e.target.value); setError(''); }} 
            placeholder="••••••••" 
            style={{ borderRadius: '2px', padding: '10px 14px', background: '#fafafa' }} 
          />
        </div>

        <div ref={dropdownRef} style={{ position: 'relative', marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Vị trí trực POS</label>
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              outline: 'none',
            }}
          >
            {selectedRoleObj ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '2px',
                  background: '#eff6ff',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 10,
                  border: '1px solid #bfdbfe'
                }}>
                  {selectedRoleObj.icon}
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>{selectedRoleObj.label}</span>
              </div>
            ) : (
              <span style={{ color: '#9ca3af', fontSize: 12.5 }}>Chọn vị trí làm việc...</span>
            )}
            {isOpen ? <ChevronUp size={16} style={{ color: '#6b7280' }} /> : <ChevronDown size={16} style={{ color: '#6b7280' }} />}
          </button>

          {isOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1.5px solid #0f0f0e',
              borderRadius: '2px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 50,
              marginTop: 4,
              maxHeight: 180,
              overflowY: 'auto',
              padding: '4px 0'
            }}>
              {roles.map(r => (
                <div 
                  key={r.key} 
                  onMouseDown={() => { setRole(r.key); setIsOpen(false); setError(''); }}
                  style={{
                    padding: '0 14px',
                    height: 44,
                    minHeight: 44,
                    cursor: 'pointer',
                    background: role === r.key ? '#f8fafc' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '2px',
                    background: role === r.key ? '#1e40af' : '#fafafa',
                    color: role === r.key ? 'white' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 10.5,
                    border: '1px solid #cbd5e1',
                    flexShrink: 0
                  }}>
                    {r.icon}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 12.5, color: '#1f2937' }}>{r.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          className="btn btn-blue" 
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '2px',
            border: 'none',
            background: '#1e40af',
            color: 'white',
            fontSize: '13px',
            fontWeight: 800,
            cursor: loading ? 'wait' : 'pointer',
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Đang mở quầy...' : 'Bắt Đầu Bán Hàng'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 10.5, color: '#6b7280', fontWeight: 500 }}>Mật khẩu dùng chung: <strong className="mono">123456</strong></span>
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
