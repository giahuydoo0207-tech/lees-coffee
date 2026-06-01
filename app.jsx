import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, FileText, CheckCircle, PieChart as PieChartIcon, 
  Bell, Clock, History, FilePlus, ArrowRight, User, LogOut, 
  ChevronRight, ChevronLeft, Trash2, Plus, Download, Printer, RefreshCw,
  Scale, Package, Receipt, Coins, Landmark, Percent,
  CalendarDays, Users, BarChart2, UtensilsCrossed,
  ChevronDown, ChevronUp, Eye, EyeOff, Lock
} from 'lucide-react';

import {
  AccReconcile, AccInventory, AccInvoices, AccDebts, AccCashbook, AccTax,
  makeInventorySeed, makeInventoryLogsSeed, makeInvoiceSeed, makeDebtSeed, makeCashbookSeed, makeShiftsSeed
} from './accountant.jsx';

import {
  StaffSchedule,
  makeScheduleSeed, makeIncidentsSeed
} from './staff.jsx';

import {
  MgrPerformance, MgrMenu, MgrInventoryAlert, MgrShiftSchedule, MgrStaffList, makeCatalogSeed
} from './manager.jsx';

// ── CONSTANTS & HELPERS ──
const ROLES = { director: 'Giám Đốc', accountant: 'Kế Toán', manager: 'Quản Lý Quán', staff: 'Nhân Viên', cashier: 'Thu Ngân Ca', barista: 'Pha Chế Ca' };
const DEFAULT_SHIFT_STAFF = ['Kiều Nhi', 'Thảo Tiên', 'Ngọc Hân', 'Hồng Nghi', 'Xuân Ny', 'Minh Lạc', 'Trang', 'Quốc Duy', 'Zora', 'Gia Phú', 'Kim Ngân', 'Duy Bảo'];
const EXCLUDED_SHIFT_STAFF = ['Thanh Vân', 'Jamin'];
const fmt = n => new Intl.NumberFormat('vi-VN').format(n || 0) + ' ₫';
const fmtK = n => { if (!n) return '0'; if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'; if (n >= 1e3) return Math.round(n / 1e3) + 'K'; return '' + n; };
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fmtDate = d => { if (!d) return ''; const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
const genId = () => Math.random().toString(36).slice(2, 9);
const calcR = r => {
  const rev = (r.cashRevenue || 0) + (r.transferRevenue || 0) + (r.cardRevenue || 0) + (r.grabRevenue || 0) + (r.shopeeRevenue || 0);
  const exp = (r.goodsCost || 0) + (r.fixedExpenses || []).reduce((s, e) => s + (e.amount || 0), 0) + (r.otherExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  return { rev, exp, profit: rev - exp };
};

// ── LOCAL STORAGE ──
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v != null ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ── SEED DATA ──
const makeSeed = () => {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    if (ds === '2026-05-21') {
      return {
        id: genId(), date: '2026-05-21', createdBy: 'Lê Văn Cường', createdByRole: 'manager',
        cashRevenue: 1978500, transferRevenue: 3651800, cardRevenue: 1658000, grabRevenue: 1133000, shopeeRevenue: 0,
        goodsCost: 2100000,
        fixedExpenses: [
          { id: 'f1', category: 'Lương nhân viên', amount: 450000 },
          { id: 'f2', category: 'Điện nước', amount: 180000 },
          { id: 'f3', category: 'Thuê mặt bằng', amount: 500000 },
        ],
        otherExpenses: [],
        note: 'Báo cáo doanh thu ngày 21/05/2026 tổng hợp từ ca thu ngân.',
        status: 'approved', submittedAt: '2026-05-21T22:00:00',
        reviewedBy: 'Trần Thị Bình', reviewedAt: '2026-05-21T22:15:00'
      };
    }

    const cash = 500000 + Math.floor(Math.random() * 4000000);
    const tf   = 100000 + Math.floor(Math.random() * 3000000);
    const card = 100000 + Math.floor(Math.random() * 1500000);
    const grab = Math.floor(Math.random() * 1200000);
    const shopee = Math.floor(Math.random() * 600000);
    const st = i > 2 ? 'approved' : i === 2 ? 'rejected' : 'pending';
    return {
      id: genId(), date: ds, createdBy: 'Lê Văn Cường', createdByRole: 'manager',
      cashRevenue: cash, transferRevenue: tf, cardRevenue: card, grabRevenue: grab, shopeeRevenue: shopee,
      goodsCost: Math.floor((cash + tf + card + grab + shopee) * 0.25),
      fixedExpenses: [
        { id: 'f1', category: 'Lương nhân viên', amount: 450000 },
        { id: 'f2', category: 'Điện nước', amount: i % 3 === 0 ? 350000 : 180000 },
        { id: 'f3', category: 'Thuê mặt bằng', amount: 500000 },
      ],
      otherExpenses: i % 3 === 0 ? [{ id: 'o1', category: 'Sửa chữa thiết bị', amount: 200000 }] : [],
      note: i % 4 === 0 ? 'Thời tiết đẹp, khách đông, doanh thu tăng trưởng tốt' : '',
      status: st, submittedAt: ds + 'T18:00:00',
      reviewedBy: st !== 'pending' ? 'Trần Thị Bình' : null,
      reviewedAt: st !== 'pending' ? ds + 'T20:00:00' : null,
    };
  });
};

const initData = () => {
  if (!localStorage.getItem('lc_seeded_v5')) {
    const reps = makeSeed();
    LS.set('lc_reports', reps);
    const rejected = reps.find(r => r.status === 'rejected');
    LS.set('lc_comments', rejected ? [{ id: genId(), reportId: rejected.id, content: 'Chi phí điện nước cao hơn bình thường. Vui lòng kiểm tra lại hoá đơn và cập nhật số liệu chính xác.', createdBy: 'Trần Thị Bình', createdAt: '2026-05-11T09:30:00' }] : []);
    
    // Seed Accountant Portal tables
    LS.set('lc_inventory', makeInventorySeed());
    LS.set('lc_inventory_logs', makeInventoryLogsSeed());
    LS.set('lc_invoices', makeInvoiceSeed());
    LS.set('lc_debts', makeDebtSeed());
    LS.set('lc_cashbook', makeCashbookSeed());
    
    const shifts = makeShiftsSeed(reps).filter(s => s.date !== '2026-05-21');
    shifts.unshift({
      id: genId(),
      date: '2026-05-21',
      shift: 'morning',
      staffName: 'Nguyễn Văn Nam',
      roleType: 'cashier',
      cashRevenue: 978500,
      transferRevenue: 1651800,
      cardRevenue: 858000,
      grabRevenue: 633000,
      shopeeRevenue: 0,
      totalRevenue: 978500 + 1651800 + 858000 + 633000,
      orders: 98,
      staffCount: 2,
      note: 'Ca sáng đông khách, bàn giao dòng tiền khớp.',
      submittedAt: '2026-05-21T12:05:00'
    });
    shifts.unshift({
      id: genId(),
      date: '2026-05-21',
      shift: 'afternoon',
      staffName: 'Trần Minh Tâm',
      roleType: 'cashier',
      cashRevenue: 1000000,
      transferRevenue: 2000000,
      cardRevenue: 800000,
      grabRevenue: 500000,
      shopeeRevenue: 0,
      totalRevenue: 1000000 + 2000000 + 800000 + 500000,
      orders: 102,
      staffCount: 2,
      note: 'Ca chiều hoạt động tốt, đã thực hiện kết ca tổng hợp.',
      submittedAt: '2026-05-21T22:00:00'
    });
    LS.set('lc_shifts', shifts);
    
    LS.set('lc_recon_logs', []);
    // Seed Staff Portal tables
    LS.set('lc_schedule', makeScheduleSeed());
    LS.set('lc_incidents', makeIncidentsSeed());
    
    localStorage.setItem('lc_seeded_v5', '1');
  }
};
initData();

// ── SHARED COMPONENTS ──
const StatusBadge = ({ status }) => {
  const m = {
    pending: ['badge-pending', '#7a5800', 'Chờ Thẩm Định'],
    approved: ['badge-approved', '#15803d', 'Đã Phê Duyệt'],
    rejected: ['badge-rejected', '#be123c', 'Cần Chỉnh Sửa']
  };
  const [cls, color, lbl] = m[status] || ['', '#64748b', ''];
  return (
    <span className={cls} style={{ border: `1.5px solid ${status === 'pending' ? '#fcd34d' : status === 'approved' ? '#86efac' : '#fca5a5'}`, borderRadius: '2px' }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
        display: 'inline-block'
      }}></span>
      {lbl}
    </span>
  );
};

const EmptyState = ({ text }) => (
  <div style={{ textAlign: 'center', padding: '56px 20px', color: '#9ca3af', border: '1px dashed #d1d5db', background: 'white', borderRadius: '2px' }}>
    <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.02em' }}>{text}</div>
  </div>
);

// ── LOGIN PAGE (Sleek Glassmorphic with Sharp Borders 2px) ──
const LoginPage = ({ onLogin }) => {
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  const roles = [
    { key: 'director', icon: 'GD', label: 'Giám Đốc', desc: 'Kiểm soát tài chính & xem báo cáo toàn hệ thống' },
    { key: 'accountant', icon: 'KT', label: 'Kế Toán', desc: 'Thẩm định, duyệt báo cáo & tổng hợp P&L' },
    { key: 'manager', icon: 'QL', label: 'Quản Lý Quán', desc: 'Khai báo doanh thu & chi phí hàng ngày' },
    { key: 'cashier', icon: 'TN', label: 'Thu Ngân Ca', desc: 'Kết ca doanh thu & bàn giao tiền mặt cuối ca' },
    { key: 'barista', icon: 'PC', label: 'Pha Chế Ca', desc: 'Kiểm kê nguyên vật liệu & bàn giao pha chế' },
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

  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!canLogin) return;
    const isMyQuyen = name.trim().toLowerCase() === 'mỹ quyên';
    const expectedPassword = isMyQuyen ? '12345678' : '123456';
    if (password !== expectedPassword) {
      setError(isMyQuyen ? 'Mật khẩu đăng nhập cho tài khoản Mỹ Quyên không chính xác!' : 'Mật khẩu đăng nhập dùng chung không chính xác!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onLogin({ name: name.trim(), role });
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 20%, #0f172a 0%, #1e293b 90%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflowY: 'auto'
    }}>
      {/* Background Decorative Blur Spheres */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '15%',
        width: '350px',
        height: '350px',
        background: 'rgba(30, 64, 175, 0.12)',
        borderRadius: '50%',
        filter: 'blur(90px)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '15%',
        width: '300px',
        height: '300px',
        background: 'rgba(21, 128, 61, 0.08)',
        borderRadius: '50%',
        filter: 'blur(90px)',
        pointerEvents: 'none'
      }}></div>

      <div className="fade" style={{
        background: 'rgba(255, 255, 255, 0.94)',
        borderRadius: '2px', // Sharp border-radius
        padding: '24px 32px 32px',
        width: '100%',
        maxWidth: 450,
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
            style={{ width: "85px", objectFit: "contain", margin: "0 auto 8px", display: "block", mixBlendMode: "multiply" }}
          />
          <h1 style={{ color: '#0f0f0e', fontSize: 22, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 4 }}>LEE'S COFFEE</h1>
          <p style={{ color: '#9ca3af', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', uppercase: 'true' }}>HỆ THỐNG QUẢN LÝ TÀI CHÍNH NỘI BỘ</p>
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

        {/* Custom Role Dropdown - FIRST */}
        <div ref={dropdownRef} style={{ position: 'relative', marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Vị trí việc làm</label>
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: '#ffffff',
              border: '1.5px solid #e5e7eb',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.1s ease',
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
              <span style={{ color: '#9ca3af', fontSize: 12.5 }}>Chọn vị trí việc làm của bạn...</span>
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
              maxHeight: 135,
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
                    transition: 'background 0.1s'
                  }}
                  className="hover:bg-blue-50"
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
                    border: '1px solid #e5e7eb',
                    flexShrink: 0
                  }}>
                    {r.icon}
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: '#1f2937', whiteSpace: 'nowrap' }}>{r.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Name Input - SECOND */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Họ và tên nhân viên</label>
          <input 
            className="input-field" 
            value={name} 
            onChange={e => { setName(e.target.value); setError(''); }} 
            placeholder="Nhập đầy đủ họ tên (không viết tắt)..." 
            style={{ borderRadius: '2px', padding: '10px 14px', border: '1.5px solid #e5e7eb' }} 
          />
        </div>

        {/* Password Input - THIRD */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Mật khẩu đăng nhập</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? 'text' : 'password'}
              className="input-field mono" 
              value={password} 
              onChange={e => { setPassword(e.target.value); setError(''); }} 
              placeholder="••••••••" 
              style={{ borderRadius: '2px', padding: '10px 40px 10px 14px', border: '1.5px solid #e5e7eb', background: '#fafafa', width: '100%' }} 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4b5563',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
          <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
            <span>Mật khẩu thử nghiệm dùng chung cho tất cả vai trò: <strong className="mono">123456</strong></span>
          </div>
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
            letterSpacing: '0.03em',
            cursor: loading ? 'wait' : 'pointer',
            transition: 'all 0.15s'
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
        </button>
        {error && (
          <p style={{ color: '#be123c', fontSize: '11px', marginTop: '6px',
                      textAlign: 'center', fontWeight: 500 }}>{error}</p>
        )}
      </div>
    </div>
  );
};
    // ── LAYOUT (AvantiOS Dark Slate Sidebar & Pure White Header 52px) ──
const NAV = {
  director: [
    { k: 'dashboard', i: LayoutDashboard, l: 'Tổng Quan Hệ Thống' },
    { k: 'detailed_report', i: FileText, l: 'Báo Cáo Chi Tiết' },
    { k: 'summary', i: PieChartIcon, l: 'Kết Quả Kinh Doanh P&L' }
  ],
  accountant: [
    { k: 'dashboard', i: LayoutDashboard, l: 'Tổng Quan Hệ Thống' },
    { k: 'detailed_report', i: FileText, l: 'Báo Cáo Chi Tiết' },
    { k: 'review', i: CheckCircle, l: 'Thẩm Định & Duyệt' },
    { k: 'acc_reconcile', i: Scale, l: 'Đối Chiếu Doanh Thu' },
    { k: 'acc_inventory', i: Package, l: 'Kho & XNK' },
    { k: 'acc_invoices', i: Receipt, l: 'Hóa Đơn GTGT' },
    { k: 'acc_debts', i: Coins, l: 'Theo Dõi Công Nợ' },
    { k: 'acc_cashbook', i: Landmark, l: 'Sổ Quỹ Thu Chi' },
    { k: 'acc_tax', i: Percent, l: 'Thuế & BCTC' },
    { k: 'summary', i: PieChartIcon, l: 'Báo Cáo P&L Tổng Hợp' }
  ],
  manager: [
    { k: 'report',          i: FilePlus,         l: 'Khai Báo Số Liệu Ngày' },
    { k: 'history',         i: History,          l: 'Lịch Sử Kê Khai' },
    { k: 'notify',          i: Bell,             l: 'Yêu Cầu Chỉnh Sửa' },
    { k: 'mgr_schedule',    i: CalendarDays,     l: 'Bảng Công & Ca Làm Việc' },
    { k: 'mgr_staff',       i: Users,            l: 'Danh Sách Nhân Viên' },
    { k: 'mgr_performance', i: BarChart2,        l: 'Phân Tích Hiệu Suất' },
    { k: 'mgr_inventory_alert', i: Package,      l: 'Cảnh Báo Tồn Kho' },
    { k: 'mgr_menu',        i: UtensilsCrossed,  l: 'Quản Lý Thực Đơn' }
  ],
  staff: [
    { k: 'shift', i: FilePlus, l: 'Lịch Sử Kết Ca' },
    { k: 'shift_history', i: History, l: 'Lịch Sử Ca Trực' },
    { k: 'staff_schedule', i: CalendarDays, l: 'Lịch Phân Ca Của Tôi' }
  ],
  cashier: [
    { k: 'shift_cashier', i: FilePlus, l: 'Kết Ca Thu Ngân' },
    { k: 'shift_history', i: History, l: 'Lịch Sử Kết Ca' },
    { k: 'staff_schedule', i: CalendarDays, l: 'Lịch Phân Ca Của Tôi' }
  ],
  barista: [
    { k: 'shift_barista', i: FilePlus, l: 'Kết Ca Pha Chế' },
    { k: 'shift_history', i: History, l: 'Lịch Sử Kết Ca' },
    { k: 'staff_schedule', i: CalendarDays, l: 'Lịch Phân Ca Của Tôi' }
  ]
};
const PAGE_TITLE = {
  dashboard: 'Tổng Quan Hoạt Động',
  detailed_report: 'Báo Cáo Ngày Chi Tiết',
  review: 'Thẩm Định Báo Cáo Tài Chính',
  summary: 'Kết Quả Hoạt Động Kinh Doanh (P&L)',
  report: 'Khai Báo Dòng Tiền Ngày',
  history: 'Lịch Sử Báo Cáo Doanh Thu',
  notify: 'Thông Báo Yêu Cầu Chỉnh Sửa',
  shift: 'Lịch Sử Kết Ca',
  shift_cashier: 'Kết Ca Thu Ngân',
  shift_barista: 'Kết Ca Pha Chế',
  shift_history: 'Lịch Sử Kết Ca',
  acc_reconcile: 'Đối Chiếu Doanh Thu Quầy',
  acc_inventory: 'Quản Lý Kho & Đơn Hàng XNK',
  acc_invoices: 'Hóa Đơn GTGT & Thẩm Định Pháp Lý',
  acc_debts: 'Theo Dõi Công Nợ Phải Thu/Phải Trả',
  acc_cashbook: 'Sổ Nhật Ký Quỹ Tiền Mặt & ACB',
  acc_tax: 'Báo Cáo Thuế & BCTC Tóm Tắt',
  staff_schedule: 'Lịch Phân Ca Làm Việc Cá Nhân',
  mgr_schedule:    'Bảng Công & Quản Lý Ca Nhân Viên',
  mgr_staff:       'Quản Lý Danh Sách Nhân Viên',
  mgr_performance: 'Phân Tích Hiệu Suất Kinh Doanh',
  mgr_inventory_alert: 'Cảnh Báo Tồn Kho Nguyên Liệu',
  mgr_menu:        'Quản Lý Thực Đơn & Giá Bán',
};

const PAGE_TITLE2 = {
  shift_barista: 'Kết Ca Pha Chế',
  shift_history: 'Lịch Sử Kết Ca',
  acc_reconcile: 'Đối Chiếu Doanh Thu Quầy',
  acc_inventory: 'Quản Lý Kho & Đơn Hàng XNK',
  acc_invoices: 'Hóa Đơn GTGT & Thẩm Định Pháp Lý',
  acc_debts: 'Theo Dõi Công Nợ Phải Thu/Phải Trả',
  acc_cashbook: 'Sổ Nhật Ký Quỹ Tiền Mặt & ACB',
  acc_tax: 'Báo Cáo Thuế & BCTC Tóm Tắt',
  staff_schedule: 'Lịch Phân Ca Làm Việc Cá Nhân',
  mgr_schedule:    'Bảng Công & Quản Lý Ca Nhân Viên',
  mgr_staff:       'Quản Lý Danh Sách Nhân Viên',
  mgr_performance: 'Phân Tích Hiệu Suất Kinh Doanh',
  mgr_inventory_alert: 'Cảnh Báo Tồn Kho Nguyên Liệu',
  mgr_menu:        'Quản Lý Thực Đơn & Giá Bán',
};

const Layout = ({ user, page, setPage, pendingCount, rejectCount, children }) => {
  const [openSub, setOpenSub] = useState(page === 'shift_cashier' || page === 'shift_barista');
  const menu = NAV[user.role] || [];
  const logout = () => { LS.set('lc_user', null); window.location.reload(); };

  useEffect(() => {
    if (page === 'shift_cashier' || page === 'shift_barista') setOpenSub(true);
  }, [page]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f2f2ef' }}>
      {/* SIDEBAR (AvantiOS Slate Dark) */}
      <div className="sidebar" style={{ width: 208, background: '#0f0f0e', borderRight: '1px solid #252523' }}>
        {/* Brand Header */}
        <div style={{ padding: '20px 18px', borderBottom: '1px solid #252523' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '2px', // Sharp
              background: '#1e40af', // AvantiOS Navy Accent
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: 13, letterSpacing: '0.05em' }}>LC</span>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 14.5, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Lee's Coffee</div>
              <div style={{ color: '#5c5c58', fontSize: 8.5, marginTop: 2, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>TÀI CHÍNH NỘI BỘ</div>
            </div>
          </div>
        </div>

        {/* Date Display */}
        <div style={{ padding: '10px 18px', borderBottom: '1px solid #252523' }}>
          <div className="mono" style={{ fontSize: 9.5, color: '#5c5c58', fontWeight: 500 }}>
            {new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '12px 0' }}>
          {menu.map(m => {
            const badge = (m.k === 'review' && pendingCount > 0) ? pendingCount : (m.k === 'notify' && rejectCount > 0) ? rejectCount : 0;
            const Icon = m.i;
            const isActive = page === m.k || (m.k === 'shift' && (page === 'shift_cashier' || page === 'shift_barista'));

            if (m.k === 'shift') {
              return (
                <div key={m.k}>
                  <div className={`nav-item${isActive ? ' active' : ''}`} onClick={() => { setOpenSub(!openSub); if (!isActive) setPage('shift_cashier'); }}>
                    <Icon size={14} strokeWidth={1.8} opacity={isActive ? 1 : 0.7} />
                    <span style={{ flex: 1 }}>{m.l}</span>
                  </div>
                  {openSub && (
                    <div className="fade" style={{ animationDuration: '0.1s' }}>
                      <div className={`nav-sub-item${page === 'shift_cashier' ? ' active' : ''}`} onClick={() => setPage('shift_cashier')}>• Ca Thu Ngân</div>
                      <div className={`nav-sub-item${page === 'shift_barista' ? ' active' : ''}`} onClick={() => setPage('shift_barista')}>• Ca Pha Chế</div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={m.k} className={`nav-item${page === m.k ? ' active' : ''}`} onClick={() => setPage(m.k)}>
                <Icon size={14} strokeWidth={1.8} opacity={page === m.k ? 1 : 0.7} />
                <span style={{ flex: 1 }}>{m.l}</span>
                {badge > 0 && <span style={{ background: '#be123c', color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 2, letterSpacing: 0.3 }}>{badge}</span>}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #252523' }}>
          <div className="nav-item" style={{ color: '#be123c', margin: 0, padding: '8px 12px' }} onClick={logout}>
            <LogOut size={14} strokeWidth={1.8} /><span style={{ flex: 1 }}>Đăng Xuất</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* TOPBAR HEADER (AvantiOS Pure White 52px) */}
        <div className="topbar" style={{ height: 52, background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Breadcrumb path */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ color: '#9ca3af', fontWeight: 500 }}>Lee's Coffee</span>
            <ChevronRight size={11} className="text-[#d1d5db]" strokeWidth={1.5} />
            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{PAGE_TITLE[page] || 'Tổng Quan'}</span>
          </div>

          {/* Right Header Widget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Notifications Alert Dot indicator */}
            {(user.role === 'accountant' && pendingCount > 0) && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: '#be123c', background: '#fff1f2', border: '1px solid #fca5a5', padding: '2.5px 7px', borderRadius: '2px', fontWeight: 600 }}>
                Có {pendingCount} báo cáo chờ duyệt
              </span>
            )}
            {(user.role === 'manager' && rejectCount > 0) && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: '#be123c', background: '#fff1f2', border: '1px solid #fca5a5', padding: '2.5px 7px', borderRadius: '2px', fontWeight: 600 }}>
                Có {rejectCount} báo cáo cần chỉnh sửa
              </span>
            )}

            {/* Role indicator */}
            <span style={{
              background: '#fafafa',
              color: '#475569',
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: '2px',
              fontWeight: 600,
              border: '1px solid #e5e7eb'
            }}>{ROLES[user.role]}</span>

            {/* Full employee name - NOT abbreviated as requested */}
            <span style={{ color: '#0f172a', fontSize: 12.5, fontWeight: 600 }}>{user.name}</span>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="content-area fade" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ── DASHBOARD (Visual KPI borders + Customized Recharts Grid & Tooltip) ──
const Dashboard = ({ reports, onResetData }) => {
  const now = new Date();
  const td = todayStr();
  const wAgo = new Date(now); wAgo.setDate(now.getDate() - 7);
  const mStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const sum = list => list.reduce((a, r) => { const { rev, exp, profit } = calcR(r); return { rev: a.rev + rev, exp: a.exp + exp, profit: a.profit + profit }; }, { rev: 0, exp: 0, profit: 0 });
  const todayD = sum(reports.filter(r => r.date === td));
  const weekD = sum(reports.filter(r => new Date(r.date + ' ') >= wAgo));
  const monthD = sum(reports.filter(r => new Date(r.date + ' ') >= mStart));

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i));
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const { rev, exp } = sum(reports.filter(r => r.date === ds));
    return { name: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), 'DT': Math.round(rev / 1e3), 'CP': Math.round(exp / 1e3) };
  });

  const mReps = reports.filter(r => new Date(r.date + ' ') >= mStart);
  const tGoods = mReps.reduce((s, r) => s + (r.goodsCost || 0), 0);
  const tFixed = mReps.reduce((s, r) => s + (r.fixedExpenses || []).reduce((a, e) => a + (e.amount || 0), 0), 0);
  const tOther = mReps.reduce((s, r) => s + (r.otherExpenses || []).reduce((a, e) => a + (e.amount || 0), 0), 0);
  const pieData = [{ name: 'Nhập NVL (COGS)', value: tGoods }, { name: 'Cố Định (OPEX)', value: tFixed }, { name: 'Phát Sinh', value: tOther }].filter(p => p.value > 0);
  const PCOLS = ['#1e40af', '#be123c', '#d97706', '#15803d'];

  const KPI = ({ label, value, sub, borderColor = '#1e40af' }) => (
    <div className="kpi-card" style={{ borderTop: `3px solid ${borderColor}`, borderRadius: '2px', background: 'white', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{
          fontSize: 9.5,
          background: '#fafafa',
          padding: '2.5px 7px',
          borderRadius: '2px',
          color: '#6b7280',
          fontWeight: 700,
          border: '1px solid #e5e7eb',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>{sub}</span>
      </div>
      <div style={{ fontSize: 16.5, fontWeight: 700, color: '#0f0f0e', letterSpacing: '-0.02em' }} className="mono">{fmt(value)}</div>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  );

  const recent = [...reports].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPI label="Doanh thu hôm nay" value={todayD.rev} sub="HÔM NAY" borderColor="#1e40af" />
        <KPI label="Doanh thu tuần này" value={weekD.rev} sub="7 NGÀY QUA" borderColor="#1e40af" />
        <KPI label="Doanh thu tháng này" value={monthD.rev} sub="THÁNG 05" borderColor="#1e40af" />
        <KPI label="Lợi nhuận ròng tháng" value={monthD.profit} sub="THÁNG 05" borderColor={monthD.profit >= 0 ? "#15803d" : "#be123c"} />
      </div>

      {/* 2 Recharts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Line Chart */}
        <div className="card" style={{ borderRadius: '2px', border: '1px solid #e5e7eb', background: 'white', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 10, fontWeight: 700, tracking: '0.14em', textTransform: 'uppercase', color: '#9ca3af' }}>Xu hướng doanh thu / chi phí (7 ngày)</span>
            <span style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 500, fontFamily: 'monospace' }}>(Đơn vị: K₫)</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 500 }} stroke="#e5e7eb" />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 500 }} stroke="#e5e7eb" />
              <Tooltip 
                contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontSize: 11.5 }}
                formatter={(v, n) => [v + 'K ₫', n === 'DT' ? 'Doanh thu' : 'Chi phí']} 
              />
              <Legend formatter={v => v === 'DT' ? 'Doanh thu' : 'Chi phí'} wrapperStyle={{ fontSize: 11, paddingTop: 10, fontWeight: 500 }} />
              <Line type="monotone" dataKey="DT" stroke="#1e40af" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1.5, fill: 'white' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="CP" stroke="#be123c" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1.5, fill: 'white' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card" style={{ borderRadius: '2px', border: '1px solid #e5e7eb', background: 'white', padding: '20px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, tracking: '0.14em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 20 }}>Cơ cấu chi phí vận hành tháng</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={72} dataKey="value" label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10} fontWeight={600} fill="#8884d8">
                  {pieData.map((_, i) => <Cell key={i} fill={PCOLS[i % PCOLS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontSize: 11.5 }}
                  formatter={v => fmt(v)} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState icon="📊" text="Chưa ghi nhận chi phí nào" />}
        </div>
      </div>

      {/* Zebra Striped Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '2px', border: '1px solid #e5e7eb', background: 'white' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, tracking: '0.14em', textTransform: 'uppercase', color: '#9ca3af' }}>Báo cáo tài chính gần đây</span>
          {onResetData && (
            <button 
              className="btn btn-blue" 
              style={{ padding: '4px 10px', fontSize: 11, borderRadius: '2px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', height: 26 }}
              onClick={onResetData}
            >
              <RefreshCw size={11} /> Tạo Doanh Thu Ngẫu Nhiên Mới
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recent.length === 0 ? <EmptyState icon="📋" text="Chưa có dữ liệu giao dịch" /> : recent.map((r, idx) => { 
            const { rev, profit } = calcR(r); 
            return (
              <div 
                key={r.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  padding: '14px 20px',
                  borderBottom: idx === recent.length - 1 ? 'none' : '1px solid #f1f5f9',
                  background: idx % 2 === 0 ? 'transparent' : '#f8fafc',
                  transition: 'background 0.1s'
                }}
                className="table-row-hover"
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{fmtDate(r.date)}</div>
                  <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2, fontWeight: 500 }}>Nhân viên lập: <b>{r.createdBy}</b> ({ROLES[r.createdByRole]})</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 120 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1e40af' }} className="mono">{fmt(rev)}</div>
                  <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginTop: 2 }}>Doanh Thu</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 120 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: profit >= 0 ? '#15803d' : '#be123c' }} className="mono">{fmt(profit)}</div>
                  <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginTop: 2 }}>Lợi Nhuận</div>
                </div>
                <div style={{ minWidth: 150, display: 'flex', justify: 'flex-end' }}>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── REPORT FORM (Manager 2-Column Sharp Forms with Live Finance Calculation) ──
const FormRow = ({ label, children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 14, alignItems: 'center', marginBottom: 12 }}>
    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{label}</label>
    <div>{children}</div>
  </div>
);
const NumInput = ({ val, set, placeholder }) => (
  <input 
    type="number" 
    className="input-field mono" 
    value={val} 
    onChange={e => set(e.target.value)} 
    placeholder={placeholder || '0'} 
    style={{ textAlign: 'right', fontWeight: 500, borderRadius: '2px', border: '1px solid #e5e7eb' }} 
  />
);
const SummaryRow = ({ label, value, color = '#0f172a', bold }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5, fontWeight: bold ? 700 : 400 }}>
    <span style={{ color: '#6b7280' }}>{label}</span>
    <span style={{ color }} className="mono">{fmt(value)}</span>
  </div>
);

const ReportForm = ({ user, editReport, onSave, onCancel }) => {
  const init = editReport || {};
  const [date, setDate] = useState(init.date || todayStr());
  const [cash, setCash] = useState(init.cashRevenue || '');
  const [tf, setTf] = useState(init.transferRevenue || '');
  const [card, setCard] = useState(init.cardRevenue || '');
  const [grab, setGrab] = useState(init.grabRevenue || '');
  const [shopee, setShopee] = useState(init.shopeeRevenue || '');
  const [goods, setGoods] = useState(init.goodsCost || '');
  const [fixed, setFixed] = useState(init.fixedExpenses || [
    { id: 'f1', category: 'Lương nhân viên', amount: '' },
    { id: 'f2', category: 'Điện nước', amount: '' },
    { id: 'f3', category: 'Thuê mặt bằng', amount: '' },
  ]);
  const [other, setOther] = useState(init.otherExpenses || []);
  const [note, setNote] = useState(init.note || '');
  const [saving, setSaving] = useState(false);

  const totalRev = (Number(cash) || 0) + (Number(tf) || 0) + (Number(card) || 0) + (Number(grab) || 0) + (Number(shopee) || 0);
  const totalFix = fixed.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalOth = other.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalExp = (Number(goods) || 0) + totalFix + totalOth;
  const profit = totalRev - totalExp;

  const updFixed = (id, field, val) => setFixed(fixed.map(e => e.id === id ? { ...e, [field]: val } : e));
  const updOther = (id, field, val) => setOther(other.map(e => e.id === id ? { ...e, [field]: val } : e));
  const addOther = () => setOther([...other, { id: genId(), category: '', amount: '' }]);
  const delOther = id => setOther(other.filter(e => e.id !== id));

  const submit = (st) => {
    if (!date) { alert('Vui lòng chọn ngày lập báo cáo'); return; }
    setSaving(true);
    const rep = {
      ...(editReport || {}),
      id: editReport?.id || genId(),
      date, createdBy: user.name, createdByRole: user.role,
      cashRevenue: Number(cash) || 0, transferRevenue: Number(tf) || 0,
      cardRevenue: Number(card) || 0, grabRevenue: Number(grab) || 0, shopeeRevenue: Number(shopee) || 0,
      goodsCost: Number(goods) || 0,
      fixedExpenses: fixed.map(e => ({ ...e, amount: Number(e.amount) || 0 })),
      otherExpenses: other.map(e => ({ ...e, amount: Number(e.amount) || 0 })).filter(e => e.category.trim() !== ''),
      note, status: st, submittedAt: new Date().toISOString(),
      reviewedBy: null, reviewedAt: null,
    };
    onSave(rep);
    setSaving(false);
  };

  // ── TổNG HỢP CA THU NGÂN: Đọc shifts của ngày đang chọn ──
  const dayShifts = useMemo(() => {
    const allShifts = LS.get('lc_shifts', []);
    return allShifts.filter(s => s.date === date && s.roleType === 'cashier');
  }, [date]);

  const shiftTotal = useMemo(() => ({
    cash: dayShifts.reduce((s, sh) => s + (sh.cashRevenue || 0), 0),
    tf:   dayShifts.reduce((s, sh) => s + (sh.transferRevenue || 0), 0),
    card: dayShifts.reduce((s, sh) => s + (sh.cardRevenue || 0), 0),
    grab: dayShifts.reduce((s, sh) => s + (sh.grabRevenue || 0), 0),
    shopee: dayShifts.reduce((s, sh) => s + (sh.shopeeRevenue || 0), 0),
    orders: dayShifts.reduce((s, sh) => s + (sh.orders || 0), 0),
  }), [dayShifts]);

  const autoFillFromShifts = () => {
    if (dayShifts.length === 0) return;
    setCash(shiftTotal.cash || '');
    setTf(shiftTotal.tf || '');
    setCard(shiftTotal.card || '');
    setGrab(shiftTotal.grab || '');
    setShopee(shiftTotal.shopee || '');
  };

  return (
    <div className="fade" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 20, alignItems: 'start' }}>
      {/* Column Left: Input Controls */}
      <div className="card" style={{ borderRadius: '2px', border: '1px solid #e5e7eb', background: 'white', padding: '24px' }}>
        <div className="section-label">Thông tin thời gian</div>
        <FormRow label="Ngày lập báo cáo">
          <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} style={{ borderRadius: '2px', border: '1px solid #e5e7eb' }} />
        </FormRow>
        
        <div className="divider" />

        {/* ── CA THU NGÂN TỔNG HỢP PANEL ── */}
        {dayShifts.length > 0 ? (
          <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '2px', padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {dayShifts.length} CA THU NGÂN ĐÃ KẾT {fmtDate(date).split('/').slice(0,2).join('/')}
                </div>
                <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 2 }}>
                  {dayShifts.map(s => s.staffName + ' — ' + (s.shift === 'morning' ? 'Ca Sáng' : s.shift === 'afternoon' ? 'Ca Chiều' : 'Ca Tối')).join(' · ')}
                </div>
              </div>
              <button
                type="button"
                onClick={autoFillFromShifts}
                style={{ background: '#1e40af', color: 'white', border: 'none', borderRadius: '2px', padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Tổng hợp vào form
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {[
                ['Tiền mặt', shiftTotal.cash, '#1e40af'],
                ['Chuyển khoản', shiftTotal.tf, '#1e40af'],
                ['Thẻ', shiftTotal.card, '#7c3aed'],
                ['Grab', shiftTotal.grab, '#15803d'],
                ['Shopee', shiftTotal.shopee, '#d97706'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '2px', padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: c }} className="mono">{fmt(v)}</div>
                </div>
              ))}
            </div>
            {shiftTotal.orders > 0 && (
              <div style={{ marginTop: 8, fontSize: 11.5, color: '#1e40af', fontWeight: 600 }}>
                Tổng sản lượng thu ngân: <b>{shiftTotal.orders} cốc</b> · Tổng doanh thu ca: <b className="mono">{fmt(shiftTotal.cash + shiftTotal.tf + shiftTotal.card + shiftTotal.grab + shiftTotal.shopee)}</b>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: '#fafafa', border: '1px dashed #d1d5db', borderRadius: '2px', padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Chưa có ca thu ngân nào kết ca cho ngày {fmtDate(date)} — Vui lòng nhập thủ công.</span>
          </div>
        )}

        <div className="section-label">DOANH THU HOẠT ĐỘNG</div>
        <FormRow label="Tiền mặt"><NumInput val={cash} set={setCash} placeholder="Ví dụ: 1978500" /></FormRow>
        <FormRow label="Chuyển khoản"><NumInput val={tf} set={setTf} placeholder="Ví dụ: 3651800" /></FormRow>
        <FormRow label="Thẻ ATM / Visa"><NumInput val={card} set={setCard} placeholder="Ví dụ: 1658000" /></FormRow>
        <FormRow label="Grab Food"><NumInput val={grab} set={setGrab} placeholder="Ví dụ: 1133000" /></FormRow>
        <FormRow label="Shopee Food"><NumInput val={shopee} set={setShopee} placeholder="Ví dụ: 0" /></FormRow>
        
        <div className="divider" />
        
        <div className="section-label">GIÁ VỐN NGUYÊN VẬT LIỆU</div>
        <FormRow label="Chi phí nhập nguyên liệu"><NumInput val={goods} set={setGoods} /></FormRow>
        
        <div className="divider" />
        
        <div className="section-label">CHI PHÍ VẬN HÀNH CỐ ĐỊNH</div>
        {fixed.map(e => (
          <FormRow key={e.id} label={e.category}>
            <NumInput val={e.amount} set={v => updFixed(e.id, 'amount', v)} />
          </FormRow>
        ))}
        
        <div className="divider" />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="section-label" style={{ margin: 0 }}>CHI PHÍ PHÁT SINH NGOÀI CA</span>
          <button className="btn btn-gray" style={{ padding: '4px 10px', fontSize: 11, borderRadius: '2px' }} onClick={addOther}>+ Thêm khoản chi</button>
        </div>
        {other.map(e => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input className="input-field" value={e.category} onChange={ev => updOther(e.id, 'category', ev.target.value)} placeholder="Mô tả chi phí phát sinh..." style={{ borderRadius: '2px', border: '1px solid #e5e7eb' }} />
            <input type="number" className="input-field mono" value={e.amount} onChange={ev => updOther(e.id, 'amount', ev.target.value)} placeholder="0" style={{ textAlign: 'right', fontWeight: 500, borderRadius: '2px', border: '1px solid #e5e7eb' }} />
            <button onClick={() => delOther(e.id)} style={{ background: '#fff1f2', border: '1px solid #fca5a5', borderRadius: '2px', cursor: 'pointer', color: '#be123c', fontWeight: 700, fontSize: 15, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        ))}
        {other.length === 0 && <div style={{ color: '#9ca3af', fontSize: 11.5, fontStyle: 'italic', padding: '4px 0' }}>Không ghi nhận chi phí phát sinh</div>}
        
        <div className="divider" />
        
        <div className="section-label">GHI CHÚ GIAO BAN</div>
        <textarea className="input-field" value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Ghi chú thêm về thời tiết, tình hình kinh doanh, sự cố thiết bị máy pha cà phê..." style={{ resize: 'vertical', borderRadius: '2px', border: '1px solid #e5e7eb' }} />
      </div>

      {/* Column Right: Live financial calculations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card" style={{ borderRadius: '2px', border: '1px solid #e5e7eb', background: 'white', padding: '20px', borderTop: '3px solid #1e40af' }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Tóm tắt số liệu dòng tiền</div>
          <SummaryRow label="Tiền mặt" value={Number(cash) || 0} />
          <SummaryRow label="Chuyển khoản" value={Number(tf) || 0} />
          {(Number(card) || 0) > 0 && <SummaryRow label="Thẻ ATM / Visa" value={Number(card) || 0} />}
          {(Number(grab) || 0) > 0 && <SummaryRow label="Grab Food" value={Number(grab) || 0} />}
          {(Number(shopee) || 0) > 0 && <SummaryRow label="Shopee Food" value={Number(shopee) || 0} />}
          <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0' }} />
          <SummaryRow label="TỔNG DOANH THU" value={totalRev} color="#1e40af" bold />
          <div style={{ height: 12 }} />
          <SummaryRow label="Chi phí nhập NVL (COGS)" value={Number(goods) || 0} />
          <SummaryRow label="Chi phí vận hành cố định" value={totalFix} />
          <SummaryRow label="Chi phí phát sinh ngoài ca" value={totalOth} />
          <div style={{ height: 1, background: '#f1f5f9', margin: '8px 0' }} />
          <SummaryRow label="TỔNG CHI PHÍ KINH DOANH" value={totalExp} color="#be123c" bold />
          <div style={{ borderTop: '1px dashed #d1d5db', margin: '12px 0' }} />
          <SummaryRow label="LỢI NHUẬN THỰC TẾ" value={profit} color={profit >= 0 ? '#15803d' : '#be123c'} bold />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-blue" style={{ justifyContent: 'center', padding: 12, fontSize: 13, borderRadius: '2px', fontWeight: 700 }} onClick={() => submit('pending')} disabled={saving}>
            GỬI BÁO CÁO PHÊ DUYỆT
          </button>
          <button className="btn btn-gray" style={{ justifyContent: 'center', padding: 10, fontSize: 12, borderRadius: '2px', fontWeight: 600 }} onClick={() => submit('draft')} disabled={saving}>
            LƯU NHÁP HỆ THỐNG
          </button>
          {onCancel && <button className="btn btn-outline" style={{ justifyContent: 'center', padding: 10, borderRadius: '2px', fontWeight: 600 }} onClick={onCancel}>HUỶ THAY ĐỔI</button>}
        </div>
      </div>
    </div>
  );
};

// ── REPORT HISTORY (Manager view submission list and feedback dialog) ──
const ReportHistory = ({ user, reports, comments, onEdit }) => {
  const [sel, setSel] = useState(null);
  const mine = useMemo(() => [...reports].filter(r => r.createdBy === user.name).sort((a, b) => b.date.localeCompare(a.date)), [reports, user.name]);
  const selComments = sel ? comments.filter(c => c.reportId === sel.id) : [];
  return (
    <div className="fade">
      {sel && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setSel(null) }}>
          <div className="modal" style={{ borderRadius: '2px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f0f0e' }}>Báo Cáo Tài Chính Ngày {fmtDate(sel.date)}</div>
                <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>Trạng thái giao ban: <b>{sel.status === 'draft' ? 'Đang lưu nháp' : sel.status === 'pending' ? 'Chờ kiểm duyệt' : sel.status === 'approved' ? 'Đã phê duyệt' : 'Cần điều chỉnh số liệu'}</b></div>
              </div>
              <button className="btn btn-gray" style={{ padding: '6px 12px', borderRadius: '2px' }} onClick={() => setSel(null)}>✕ Đóng</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
              {[
                ['Tiền mặt', sel.cashRevenue, '#1e40af'],
                ['Chuyển khoản', sel.transferRevenue, '#1e40af'],
                ...(sel.cardRevenue ? [['Thẻ ATM/Visa', sel.cardRevenue, '#1e40af']] : []),
                ...(sel.grabRevenue ? [['Grab Food', sel.grabRevenue, '#15803d']] : []),
                ...(sel.shopeeRevenue ? [['Shopee Food', sel.shopeeRevenue, '#d97706']] : []),
                ['Nhập nguyên liệu', sel.goodsCost, '#be123c']
              ].map(([l, v, c]) => (
                <div key={l} style={{ background: '#f8fafc', borderRadius: '2px', padding: '10px 12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.2 }}>{l}</div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: c, marginTop: 4 }} className="mono">{fmt(v)}</div>
                </div>
              ))}
            </div>
 
            <div style={{ marginBottom: 16, background: '#f8fafc', padding: 16, borderRadius: '2px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>Chi tiết chi phí vận hành ngày</div>
              {(sel.fixedExpenses || []).map(e => (
                <div key={e.id} style={{ display: 'flex', justify: 'space-between', padding: '6px 0', fontSize: 12.5, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>{e.category}</span>
                  <span className="mono">{fmt(e.amount)}</span>
                </div>
              ))}
              {(sel.otherExpenses || []).map(e => (
                <div key={e.id} style={{ display: 'flex', justify: 'space-between', padding: '6px 0', fontSize: 12.5, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>{e.category} <span style={{ background: '#fffbeb', color: '#b45309', fontSize: 8.5, padding: '1px 5px', borderRadius: 2, fontWeight: 600 }}>Phát sinh ngoài ca</span></span>
                  <span className="mono">{fmt(e.amount)}</span>
                </div>
              ))}
            </div>

            {sel.note && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '2px', padding: '12px 14px', fontSize: 12.5, color: '#1e40af', marginBottom: 16 }}>
                Ghi chú người lập: {sel.note}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: selComments.length ? 12 : 0 }}>
              <StatusBadge status={sel.status}/>
              {(sel.status === 'rejected' || sel.status === 'draft') && (
                <button className="btn btn-orange" style={{ padding: '8px 16px', fontSize: 12, borderRadius: '2px', fontWeight: 600 }} onClick={() => { setSel(null); onEdit(sel); }}>
                  Chỉnh sửa lại số liệu ngay
                </button>
              )}
            </div>

            {selComments.map(c => (
              <div key={c.id} style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '2px', padding: '12px 16px', marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#c2410c', marginBottom: 4 }}>Yêu cầu phản hồi từ Kế toán viên – {c.createdBy}</div>
                <div style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.5 }}>{c.content}</div>
                <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: 4 }} className="mono">{new Date(c.createdAt).toLocaleString('vi-VN')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mine.length === 0 ? <EmptyState icon="📋" text="Chưa kê khai báo cáo doanh thu nào trong hệ thống" /> : mine.map((r, i) => {
        const { rev, profit } = calcR(r);
        return (
          <div 
            key={r.id} 
            className="card" 
            style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', padding: '18px 24px', background: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderRadius: '2px', border: '1px solid #e5e7eb', transition: 'box-shadow 0.1s' }} 
            onClick={() => setSel(r)}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f0f0e' }}>Ngày lập báo cáo: {fmtDate(r.date)}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Doanh thu kê khai: <span style={{ fontWeight: 600 }} className="mono">{fmt(rev)}</span> · Lợi nhuận thực tế: <span style={{ color: profit >= 0 ? '#15803d' : '#be123c', fontWeight: 700 }} className="mono">{fmt(profit)}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusBadge status={r.status}/>
              <span style={{ color: '#9ca3af', fontSize: 18, fontWeight: 700 }}>›</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── REVIEW LIST (Accountant flat tabs and feedback dialog with double visual border checks) ──
const ReviewList = ({ reports, comments, onUpdate }) => {
  const [tab, setTab] = useState('pending');
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState('');
  const sorted = useMemo(() => [...reports].sort((a, b) => b.date.localeCompare(a.date)), [reports]);
  const filtered = useMemo(() => tab === 'all' ? sorted : sorted.filter(r => r.status === tab), [sorted, tab]);
  const selComments = sel ? comments.filter(c => c.reportId === sel.id) : [];

  const approve = (r) => { onUpdate(r, { status: 'approved', reviewedAt: new Date().toISOString() }, ''); setSel(null); };
  const reject = (r) => { if (!note.trim()) { alert('Vui lòng nhập phản hồi yêu cầu sửa chi tiết'); return; } onUpdate(r, { status: 'rejected', reviewedAt: new Date().toISOString() }, note); setNote(''); setSel(null); };

  return (
    <div className="fade">
      {sel && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) { setSel(null); setNote(''); } }}>
          <div className="modal" style={{ borderRadius: '2px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f0f0e' }}>Thẩm Định Chi Tiết Số Liệu {fmtDate(sel.date)}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>Quản lý khai báo: <b>{sel.createdBy}</b> ({ROLES[sel.createdByRole]})</div>
              </div>
              <button className="btn btn-gray" style={{ padding: '6px 12px', borderRadius: '2px' }} onClick={() => { setSel(null); setNote(''); }}>✕ Đóng</button>
            </div>
            
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: '2px', border: '1px solid #e5e7eb', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>Chi tiết các dòng tài chính giao ban</div>
              {[
                ['💵 Tiền mặt', sel.cashRevenue, '#1e40af'],
                ['🏦 Chuyển khoản', sel.transferRevenue, '#1e40af'],
                ...(sel.cardRevenue ? [['💳 Thẻ ATM / Visa', sel.cardRevenue, '#1e40af']] : []),
                ...(sel.grabRevenue ? [['🟢 Grab Food', sel.grabRevenue, '#15803d']] : []),
                ...(sel.shopeeRevenue ? [['🔶 Shopee Food', sel.shopeeRevenue, '#d97706']] : []),
                ['📦 Nguyên vật liệu (COGS)', -(sel.goodsCost || 0), '#be123c']
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>{l}</span>
                  <span style={{ fontWeight: 600, color: c }} className="mono">{fmt(v)}</span>
                </div>
              ))}
              {(sel.fixedExpenses || []).map(e => (
                <div key={e.id} style={{ display: 'flex', justify: 'space-between', padding: '6px 0', fontSize: 12.5, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>{e.category} (Cố định)</span>
                  <span className="mono">-{fmt(e.amount)}</span>
                </div>
              ))}
              {(sel.otherExpenses || []).map(e => (
                <div key={e.id} style={{ display: 'flex', justify: 'space-between', padding: '6px 0', fontSize: 12.5, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>{e.category} <span style={{ background: '#fffbeb', color: '#b45309', fontSize: 8.5, padding: '1px 5px', borderRadius: 2, fontWeight: 600 }}>Phát sinh ngoài ca</span></span>
                  <span className="mono">-{fmt(e.amount)}</span>
                </div>
              ))}
              {(() => { 
                const { rev, exp, profit } = calcR(sel); 
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: 12.5, fontWeight: 700, marginTop: 8, borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ color: '#475569' }}>Lợi nhuận thực tế</span>
                    <span style={{ color: profit >= 0 ? '#15803d' : '#be123c' }} className="mono">{fmt(profit)}</span>
                  </div>
                ); 
              })()}
            </div>
            
            {sel.note && <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '2px', padding: '12px 14px', fontSize: 12.5, color: '#1e40af', marginBottom: 16 }}>💬 <b>Nhật ký hoạt động ca:</b> {sel.note}</div>}
            {selComments.map(c => (
              <div key={c.id} style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '2px', padding: '12px 14px', marginBottom: 12, fontSize: 12.5, color: '#374151' }}>
                <b>Kế toán {c.createdBy}:</b> {c.content}
              </div>
            ))}
            
            {sel.status === 'pending' && (
              <div style={{ marginTop: 20, borderTop: '1.5px solid #e5e7eb', paddingTop: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Nhập phản hồi yêu cầu sửa đổi (nếu có hoá đơn sai lệch):</div>
                <textarea className="input-field" value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Ghi cụ thể lý do từ chối số liệu chi phí, yêu cầu kiểm kê lại tiền mặt..." style={{ resize: 'vertical', marginBottom: 12, borderRadius: '2px', border: '1px solid #e5e7eb' }}/>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-green" style={{ borderRadius: '2px', padding: '8px 16px', fontWeight: 600 }} onClick={() => approve(sel)}>✅ PHÊ DUYỆT BÁO CÁO</button>
                  <button className="btn btn-orange" style={{ borderRadius: '2px', padding: '8px 16px', fontWeight: 600 }} onClick={() => reject(sel)}>🔄 YÊU CẦU CHỈNH SỬA</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flat Tabs bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          ['pending', '⏳ Chờ Duyệt'],
          ['approved', '✅ Đã Duyệt'],
          ['all', 'Tất Cả Bản Ghi']
        ].map(([k, l]) => (
          <button key={k} className={`tab${tab === k ? ' active' : ''}`} style={{ borderRadius: '2px' }} onClick={() => setTab(k)}>
            {l} <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.8 }} className="mono">({k === 'all' ? sorted.length : sorted.filter(r => r.status === k).length})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? <EmptyState icon="✅" text="Không có báo cáo tài chính nào cần xử lý" /> : filtered.map((r, i) => {
        const { rev, exp, profit } = calcR(r);
        return (
          <div 
            key={r.id} 
            className="card" 
            style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', padding: '18px 24px', background: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderRadius: '2px', border: '1px solid #e5e7eb' }} 
            onClick={() => setSel(r)}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f0f0e' }}>{fmtDate(r.date)} <span style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 500 }}>– Lập bởi {r.createdBy}</span></div>
              <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 4 }}>Thu: <span className="mono">{fmt(rev)}</span> · Chi: <span className="mono">{fmt(exp)}</span> · <span style={{ color: profit >= 0 ? '#15803d' : '#be123c', fontWeight: 700 }}>Lợi nhuận thực tế: <span className="mono">{fmt(profit)}</span></span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusBadge status={r.status}/>
              <span style={{ color: '#9ca3af', fontSize: 18, fontWeight: 700 }}>›</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── MONTHLY SUMMARY (P&L Financial Statement and Sharp Bars Recharts) ──
const MonthlySummary = ({ reports }) => {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(now.getFullYear()));
  const pdfRef = useRef();

  const filtered = useMemo(() => reports.filter(r => {
    const d = new Date(r.date + ' '); return d.getMonth() === Number(month) - 1 && d.getFullYear() === Number(year) && r.status === 'approved';
  }).sort((a, b) => a.date.localeCompare(b.date)), [reports, month, year]);

  const total = useMemo(() => filtered.reduce((acc, r) => {
    const { rev, exp, profit } = calcR(r);
    return {
      rev: acc.rev + rev, exp: acc.exp + exp, profit: acc.profit + profit,
      goods: acc.goods + (r.goodsCost || 0),
      fixed: acc.fixed + (r.fixedExpenses || []).reduce((s, e) => s + (e.amount || 0), 0),
      other: acc.other + (r.otherExpenses || []).reduce((s, e) => s + (e.amount || 0), 0)
    };
  }, { rev: 0, exp: 0, profit: 0, goods: 0, fixed: 0, other: 0 }), [filtered]);

  const barData = useMemo(() => filtered.map(r => {
    const { rev, profit } = calcR(r);
    return { name: r.date.slice(8), 'DT': Math.round(rev / 1e3), 'LN': Math.round(profit / 1e3) };
  }), [filtered]);

  const exportPDF = async () => {
    const el = pdfRef.current;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#fff' });
    const img = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth() - 20;
    const h = (canvas.height / canvas.width) * w;
    pdf.addImage(img, 'PNG', 10, 10, w, h);
    pdf.save(`LeeCoffee_P&L_BaoCao_${year}_${month}.pdf`);
  };

  const years = Array.from({ length: 3 }, (_, i) => String(now.getFullYear() - i));
  const months = Array.from({ length: 12 }, (_, i) => ({ v: String(i + 1).padStart(2, '0'), l: `Tháng ${i + 1}` }));

  return (
    <div className="fade">
      {/* Selector Options */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, background: 'white', padding: 16, borderRadius: '2px', border: '1px solid #e5e7eb' }}>
        <select className="input-field" style={{ width: 140, borderRadius: '2px', border: '1px solid #e5e7eb' }} value={month} onChange={e => setMonth(e.target.value)}>
          {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
        </select>
        <select className="input-field" style={{ width: 100, borderRadius: '2px', border: '1px solid #e5e7eb' }} value={year} onChange={e => setYear(e.target.value)}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="btn btn-blue" style={{ height: 38, borderRadius: '2px', fontWeight: 600 }} onClick={exportPDF}>📄 Xuất Báo Cáo PDF</button>
        <span style={{ fontSize: 12.5, color: '#6b7280', marginLeft: 'auto', fontWeight: 600 }}>{filtered.length} báo cáo tài chính đã phê duyệt</span>
      </div>

      {/* PDF Statement Canvas */}
      <div ref={pdfRef} style={{ background: 'white', padding: 32, borderRadius: '2px', border: '1px solid #e5e7eb' }}>
        {/* Banner Title */}
        <div style={{ textAlign: 'center', marginBottom: 28, padding: 24, background: '#0f0f0e', borderRadius: '2px' }}>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 22, letterSpacing: '0.08em' }}>LEE'S COFFEE</div>
          <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 6, fontWeight: 700, letterSpacing: '0.05em' }}>BÁO CÁO KẾT QUẢ KINH DOANH (P&L STATEMENT)</div>
          <div style={{ color: '#5c5c58', fontSize: 11, marginTop: 4, fontWeight: 600 }} className="mono">Kỳ Báo Cáo: Tháng {month} / Năm {year}</div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
          {/* Financial columns */}
          <div className="card" style={{ boxShadow: 'none', border: '1px solid #e5e7eb', padding: 20, borderRadius: '2px' }}>
            <div className="section-label">Báo Cáo Tài Chính Thu Gọn</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 16 }}>
              
              {/* Doanh thu */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 8px', borderBottom: '2px solid #0f172a', fontWeight: 700, fontSize: 13, color: '#0f172a', background: '#f8fafc' }}>
                <span>I. DOANH THU THUẦN DOANH NGHIỆP:</span>
                <span className="mono" style={{ marginLeft: 8 }}>{fmt(total.rev)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '9px 8px 9px 20px', fontSize: 12, color: '#4b5563', borderBottom: '1px solid #f1f5f9' }}>
                <span>1. Doanh thu tiền mặt:</span>
                <span className="mono" style={{ marginLeft: 8 }}>{fmt(filtered.reduce((s, r) => s + (r.cashRevenue || 0), 0))}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '9px 8px 9px 20px', fontSize: 12, color: '#4b5563', borderBottom: '1px solid #f1f5f9' }}>
                <span>2. Doanh thu chuyển khoản:</span>
                <span className="mono" style={{ marginLeft: 8 }}>{fmt(filtered.reduce((s, r) => s + (r.transferRevenue || 0), 0))}</span>
              </div>
              
              {/* Giá vốn */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 8px', borderBottom: '1.5px solid #e5e7eb', fontWeight: 700, fontSize: 13, color: '#be123c', marginTop: 16 }}>
                <span>II. GIÁ VỐN HÀNG BÁN (COGS):</span>
                <span className="mono" style={{ marginLeft: 8 }}>({fmt(total.goods)})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '9px 8px 9px 20px', fontSize: 12, color: '#4b5563', borderBottom: '1px solid #f1f5f9' }}>
                <span>1. Chi phí nguyên liệu nhập hàng:</span>
                <span className="mono" style={{ marginLeft: 8 }}>({fmt(total.goods)})</span>
              </div>

              {/* Lợi nhuận gộp */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 8px', borderBottom: '2px solid #0f172a', fontWeight: 800, fontSize: 13, color: '#0f172a', background: '#f1f5f9', marginTop: 12 }}>
                <span>III. LỢI NHUẬN GỘP KINH DOANH (I - II):</span>
                <span className="mono" style={{ marginLeft: 8 }}>{fmt(total.rev - total.goods)}</span>
              </div>

              {/* Chi phí vận hành */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '12px 8px', borderBottom: '1.5px solid #e5e7eb', fontWeight: 700, fontSize: 13, color: '#be123c', marginTop: 16 }}>
                <span>IV. CHI PHÍ VẬN HÀNH (OPEX):</span>
                <span className="mono" style={{ marginLeft: 8 }}>({fmt(total.fixed + total.other)})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '9px 8px 9px 20px', fontSize: 12, color: '#4b5563', borderBottom: '1px solid #f1f5f9' }}>
                <span>1. Chi phí cố định hàng tháng:</span>
                <span className="mono" style={{ marginLeft: 8 }}>({fmt(total.fixed)})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '5px 8px 5px 36px', fontSize: 11, color: '#6b7280', fontStyle: 'italic', borderBottom: '1px dashed #f1f5f9' }}>
                <span>• Lương nhân sự trực ca:</span>
                <span className="mono" style={{ marginLeft: 8 }}>({fmt(filtered.reduce((s, r) => s + (r.fixedExpenses || []).filter(e => e.category === 'Lương nhân viên').reduce((a, e) => a + (e.amount || 0), 0), 0))})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '5px 8px 5px 36px', fontSize: 11, color: '#6b7280', fontStyle: 'italic', borderBottom: '1px dashed #f1f5f9' }}>
                <span>• Điện nước, wifi:</span>
                <span className="mono" style={{ marginLeft: 8 }}>({fmt(filtered.reduce((s, r) => s + (r.fixedExpenses || []).filter(e => e.category === 'Điện nước').reduce((a, e) => a + (e.amount || 0), 0), 0))})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '5px 8px 5px 36px', fontSize: 11, color: '#6b7280', fontStyle: 'italic', borderBottom: '1px dashed #f1f5f9' }}>
                <span>• Thuê cửa hàng kinh doanh:</span>
                <span className="mono" style={{ marginLeft: 8 }}>({fmt(filtered.reduce((s, r) => s + (r.fixedExpenses || []).filter(e => e.category === 'Thuê mặt bằng').reduce((a, e) => a + (e.amount || 0), 0), 0))})</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', padding: '9px 8px 9px 20px', fontSize: 12, color: '#4b5563', borderBottom: '1px solid #f1f5f9' }}>
                <span>2. Khoản chi phát sinh ngoài ca:</span>
                <span className="mono" style={{ marginLeft: 8 }}>({fmt(total.other)})</span>
              </div>

              {/* Lợi nhuận trước thuế */}
              <div style={{
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px 10px', 
                borderBottom: '3px double #0f172a', 
                fontWeight: 800, 
                fontSize: 13.5, 
                color: total.profit >= 0 ? '#15803d' : '#be123c', 
                background: total.profit >= 0 ? '#f0fdf4' : '#fff1f2', 
                marginTop: 20,
                borderRadius: '2px'
              }}>
                <span>V. LỢI NHUẬN THUẦN TRƯỚC THUẾ (III - IV):</span>
                <span className="mono" style={{ marginLeft: 8 }}>{fmt(total.profit)}</span>
              </div>

            </div>
          </div>
          
          {/* Trend Bar Chart */}
          <div className="card" style={{ boxShadow: 'none', border: '1px solid #e5e7eb', padding: 20, borderRadius: '2px' }}>
            <div className="section-label">Xu Hướng Doanh Thu Ngày</div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e5e7eb" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e5e7eb" />
                  <Tooltip 
                    contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '2px', fontSize: 11.5 }}
                    formatter={(v, n) => [v + 'K ₫', n === 'DT' ? 'Doanh thu' : 'Lợi nhuận']} 
                  />
                  <Legend formatter={v => v === 'DT' ? 'Doanh thu' : 'Lợi nhuận'} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="DT" fill="#1e40af" radius={0} />
                  <Bar dataKey="LN" fill="#15803d" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState icon="📊" text="Không có dữ liệu biểu đồ kinh doanh" />}
          </div>
        </div>

        {/* Breakdown table */}
        {filtered.length > 0 && (
          <div className="card" style={{ boxShadow: 'none', border: '1px solid #e5e7eb', padding: 0, overflow: 'hidden', marginTop: 20, borderRadius: '2px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
              <div className="section-label" style={{ margin: 0 }}>Bảng Kê Số Liệu Các Ngày Khớp Bộ Lọc</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 700, uppercase: 'true', fontSize: 10.5 }}>Ngày Lập</th>
                  <th style={{ padding: '10px 20px', textAlign: 'right', color: '#64748b', fontWeight: 700, uppercase: 'true', fontSize: 10.5 }}>Doanh Thu</th>
                  <th style={{ padding: '10px 20px', textAlign: 'right', color: '#64748b', fontWeight: 700, uppercase: 'true', fontSize: 10.5 }}>Chi Phí HĐ</th>
                  <th style={{ padding: '10px 20px', textAlign: 'right', color: '#64748b', fontWeight: 700, uppercase: 'true', fontSize: 10.5 }}>Lợi Nhuận Ròng</th>
                  <th style={{ padding: '10px 20px', textAlign: 'center', color: '#64748b', fontWeight: 700, uppercase: 'true', fontSize: 10.5 }}>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => { 
                  const { rev, exp, profit } = calcR(r); 
                  return (
                    <tr key={r.id} style={{ borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid #f1f5f9', background: idx % 2 === 0 ? 'transparent' : '#f8fafc' }} className="table-row-hover">
                      <td style={{ padding: '10px 20px', fontWeight: 600, color: '#0f0f0e' }}>{fmtDate(r.date)}</td>
                      <td style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 600, color: '#1e40af' }} className="mono">{fmt(rev)}</td>
                      <td style={{ padding: '10px 20px', textAlign: 'right', color: '#be123c' }} className="mono">({fmt(exp)})</td>
                      <td style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 700, color: profit >= 0 ? '#15803d' : '#be123c' }} className="mono">{fmt(profit)}</td>
                      <td style={{ padding: '10px 20px', textAlign: 'center' }}><StatusBadge status={r.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── NOTIFICATIONS (Show rejected alerts from Accountant) ──
const Notifications = ({ user, reports, onEdit }) => {
  const rejected = useMemo(() => reports.filter(r => r.createdBy === user.name && r.status === 'rejected'), [reports, user.name]);
  return (
    <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rejected.length === 0 ? <EmptyState icon="🎉" text="Không ghi nhận thông báo mới nào" /> : rejected.map(r => (
        <div key={r.id} className="card" style={{ borderLeft: '4px solid #be123c', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', background: 'white', borderRight: '1px solid #e5e7eb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#be123c' }}>🔔 Báo cáo tài chính ca trực bị yêu cầu sửa đổi số liệu</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Ngày kê khai: <b>{fmtDate(r.date)}</b> · Doanh thu mặt/chuyển khoản: <span className="mono" style={{ fontWeight: 600 }}>{fmt(r.cashRevenue + r.transferRevenue)}</span></div>
          </div>
          <button className="btn btn-orange" style={{ padding: '8px 16px', fontSize: 12, borderRadius: '2px', fontWeight: 600 }} onClick={() => onEdit(r)}>
            ✏️ Nhập lại số liệu ngay
          </button>
        </div>
      ))}
    </div>
  );
};

// ── SHIFT FORM (Staff Cashier beverage selector and Barista raw ingredients checklist) ──
const ShiftForm = ({ user, page, onSave }) => {
  const [catalog, setCatalog] = useState(() => LS.get('lc_catalog', [
    { name: 'Cà Phê Sữa Đá Nguyên Bản', price: 25000, cat: 'coffee', active: true },
    { name: 'Cà Phê Sữa Đá Đậm', price: 30000, cat: 'coffee', active: true },
    { name: 'Cà Phê Phin Đen Đá', price: 25000, cat: 'coffee', active: true },
    { name: 'Cà Phê Phin Đen Đá Đậm', price: 25000, cat: 'coffee', active: true },
    { name: 'Bạc Xỉu Đá', price: 25000, cat: 'coffee', active: true },
    { name: 'Cà Phê Muối', price: 30000, cat: 'coffee', active: true },
    { name: 'Cà Phê Cốt Dừa', price: 30000, cat: 'coffee', active: true },
    { name: 'Espresso', price: 25000, cat: 'coffee', active: true },
    { name: 'Latte', price: 25000, cat: 'coffee', active: true },
    { name: 'Capuchino', price: 25000, cat: 'coffee', active: true },
    { name: 'Americano', price: 25000, cat: 'coffee', active: true },
    { name: 'Cà Phê Chai Original', price: 139000, cat: 'coffee', active: true },
    { name: 'Cà Phê Chai Vanilla', price: 139000, cat: 'coffee', active: true },
    { name: 'Cà Phê Chai Triple Shot', price: 179000, cat: 'coffee', active: true },
    { name: 'Sữa Tươi Trân Châu Đường Đen', price: 25000, cat: 'milk_tea', active: true },
    { name: 'Trà Sữa Lài Ngọc Trai', price: 25000, cat: 'milk_tea', active: true },
    { name: 'Hồng Trà Sữa Ngọc Trai', price: 25000, cat: 'milk_tea', active: true },
    { name: 'Cốt Dừa Cacao', price: 35000, cat: 'milk_tea', active: true },
    { name: 'Matcha Hương Xuân', price: 39000, cat: 'milk_tea', active: true },
    { name: 'Freeze Matcha Dừa Non', price: 39000, cat: 'milk_tea', active: true },
    { name: 'Freeze Matcha Dừa Xoài', price: 39000, cat: 'milk_tea', active: true },
    { name: 'Trà Sen Phủ Kem Muối', price: 35000, cat: 'tea', active: true },
    { name: 'Trà Vải Hồng Phủ Kem Muối', price: 35000, cat: 'tea', active: true },
    { name: 'Trà Nho Nhã Phủ Kem Muối', price: 35000, cat: 'tea', active: true },
    { name: 'Trà Dâu Phủ Kem Muối', price: 35000, cat: 'tea', active: true },
    { name: 'Trà Tắc / Chanh', price: 10000, cat: 'tea', active: true },
    { name: 'Trà Mãng Cầu', price: 35000, cat: 'tea', active: true },
    { name: 'Trà Mơ Xí Muội', price: 35000, cat: 'tea', active: true },
    { name: 'Trà Ổi Hồng', price: 35000, cat: 'tea', active: true },
    { name: 'Nước Ép Ổi / Xoài / Dưa Hấu', price: 20000, cat: 'juice', active: true },
    { name: 'Thơm (Nước Ép)', price: 30000, cat: 'juice', active: true },
    { name: 'Nước Ép Cam / Bưởi / Táo / Quýt', price: 35000, cat: 'juice', active: true },
    { name: 'Nước Mía Nguyên Bản', price: 15000, cat: 'juice', active: true },
    { name: 'Nước Mía Tắc', price: 20000, cat: 'juice', active: true },
    { name: 'Nước Mía Dừa', price: 20000, cat: 'juice', active: true },
    { name: 'Nước Mía Sầu Riêng', price: 30000, cat: 'juice', active: true },
    { name: 'Nước Mía Kem Muối', price: 20000, cat: 'juice', active: true },
  ]));
  const activeCatalog = useMemo(() => catalog.filter(c => c.active !== false), [catalog]);
  const [roleType, setRoleType] = useState(page === 'shift_barista' ? 'barista' : 'cashier');
  useEffect(() => { setRoleType(page === 'shift_barista' ? 'barista' : 'cashier'); }, [page]);

  // Staff check-in name picker
  const shiftStaffList = useMemo(() => {
    const saved = LS.get('lc_mgr_staff_v1', null);
    const base = Array.isArray(saved) ? saved : DEFAULT_SHIFT_STAFF;
    return base.filter(s => !EXCLUDED_SHIFT_STAFF.includes(s));
  }, []);
  const [selectedStaffName, setSelectedStaffName] = useState(user?.name || '');
  const [staffSearch, setStaffSearch] = useState('');
  const [showStaffDrop, setShowStaffDrop] = useState(false);
  const staffDropRef = React.useRef(null);

  useEffect(() => {
    if (user?.name) {
      setSelectedStaffName(user.name);
    }
  }, [user]);

  React.useEffect(() => {
    const handler = (e) => { if (staffDropRef.current && !staffDropRef.current.contains(e.target)) setShowStaffDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [date, setDate] = useState(todayStr());
  const [shift, setShift] = useState('morning');
  const [staffCount, setStaffCount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Cashier states
  const [cashRev, setCashRev] = useState('');
  const [tfRev, setTfRev] = useState('');
  const [cardRev, setCardRev] = useState('');
  const [grabRev, setGrabRev] = useState('');
  const [shopeeRev, setShopeeRev] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  
  // Search state
  const [search, setSearch] = useState('');
  const [showDrop, setShowDrop] = useState(false);

  // Barista states
  const [ingredients, setIngredients] = useState(() => LS.get('lc_ingredients', [
    { id: 'i1', name: 'Hạt Cà phê rang xay', unit: 'kg', start: 10, in: '', out: '' },
    { id: 'i2', name: 'Sữa đặc Larose hộp', unit: 'hộp', start: 24, in: '', out: '' },
    { id: 'i3', name: 'Sữa tươi DalatMilk', unit: 'l', start: 12, in: '', out: '' },
    { id: 'i4', name: 'Bột Trà xanh Matcha', unit: 'g', start: 500, in: '', out: '' },
    { id: 'i5', name: 'Trân châu đường đen', unit: 'kg', start: 5, in: '', out: '' },
  ]));

  const shiftLabels = { morning: 'Ca Sáng (06:00 - 14:00)', afternoon: 'Ca Chiều (14:00 - 22:00)' };

  // Computed values
  const totalRev = (Number(cashRev) || 0) + (Number(tfRev) || 0) + (Number(cardRev) || 0) + (Number(grabRev) || 0) + (Number(shopeeRev) || 0);
  const menuRevenue = menuItems.reduce((s, m) => s + m.qty * (m.price || 0), 0);
  const totalOrders = menuItems.reduce((s, m) => s + m.qty, 0);

  const addedNames = menuItems.map(m => m.name);
  const filteredCatalog = activeCatalog.filter(c =>
    !addedNames.includes(c.name) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const pickCatalog = (c) => {
    setMenuItems(prev => [...prev, { id: genId(), ...c, qty: 1 }]);
    setSearch(''); setShowDrop(false);
  };
  const addCustom = () => {
    setMenuItems(prev => [...prev, { id: genId(), name: '', price: 0, qty: 1, cat: 'other' }]);
    setShowDrop(false);
  };
  const updQty = (id, d) => setMenuItems(prev => prev.map(m => m.id === id ? { ...m, qty: Math.max(0, m.qty + d) } : m));
  const updPrice = (id, v) => setMenuItems(prev => prev.map(m => m.id === id ? { ...m, price: Number(v) || 0 } : m));
  const updName = (id, v) => setMenuItems(prev => prev.map(m => m.id === id ? { ...m, name: v } : m));
  const delItem = id => setMenuItems(prev => prev.filter(m => m.id !== id));

  // Barista inventory state controls
  const updIng = (id, field, val) => setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  const addIng = () => setIngredients(prev => [...prev, { id: genId(), name: '', unit: 'g', start: '', in: '', out: '' }]);
  const delIng = id => setIngredients(prev => prev.filter(i => i.id !== id));
  
  useEffect(() => { if (roleType === 'barista') LS.set('lc_ingredients', ingredients); }, [ingredients, roleType]);

  // ── AUTO-POPULATE SHIFT REVENUE FROM POS BILLING ORDERS & SHIFTS ──
  useEffect(() => {
    if (!selectedStaffName || !date || !shift || roleType !== 'cashier') return;

    // 1. Check if there is already an accumulated active shift in lc_shifts
    const allShifts = LS.get('lc_shifts', []);
    const foundShift = allShifts.find(s => 
      s.date === date && 
      s.shift === shift && 
      s.staffName === selectedStaffName &&
      s.roleType === 'cashier'
    );

    if (foundShift) {
      setCashRev(foundShift.cashRevenue || '');
      setTfRev(foundShift.transferRevenue || '');
      setCardRev(foundShift.cardRevenue || '');
      setGrabRev(foundShift.grabRevenue || '');
      setShopeeRev(foundShift.shopeeRevenue || '');
      setNote(foundShift.note || '');
      setStaffCount(foundShift.staffCount || '');
      if (foundShift.menuItems) {
        setMenuItems(foundShift.menuItems);
      }
      return;
    }

    // 2. If not found in lc_shifts, calculate in real-time from POS orders in lc_billing_orders
    const allOrders = LS.get('lc_billing_orders', []);
    const shiftOrders = allOrders.filter(o => {
      const isSameStaff = o.cashierName === selectedStaffName;
      
      // Match date & shift (handling fallback parsing for older orders)
      let oDate = o.date;
      let oShift = o.shift;
      if (!oDate && o.timestamp) {
        const parts = o.timestamp.split(', ');
        if (parts[0]) {
          const dParts = parts[0].split('/');
          if (dParts.length === 3) {
            oDate = `${dParts[2]}-${dParts[1].padStart(2, '0')}-${dParts[0].padStart(2, '0')}`;
          }
        }
        if (parts[1]) {
          const tParts = parts[1].split(':');
          const hour = Number(tParts[0]);
          oShift = hour < 14 ? 'morning' : 'afternoon';
        }
      }
      
      return isSameStaff && oDate === date && oShift === shift;
    });

    if (shiftOrders.length > 0) {
      let cash = 0, tf = 0, card = 0, grab = 0, shopee = 0;
      let itemsMap = {};

      shiftOrders.forEach(o => {
        const amt = o.discountedSubtotal || o.total || 0;
        if (o.paymentMethod === 'cash') cash += amt;
        else if (o.paymentMethod === 'transfer') tf += amt;
        else if (o.paymentMethod === 'card') card += amt;
        else if (o.paymentMethod === 'grab') grab += amt;
        else if (o.paymentMethod === 'shopee') shopee += amt;

        (o.items || []).forEach(item => {
          if (itemsMap[item.name]) {
            itemsMap[item.name].qty += item.qty;
          } else {
            itemsMap[item.name] = { ...item };
          }
        });
      });

      setCashRev(cash || '');
      setTfRev(tf || '');
      setCardRev(card || '');
      setGrabRev(grab || '');
      setShopeeRev(shopee || '');
      setMenuItems(Object.values(itemsMap));
    } else {
      setCashRev('');
      setTfRev('');
      setCardRev('');
      setGrabRev('');
      setShopeeRev('');
      setMenuItems([]);
    }
  }, [selectedStaffName, date, shift, roleType]);

  const submit = () => {
    if (!selectedStaffName) { alert('Vui lòng chọn tên nhân viên để check-in ca!'); return; }
    if (!date || !shift) { alert('Vui lòng chọn ngày giao ban và ca làm việc'); return; }
    setSaving(true);
    let s = { id: genId(), date, shift, shiftLabel: shiftLabels[shift], staffName: selectedStaffName, roleType, note, staffCount: Number(staffCount) || 0, submittedAt: new Date().toISOString() };
    
    if (roleType === 'cashier') {
      s = { ...s, orders: totalOrders, cashRevenue: Number(cashRev) || 0, transferRevenue: Number(tfRev) || 0, cardRevenue: Number(cardRev) || 0, grabRevenue: Number(grabRev) || 0, shopeeRevenue: Number(shopeeRev) || 0, totalRevenue: totalRev, menuRevenue, menuItems: menuItems.filter(m => m.qty > 0) };
    } else {
      s = { ...s, ingredients: ingredients.filter(i => i.name.trim() !== '') };
    }
    
    let shifts = LS.get('lc_shifts', []);
    const existingIdx = shifts.findIndex(item => 
      item.date === date && 
      item.shift === shift && 
      item.staffName === selectedStaffName &&
      item.roleType === roleType
    );

    if (existingIdx !== -1) {
      shifts[existingIdx] = { ...shifts[existingIdx], ...s };
    } else {
      shifts.unshift(s);
    }
    
    LS.set('lc_shifts', shifts);
    setSaving(false); onSave();
  };

  const QtyBtn = ({ onClick, label }) => (
    <button onClick={onClick} style={{ width: 28, height: 28, border: '1px solid #e2e8f0', borderRadius: '2px', background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#4b5563', display: 'flex', alignItems: 'center', justify: 'center', transition: 'border 0.1s' }} className="btn-outline">{label}</button>
  );

  return (
    <div className="fade" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
      {/* Column Left: Input shift reports */}
      <div className="card" style={{ borderRadius: '2px', border: '1px solid #e5e7eb', background: 'white', padding: '24px' }}>
        <div className="section-label">Thông tin ca bàn giao ({roleType === 'cashier' ? 'Thu Ngân' : 'Pha Chế'})</div>


        
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: '#4b5563' }}>Ngày giao nhận ca</label>
          <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} style={{ borderRadius: '2px', border: '1px solid #e5e7eb' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'start', marginBottom: 16 }}>
          <label style={{ fontSize: 12.5, fontWeight: 700, color: '#4b5563', paddingTop: 6 }}>Phiên trực ca</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(shiftLabels).map(([k, l]) => (
              <div key={k} onClick={() => setShift(k)} style={{ border: `1.5px solid ${shift === k ? '#1e40af' : '#e5e7eb'}`, borderRadius: '2px', padding: '10px 16px', cursor: 'pointer', background: shift === k ? '#eff6ff' : '#ffffff', display: 'flex', alignItems: 'center', transition: 'all 0.1s ease' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: shift === k ? '#1e40af' : '#4b5563' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="divider" />
        
        {roleType === 'cashier' ? (
          <>
            <div className="section-label">Báo cáo tổng kết dòng tiền doanh thu</div>
            {[
              ['Tiền mặt', cashRev, setCashRev],
              ['Chuyển khoản', tfRev, setTfRev],
              ['Thẻ ATM / Visa', cardRev, setCardRev],
              ['Grab Food', grabRev, setGrabRev],
              ['Shopee Food', shopeeRev, setShopeeRev]
            ].map(([lbl, val, set]) => (
              <div key={lbl} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563' }}>{lbl}</label>
                <input type="number" className="input-field mono" value={val} onChange={e => set(e.target.value)} placeholder="0" style={{ textAlign: 'right', fontWeight: 500, borderRadius: '2px', border: '1px solid #e5e7eb' }} />
              </div>
            ))}

          </>
        ) : (
          <>
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="section-label" style={{ margin: 0 }}>Báo cáo tồn kho kiểm kê cuối ca</span>
              <button className="btn btn-gray" style={{ padding: '4px 10px', fontSize: 11, borderRadius: '2px' }} onClick={addIng}>
                + Thêm Nguyên Vật Liệu
              </button>
            </div>
            {/* Headers row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 60px 60px 24px', gap: 6, padding: '10px 8px', fontSize: 9, fontWeight: 700, color: '#9ca3af', borderBottom: '2px solid #e5e7eb', marginBottom: 6, textAlign: 'right', letterSpacing: '0.04em', uppercase: 'true' }}>
              <span style={{ textAlign: 'left' }}>Tên Nguyên Liệu</span><span>Đơn Vị</span><span>Đầu Ca</span><span>Nhập Ca</span><span style={{ color: '#be123c' }}>Hao Phí</span><span>Cuối Ca</span><span/>
            </div>
            {ingredients.map(ing => (
              <div key={ing.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 60px 60px 24px', gap: 6, alignItems: 'center', padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: 12.5 }} className="table-row-hover">
                <input value={ing.name} onChange={e => updIng(ing.id, 'name', e.target.value)} placeholder="Tên NVL..." style={{ width: '100%', border: 'none', borderBottom: '1.5px solid transparent', padding: '4px 0', fontSize: 12.5, background: 'transparent' }} onFocus={e => e.target.style.borderBottom = '1.5px solid #1e40af'} onBlur={e => e.target.style.borderBottom = '1.5px solid transparent'} />
                
                <select value={ing.unit} onChange={e => updIng(ing.id, 'unit', e.target.value)} style={{ width: '100%', border: 'none', borderBottom: '1.5px solid transparent', fontSize: 12, background: 'transparent', color: '#4b5563', cursor: 'pointer', fontWeight: 600 }}>
                  {['g', 'kg', 'ml', 'l', 'cái', 'hộp', 'túi'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>

                <input type="number" className="mono" value={ing.start} onChange={e => updIng(ing.id, 'start', e.target.value)} style={{ width: '100%', border: 'none', borderBottom: '1.5px solid transparent', textAlign: 'right', padding: '4px 0', fontSize: 12, background: 'transparent', fontWeight: 500 }} placeholder="0" onFocus={e => e.target.style.borderBottom = '1.5px solid #1e40af'} onBlur={e => e.target.style.borderBottom = '1.5px solid transparent'} />
                
                <input type="number" className="mono" value={ing.in} onChange={e => updIng(ing.id, 'in', e.target.value)} style={{ width: '100%', border: 'none', borderBottom: '1.5px solid transparent', textAlign: 'right', padding: '4px 0', fontSize: 12, background: 'transparent', color: '#15803d', fontWeight: 500 }} placeholder="0" onFocus={e => e.target.style.borderBottom = '1.5px solid #15803d'} onBlur={e => e.target.style.borderBottom = '1.5px solid transparent'} />
                
                <input type="number" className="mono" value={ing.out} onChange={e => updIng(ing.id, 'out', e.target.value)} style={{ width: '100%', border: 'none', borderBottom: '1.5px solid transparent', textAlign: 'right', padding: '4px 0', fontSize: 12, background: 'transparent', color: '#be123c', fontWeight: 500 }} placeholder="0" onFocus={e => e.target.style.borderBottom = '1.5px solid #be123c'} onBlur={e => e.target.style.borderBottom = '1.5px solid transparent'} />
                
                <div className="mono" style={{ textAlign: 'right', fontWeight: 700, fontSize: 12.5, color: '#0f0f0e', padding: '4px 0' }}>{(Number(ing.start) || 0) + (Number(ing.in) || 0) - (Number(ing.out) || 0)}</div>
                
                <button onClick={() => delIng(ing.id)} style={{ width: 20, height: 20, border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1', fontSize: 15, display: 'flex', alignItems: 'center', justify: 'center' }} className="hover:text-red-700">×</button>
              </div>
            ))}
            <div style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic', marginTop: 12 }}>* Số liệu tồn cuối ca tự động kết toán = Tồn đầu ca + Hàng nhập thêm - Khấu hao sử dụng.</div>
          </>
        )}

        <div className="divider" />
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, alignItems: 'center', marginBottom: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563' }}>Nhân sự hỗ trợ trực ca</label>
          <input type="number" className="input-field mono" value={staffCount} onChange={e => setStaffCount(e.target.value)} placeholder="0" style={{ textAlign: 'right', fontWeight: 500, borderRadius: '2px', border: '1px solid #e5e7eb' }} />
        </div>
        <div className="divider" />
        <div className="section-label">NHẬT KÝ VẬN HÀNH CA LÀM VIỆC</div>
        <textarea className="input-field" value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Mô tả các vấn đề phát sinh đặc biệt, khách hàng phàn nàn, sự cố điện nước hay chuyển giao tiền mặt..." style={{ resize: 'vertical', borderRadius: '2px', border: '1px solid #e5e7eb' }} />
      </div>
      
      {/* Column Right: Profile stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card" style={{ borderRadius: '2px', border: '1px solid #e5e7eb', background: 'white', padding: '20px', borderTop: '3px solid #1e40af' }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Hồ sơ ca làm việc</div>
          <div style={{ background: '#f8fafc', borderRadius: '2px', padding: '12px 14px', marginBottom: 14, border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>PHIÊN TRỰC BÁO CÁO</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f0f0e' }}>{shiftLabels[shift]}</div>
          </div>
          
          {roleType === 'cashier' ? (
            <>
              {[
                ['Tiền mặt', Number(cashRev) || 0],
                ['Chuyển khoản', Number(tfRev) || 0],
                ['Thẻ ATM/Visa', Number(cardRev) || 0],
                ['Grab Food', Number(grabRev) || 0],
                ['Shopee Food', Number(shopeeRev) || 0]
              ].map(([l, v]) => (
                v > 0 && <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 12.5, borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#6b7280' }}>{l}:</span>
                  <span className="mono" style={{ fontWeight: 600, marginLeft: 8 }}>{fmt(v)}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid #0f0f0e', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5, fontWeight: 800, marginBottom: 12 }}>
                <span>TỔNG DOANH THU CA:</span>
                <span className="mono" style={{ color: '#1e40af', marginLeft: 8 }}>{fmt(totalRev)}</span>
              </div>

            </>
          ) : (
            <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '2px', border: '1px dashed #f59e0b', color: '#b45309', fontSize: 12, fontWeight: 600, textAlign: 'center', lineHeight: 1.5 }}>
              Hệ thống tự động thiết lập kiểm kê nguyên vật liệu cho ca Pha Chế. Vui lòng cập nhật lượng hao hụt thực phẩm.
            </div>
          )}
        </div>
        <button className="btn btn-red" style={{ width: '100%', justify: 'center', padding: '12px', fontSize: 13, borderRadius: '2px', fontWeight: 700, opacity: (saving || !selectedStaffName) ? 0.55 : 1 }} onClick={submit} disabled={saving || !selectedStaffName}>GỬI BÁO CÁO CA TRỰC</button>
      </div>
    </div>
  );
};

// ── SHIFT HISTORY (Visual indicators for completed staff shifts) ──
const ShiftHistory = ({ user }) => {
  const roleFilter = user.role === 'cashier' ? 'cashier' : user.role === 'barista' ? 'barista' : null;
  const shifts = useMemo(() => {
    const all = LS.get('lc_shifts', []);
    const filtered = roleFilter
      ? all.filter(s => s.roleType === roleFilter)
      : all.filter(s => s.staffName === user.name);
    return filtered.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [user.name, roleFilter]);
  const shiftColor = { morning: '#0284c7', afternoon: '#d97706', night: '#7c3aed' };
  const shiftBg = { morning: '#e0f2fe', afternoon: '#fef3c7', night: '#ede9fe' };

  const [expandedIds, setExpandedIds] = React.useState(new Set());
  const toggleExpand = (id) => setExpandedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const emptyMsg = roleFilter === 'cashier' ? 'Chưa có ca thu ngân nào được ghi nhận' : roleFilter === 'barista' ? 'Chưa có ca pha chế nào được ghi nhận' : 'Chưa ghi nhận bản tổng kết ca làm việc nào của bạn';
  if (shifts.length === 0) return <EmptyState text={emptyMsg} />;
  
  return (
    <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {shifts.map((s, idx) => {
        const isExpanded = expandedIds.has(s.id);
        const ings = s.ingredients || [];
        const hasMore = ings.length > 3;
        return (
        <div key={s.id} className="card" style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', padding: '20px 24px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ background: shiftBg[s.shift] || '#f0f2f5', color: shiftColor[s.shift] || '#374151', fontSize: 9.5, fontWeight: 800, padding: '3.5px 10px', borderRadius: '2px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {s.shift === 'morning' ? 'Ca Sáng' : s.shift === 'afternoon' ? 'Ca Chiều' : 'Ca Tối'}
            </span>
            <span className="mono" style={{ fontWeight: 700, fontSize: 13.5, color: '#0f0f0e' }}>Ngày: {fmtDate(s.date)}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: s.roleType === 'barista' ? '#d97706' : '#1e40af', background: s.roleType === 'barista' ? '#fffbeb' : '#eff6ff', border: `1px solid ${s.roleType === 'barista' ? '#fed7aa' : '#bfdbfe'}`, padding: '3.5px 10px', borderRadius: '2px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {s.roleType === 'barista' ? 'Pha Chế' : 'Thu Ngân'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '3px 10px', borderRadius: '2px' }}>{s.staffName || '—'}</span>
            <span className="mono" style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto', fontWeight: 600 }}>Nộp lúc: {new Date(s.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          {s.roleType === 'cashier' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 12, alignItems: 'start' }}>
              {/* Left: Revenue breakdown */}
              <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '2px', padding: '14px 16px' }}>
                <div style={{ fontSize: 9.5, color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>THÔNG TIN KẾT CA</div>
                {[
                  ['Tiền mặt', s.cashRevenue],
                  ['Chuyển khoản', s.transferRevenue],
                  ['Thẻ ATM / Visa', s.cardRevenue],
                  ['Grab Food', s.grabRevenue],
                  ['Shopee Food', s.shopeeRevenue],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12.5 }}>
                    <span style={{ color: '#475569' }}>{l}</span>
                    <span className="mono" style={{ fontWeight: 600, color: (v || 0) > 0 ? '#1e40af' : '#9ca3af' }}>{fmt(v || 0)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '2px solid #0f0f0e', fontSize: 13.5, fontWeight: 800 }}>
                  <span style={{ color: '#0f172a' }}>TỔNG CA</span>
                  <span className="mono" style={{ color: '#1e40af' }}>{fmt(s.totalRevenue || 0)}</span>
                </div>
                {/* Drink items if any */}
                {(s.menuItems || []).filter(m => m.qty > 0).length > 0 && (
                  <>
                    <div style={{ fontSize: 9.5, color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 14, marginBottom: 8 }}>THỐNG KÊ ĐỒ UỐNG BÁN RA</div>
                    {(s.menuItems || []).filter(m => m.qty > 0).map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #f1f5f9', color: '#4b5563' }}>
                        <span>{m.name} <span style={{ color: '#9ca3af', fontWeight: 600 }}>×{m.qty}</span></span>
                        <span className="mono" style={{ fontWeight: 600 }}>{fmt(m.qty * (m.price || 0))}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
              {/* Right: Staff + Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#f8fafc', borderRadius: '2px', padding: '12px 14px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 9.5, color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>NHÂN SỰ TRỰC CA</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: '#475569' }}>{s.staffCount || 0} <span style={{ fontSize: 12, fontWeight: 600 }}>người</span></div>
                </div>
                {s.note && (
                  <div style={{ padding: '10px 14px', background: '#fff', borderRadius: '2px', fontSize: 12, color: '#475569', border: '1px solid #e5e7eb', borderLeft: '3px solid #d1d5db', lineHeight: 1.6 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>NHẬT KÝ VẬN HÀNH</div>
                    {s.note}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', borderRadius: '2px', padding: '14px 16px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, marginBottom: 10, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Kiểm kê tồn kho cuối ca ({ings.length} mặt hàng nguyên liệu)</div>
              <div style={{ display: 'grid', gap: 6 }}>
                {ings.slice(0, 3).map((ing, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, borderBottom: '1px solid #f1f5f9', paddingBottom: 5 }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>{ing.name}</span>
                    <span style={{ color: '#6b7280' }}>Tồn cuối ca: <strong className="mono" style={{ color: '#0f0f0e', fontWeight: 700 }}>{(Number(ing.start) || 0) + (Number(ing.in) || 0) - (Number(ing.out) || 0)} {ing.unit || ''}</strong></span>
                  </div>
                ))}
                {isExpanded && ings.slice(3).map((ing, i) => (
                  <div key={'ex-' + i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, borderBottom: '1px solid #f1f5f9', paddingBottom: 5 }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>{ing.name}</span>
                    <span style={{ color: '#6b7280' }}>Tồn cuối ca: <strong className="mono" style={{ color: '#0f0f0e', fontWeight: 700 }}>{(Number(ing.start) || 0) + (Number(ing.in) || 0) - (Number(ing.out) || 0)} {ing.unit || ''}</strong></span>
                  </div>
                ))}
                {isExpanded && s.note && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: '#fff', borderRadius: '2px', fontSize: 12, color: '#475569', borderLeft: '3px solid #d1d5db', lineHeight: 1.5 }}>
                    <b>Nhật ký vận hành:</b> {s.note}
                  </div>
                )}
                {hasMore && (
                  <button onClick={() => toggleExpand(s.id)}
                    style={{ marginTop: 8, background: 'none', border: '1px solid #e5e7eb', borderRadius: '2px', padding: '7px 14px', fontSize: 12, color: '#1e40af', fontWeight: 700, cursor: 'pointer', width: '100%', textAlign: 'center', letterSpacing: '0.02em' }}
                    onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}>
                    {isExpanded ? '▲ Thu gọn' : `... Xem thêm ${ings.length - 3} nguyên liệu khác`}
                  </button>
                )}
                {!hasMore && s.note && (
                  <div style={{ marginTop: 8, padding: '10px 14px', background: '#fff', borderRadius: '2px', fontSize: 12, color: '#475569', borderLeft: '3px solid #d1d5db', lineHeight: 1.5 }}>
                    <b>Nhật ký vận hành:</b> {s.note}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
};

// ── DETAILED REPORT TABLE (Zebra stripes, sticky headers, cell border right) ──
const DetailedReport = ({ reports }) => {
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = useMemo(() => reports.filter(r => {
    const matchDept = filterDept === 'All' || r.createdByRole === filterDept || (filterDept === 'manager' && r.createdByRole === 'manager');
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchDept && matchStatus;
  }).sort((a, b) => b.date.localeCompare(a.date)), [reports, filterDept, filterStatus]);

  return (
    <div className="fade">
      {/* Search Filter Box Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, background: 'white', padding: 16, borderRadius: '2px', border: '1px solid #e5e7eb' }}>
        <div style={{ flex: 1, display: 'flex', gap: 12 }}>
          <select className="input-field" style={{ width: 220, borderRadius: '2px', border: '1px solid #e5e7eb' }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="All">Tất cả bộ phận lập</option>
            <option value="manager">Quản Lý (Thu ngân)</option>
            <option value="staff">Nhân Viên (Pha chế)</option>
          </select>
          <select className="input-field" style={{ width: 220, borderRadius: '2px', border: '1px solid #e5e7eb' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">Tất cả trạng thái duyệt</option>
            <option value="approved">Đã duyệt phê duyệt</option>
            <option value="pending">Chờ thẩm định tài chính</option>
            <option value="rejected">Cần điều chỉnh số liệu</option>
          </select>
        </div>
        <button className="btn btn-gray" style={{ height: 38, borderRadius: '2px', fontWeight: 600 }} onClick={() => { setFilterDept('All'); setFilterStatus('All'); }}>Xoá Bộ Lọc</button>
      </div>

      {/* Main Zebra striped table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e5e7eb', background: 'white', borderRadius: '2px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px 18px', textAlign: 'left', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.2, borderRight: '1px solid #e5e7eb' }}>Ngày Lập</th>
              <th style={{ padding: '12px 18px', textAlign: 'left', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.2, borderRight: '1px solid #e5e7eb' }}>Người Kê Khai</th>
              <th style={{ padding: '12px 18px', textAlign: 'left', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.2, borderRight: '1px solid #e5e7eb' }}>Bộ Phận</th>
              <th style={{ padding: '12px 18px', textAlign: 'left', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.2, borderRight: '1px solid #e5e7eb' }}>Nội Dung / Nhật Ký</th>
              <th style={{ padding: '12px 18px', textAlign: 'right', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.2, borderRight: '1px solid #e5e7eb' }}>Doanh Thu</th>
              <th style={{ padding: '12px 18px', textAlign: 'right', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.2, borderRight: '1px solid #e5e7eb' }}>Lợi Nhuận Ròng</th>
              <th style={{ padding: '12px 18px', textAlign: 'center', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.2 }}>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((r, idx) => {
              const { rev, profit } = calcR(r);
              return (
                <tr 
                  key={r.id} 
                  style={{ borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid #f1f5f9', background: idx % 2 === 0 ? 'transparent' : '#f8fafc', transition: 'background 0.1s' }} 
                  className="table-row-hover"
                >
                  <td style={{ padding: '12px 18px', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #e5e7eb' }}>{fmtDate(r.date)}</td>
                  <td style={{ padding: '12px 18px', fontWeight: 600, borderRight: '1px solid #e5e7eb' }}>{r.createdBy}</td>
                  <td style={{ padding: '12px 18px', color: '#64748b', borderRight: '1px solid #e5e7eb' }}>{r.createdByRole === 'manager' ? 'Thu ngân' : 'Pha chế'}</td>
                  <td style={{ padding: '12px 18px', color: '#475569', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #e5e7eb' }} title={r.note}>{r.note || 'Khai báo tài chính doanh thu ngày'}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 600, color: '#1e40af', borderRight: '1px solid #e5e7eb' }} className="mono">{fmt(rev)}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: profit >= 0 ? '#15803d' : '#be123c', borderRight: '1px solid #e5e7eb' }} className="mono">{fmt(profit)}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'center' }}><StatusBadge status={r.status} /></td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontWeight: 500 }}>Không tìm thấy báo cáo tài chính nào phù hợp với bộ lọc tìm kiếm</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── MAIN CORE APP ──
const App = () => {
  const [user, setUser] = useState(() => LS.get('lc_user', null));
  const [reports, setReports] = useState(() => LS.get('lc_reports', []));
  const [comments, setComments] = useState(() => LS.get('lc_comments', []));
  const [page, setPage] = useState('dashboard');
  const [editReport, setEditReport] = useState(null);

  const resetDemoData = () => {
    localStorage.removeItem('lc_seeded_v4');
    const reps = makeSeed();
    LS.set('lc_reports', reps);
    const rejected = reps.find(r => r.status === 'rejected');
    const newComments = rejected ? [{ id: genId(), reportId: rejected.id, content: 'Chi phí điện nước cao hơn bình thường. Vui lòng kiểm tra lại hoá đơn và cập nhật số liệu chính xác.', createdBy: 'Trần Thị Bình', createdAt: '2026-05-11T09:30:00' }] : [];
    LS.set('lc_comments', newComments);
    
    // Seed Accountant Portal tables
    LS.set('lc_inventory', makeInventorySeed());
    LS.set('lc_inventory_logs', makeInventoryLogsSeed());
    LS.set('lc_invoices', makeInvoiceSeed());
    LS.set('lc_debts', makeDebtSeed());
    LS.set('lc_cashbook', makeCashbookSeed());
    
    const shifts = makeShiftsSeed(reps).filter(s => s.date !== '2026-05-21');
    shifts.unshift({
      id: genId(),
      date: '2026-05-21',
      shift: 'morning',
      staffName: 'Nguyễn Văn Nam',
      roleType: 'cashier',
      cashRevenue: 978500,
      transferRevenue: 1651800,
      cardRevenue: 858000,
      grabRevenue: 633000,
      shopeeRevenue: 0,
      totalRevenue: 978500 + 1651800 + 858000 + 633000,
      orders: 98,
      staffCount: 2,
      note: 'Ca sáng đông khách, bàn giao dòng tiền khớp.',
      submittedAt: '2026-05-21T12:05:00'
    });
    shifts.unshift({
      id: genId(),
      date: '2026-05-21',
      shift: 'afternoon',
      staffName: 'Trần Minh Tâm',
      roleType: 'cashier',
      cashRevenue: 1000000,
      transferRevenue: 2000000,
      cardRevenue: 800000,
      grabRevenue: 500000,
      shopeeRevenue: 0,
      totalRevenue: 1000000 + 2000000 + 800000 + 500000,
      orders: 102,
      staffCount: 2,
      note: 'Ca chiều hoạt động tốt, đã thực hiện kết ca tổng hợp.',
      submittedAt: '2026-05-21T22:00:00'
    });
    LS.set('lc_shifts', shifts);
    
    LS.set('lc_recon_logs', []);
    // Seed Staff Portal tables
    LS.set('lc_schedule', makeScheduleSeed());
    LS.set('lc_incidents', makeIncidentsSeed());
    
    localStorage.setItem('lc_seeded_v4', '1');
    setReports(reps);
    setComments(newComments);
    alert('🎲 Đã cập nhật và làm mới toàn bộ số liệu doanh thu ngẫu nhiên mới thành công!');
  };

  useEffect(() => { LS.set('lc_reports', reports); }, [reports]);
  useEffect(() => { LS.set('lc_comments', comments); }, [comments]);

  const login = (u) => { 
    LS.set('lc_user', u); 
    setUser(u); 
    const defPage = { director: 'dashboard', accountant: 'dashboard', manager: 'report', staff: 'shift_cashier', cashier: 'shift_cashier', barista: 'shift_barista' };
    setPage(defPage[u.role] || 'dashboard');
  };

  const saveReport = (rep) => {
    setReports(prev => { const exists = prev.find(r => r.id === rep.id); return exists ? prev.map(r => r.id === rep.id ? rep : r) : [rep, ...prev]; });
    setEditReport(null);
    setPage('history');
  };

  const updateReport = (rep, changes, commentText) => {
    const user2 = user;
    setReports(prev => prev.map(r => r.id === rep.id ? { ...r, ...changes, reviewedBy: user2.name } : r));
    if (commentText) setComments(prev => [...prev, { id: genId(), reportId: rep.id, content: commentText, createdBy: user2.name, createdAt: new Date().toISOString() }]);
  };

  const handleEdit = (rep) => { setEditReport(rep); setPage('report'); };

  const pendingCount = useMemo(() => reports.filter(r => r.status === 'pending').length, [reports]);
  const rejectCount = useMemo(() => reports.filter(r => r.createdBy === user?.name && r.status === 'rejected').length, [reports, user?.name]);

  if (!user) return <LoginPage onLogin={login} />;

  const content = () => {
    if (page === 'dashboard') return <Dashboard reports={reports} onResetData={resetDemoData} />;
    if (page === 'detailed_report') return <DetailedReport reports={reports} />;
    if (page === 'report') return <ReportForm user={user} editReport={editReport} onSave={saveReport} onCancel={editReport ? () => { setEditReport(null); setPage('history'); } : null} />;
    if (page === 'history') return <ReportHistory user={user} reports={reports} comments={comments} onEdit={handleEdit} />;
    if (page === 'review') return <ReviewList reports={reports} comments={comments} onUpdate={updateReport} />;
    if (page === 'summary') return <MonthlySummary reports={reports} />;
    if (page === 'notify') return <Notifications user={user} reports={reports} onEdit={handleEdit} />;
    if (page === 'shift' || page === 'shift_cashier' || page === 'shift_barista') return <ShiftForm user={user} page={page} onSave={() => setPage('shift_history')} />;
    if (page === 'shift_history') return <ShiftHistory user={user} />;
    
    // Accountant Portal views
    if (page === 'acc_reconcile') return <AccReconcile />;
    if (page === 'acc_inventory') return <AccInventory />;
    if (page === 'acc_invoices') return <AccInvoices />;
    if (page === 'acc_debts') return <AccDebts />;
    if (page === 'acc_cashbook') return <AccCashbook />;
    if (page === 'acc_tax') return <AccTax />;
    // Staff Portal views
    if (page === 'staff_schedule') return <StaffSchedule user={user} />;
    // Manager extra views
    if (page === 'mgr_schedule')    return <MgrShiftSchedule />;
    if (page === 'mgr_staff')       return <MgrStaffList />;
    if (page === 'mgr_performance') return <MgrPerformance reports={reports} />;
    if (page === 'mgr_inventory_alert') return <MgrInventoryAlert />;
    if (page === 'mgr_menu')        return <MgrMenu />;
    
    return null;
  };



  return (
    <Layout user={user} page={page} setPage={setPage} pendingCount={pendingCount} rejectCount={rejectCount}>
      {content()}
    </Layout>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);