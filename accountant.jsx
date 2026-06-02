import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scale, Package, Receipt, Coins, Landmark, Percent,
  ArrowRight, ArrowDownRight, ArrowUpRight, Search, Plus, Trash2, Check, AlertTriangle, FileText, CheckCircle2, ShieldAlert, BadgeHelp, Printer, Download, Filter, RefreshCw
} from 'lucide-react';

// ── CONSTANTS & HELPERS ──
export const fmt = n => new Intl.NumberFormat('vi-VN').format(n || 0) + ' ₫';
export const fmtK = n => { if (!n) return '0'; if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'; if (n >= 1e3) return Math.round(n / 1e3) + 'K'; return '' + n; };
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const fmtDate = d => { if (!d) return ''; const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
export const genId = () => Math.random().toString(36).slice(2, 9);
export const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); if (v == null) return d; const parsed = JSON.parse(v); return parsed != null ? parsed : d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ── SEEDING HELPERS FOR ACCOUNTANT PORTAL ──
export const makeInventorySeed = () => [
  { id: 'inv-1', name: 'Hạt Cà Phê Arabica Colombia (Nhập Khẩu)', type: 'import', code: 'NK-ARA-COL', unit: 'kg', quantity: 180, minStock: 50, unitPrice: 320000, supplier: 'Andes Coffee Co.', origin: 'Colombia' },
  { id: 'inv-2', name: 'Máy Pha Espresso Nuova Simonelli (Nhập Khẩu)', type: 'import', code: 'NK-EQ-ITA', unit: 'cái', quantity: 3, minStock: 1, unitPrice: 85000000, supplier: 'Simonelli Group', origin: 'Italy' },
  { id: 'inv-3', name: 'Sữa Đặc Vinamilk Tài Lộc', type: 'standard', code: 'DOM-MILK', unit: 'hộp', quantity: 450, minStock: 100, unitPrice: 16500, supplier: 'Vinamilk', origin: 'Việt Nam' },
  { id: 'inv-4', name: 'Ly Giấy Lee\'s Coffee 12oz', type: 'standard', code: 'DOM-CUP12', unit: 'cái', quantity: 2400, minStock: 500, unitPrice: 1200, supplier: 'Bao Bì Xanh', origin: 'Việt Nam' },
  { id: 'inv-5', name: 'Hạt Cà Phê Robusta Buôn Ma Thuột', type: 'standard', code: 'DOM-ROB-BMT', unit: 'kg', quantity: 320, minStock: 80, unitPrice: 135000, supplier: 'Đắk Lắk Farm', origin: 'Việt Nam' }
];

export const makeInventoryLogsSeed = () => [
  { id: 'log-1', itemId: 'inv-1', itemName: 'Hạt Cà Phê Arabica Colombia (Nhập Khẩu)', type: 'import_in', quantity: 200, date: '2026-05-18', note: 'Nhập khẩu chính ngạch cảng Cát Lái', performedBy: 'Trần Thị Bình', customsCode: 'HQ-102938-COL', customsTax: 6400000 },
  { id: 'log-2', itemId: 'inv-3', itemName: 'Sữa Đặc Vinamilk Tài Lộc', type: 'domestic_in', quantity: 500, date: '2026-05-19', note: 'Nhập kho định kỳ từ nhà phân phối', performedBy: 'Trần Thị Bình' },
  { id: 'log-3', itemId: 'inv-1', itemName: 'Hạt Cà Phê Arabica Colombia (Nhập Khẩu)', type: 'out', quantity: 20, date: '2026-05-20', note: 'Xuất kho cho các chi nhánh pha chế', performedBy: 'Trần Thị Bình' },
  { id: 'log-4', itemId: 'inv-4', itemName: 'Ly Giấy Lee\'s Coffee 12oz', type: 'out', quantity: 600, date: '2026-05-21', note: 'Xuất kho phục vụ quầy bar', performedBy: 'Trần Thị Bình' }
];

export const makeInvoiceSeed = () => [
  { id: 'invc-1', number: '0000412', date: '2026-05-18', type: 'in', partnerName: 'Công ty TNHH Xuất Nhập Khẩu Andes', taxCode: '0314892749', amount: 64000000, taxRate: 10, totalAmount: 70400000, status: 'verified', checkNote: 'Chữ ký số hợp lệ. Tra cứu Tổng cục Thuế hoạt động bình thường.' },
  { id: 'invc-2', number: '0000413', date: '2026-05-19', type: 'in', partnerName: 'Công ty Cổ phần Sữa Việt Nam', taxCode: '0300588569', amount: 8250000, taxRate: 8, totalAmount: 8910000, status: 'verified', checkNote: 'Hóa đơn gốc khớp mã XML cơ quan thuế.' },
  { id: 'invc-3', number: '0008512', date: '2026-05-20', type: 'out', partnerName: 'Khách hàng mua sỉ Coffee Beans', taxCode: '0108927491', amount: 15000000, taxRate: 10, totalAmount: 16500000, status: 'issued', checkNote: 'Đã ký số phát hành và gửi email tự động.' },
  { id: 'invc-4', number: '0000591', date: '2026-05-21', type: 'in', partnerName: 'Cơ sở In ấn Bao Bì Phú Quốc (Nghi vấn)', taxCode: '039871625X', amount: 2800000, taxRate: 10, totalAmount: 3080000, status: 'invalid', checkNote: 'Cảnh báo: Mã số thuế tạm ngừng hoạt động hoặc không tồn tại trên cổng thông tin!' },
];

export const makeDebtSeed = () => [
  { id: 'debt-1', partnerName: 'Simonelli Group Italy', type: 'AP', amount: 255000000, paid: 170000000, dueDate: '2026-06-15', status: 'within_term', note: 'Tiền máy pha Espresso nhập khẩu đợt 2', bankAccount: 'IBAN IT60 X054 2811 1010 0000 0123 456 – Intesa Sanpaolo', paymentTermDays: 60, history: [{ date: '2026-05-15', amount: 170000000, note: 'Thanh toán đợt 1 (chuyển khoản)' }] },
  { id: 'debt-2', partnerName: 'Nhà PP Sữa Hùng Phát', type: 'AP', amount: 14500000, paid: 14500000, dueDate: '2026-05-20', status: 'within_term', note: 'Đã hoàn tất thanh toán tiền sữa tháng 5', bankAccount: '1234 5678 9012 – Vietcombank Chi nhánh Bình Dương', paymentTermDays: 30, history: [{ date: '2026-05-20', amount: 14500000, note: 'Chuyển khoản thanh toán toàn bộ' }] },
  { id: 'debt-3', partnerName: 'Đại lý phân phối Coffee Sỉ Quận 1', type: 'AR', amount: 48000000, paid: 20000000, dueDate: '2026-05-10', status: 'overdue', note: 'Công nợ hạt cà phê giao sỉ đại lý chưa trả hết', bankAccount: '9876 5432 1098 – ACB Chi nhánh Quận 1', paymentTermDays: 45, history: [{ date: '2026-05-09', amount: 20000000, note: 'Đại lý đặt cọc trước' }] },
  { id: 'debt-4', partnerName: 'Khách sạn Rex Saigon', type: 'AR', amount: 32000000, paid: 0, dueDate: '2026-05-28', status: 'within_term', note: 'Đơn hàng cung cấp cà phê sự kiện', bankAccount: '5678 9012 3456 – BIDV Chi nhánh TP.HCM', paymentTermDays: 30, history: [] }
];

export const makeCashbookSeed = () => [
  { id: 'cb-1', date: '2026-05-18', type: 'payment', method: 'transfer', category: 'Chi mua nguyên liệu NK', amount: 70400000, note: 'Thanh toán hóa đơn Andes Coffee 0000412', performedBy: 'Trần Thị Bình' },
  { id: 'cb-2', date: '2026-05-19', type: 'payment', method: 'transfer', category: 'Chi phí cố định', amount: 14500000, note: 'Thanh toán tiền sữa Hùng Phát', performedBy: 'Trần Thị Bình' },
  { id: 'cb-3', date: '2026-05-20', type: 'receipt', method: 'transfer', category: 'Doanh thu bán sỉ', amount: 16500000, note: 'Khách hàng thanh toán hóa đơn 0008512', performedBy: 'Trần Thị Bình' },
  { id: 'cb-4', date: '2026-05-21', type: 'receipt', method: 'cash', category: 'Bàn giao doanh thu quán', amount: 3500000, note: 'Bàn giao doanh thu tiền mặt ca ngày 21/05 (phần lẻ dưới 5tr)', performedBy: 'Lê Văn Cường' }
];

export const makeShiftsSeed = (reports) => {
  // Tạo ca trực tương ứng với các báo cáo trong reports để có dữ liệu đối chiếu
  const shifts = [];
  reports.forEach(r => {
    const { rev } = calcR(r);
    // Chia đôi doanh thu cho ca sáng và ca chiều
    const morningRev = Math.floor(rev * 0.48);
    const afternoonRev = rev - morningRev;
    
    // Đôi khi tạo lệch 1 chút (ví dụ 10% cơ hội lệch 20k, 50k)
    let isDiscrepancy = false;
    let discrepancyAmount = 0;
    if (r.date === '2026-05-20' || r.date === '2026-05-15') {
      isDiscrepancy = true;
      discrepancyAmount = r.date === '2026-05-20' ? -35000 : 50000;
    }

    shifts.push({
      id: genId(),
      date: r.date,
      shift: 'morning',
      staffName: 'Nguyễn Văn Nam',
      roleType: 'cashier',
      totalRevenue: morningRev,
      orders: Math.floor(morningRev / 42000),
      staffCount: 2,
      note: 'Ca sáng hoạt động bình thường, không phát sinh sự cố.',
      submittedAt: r.date + 'T12:30:00'
    });

    shifts.push({
      id: genId(),
      date: r.date,
      shift: 'afternoon',
      staffName: 'Trần Minh Tâm',
      roleType: 'cashier',
      totalRevenue: afternoonRev + discrepancyAmount,
      orders: Math.floor(afternoonRev / 42000),
      staffCount: 2,
      note: isDiscrepancy ? `Ca chiều có chênh lệch tiền mặt do thối nhầm tiền lẻ cho khách.` : 'Ca chiều bàn giao quỹ an toàn.',
      submittedAt: r.date + 'T22:15:00'
    });
  });
  return shifts;
};

// Helper để tính toán lại doanh thu exp/profit giống app.jsx
const calcR = r => {
  const rev = (r.cashRevenue || 0) + (r.transferRevenue || 0);
  const exp = (r.goodsCost || 0) + (r.fixedExpenses || []).reduce((s, e) => s + (e.amount || 0), 0) + (r.otherExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  return { rev, exp, profit: rev - exp };
};


// ── 1. 🔍 ĐỐI CHIẾU DOANH THU (AccReconcile) ──
export const AccReconcile = () => {
  const [reports, setReports] = useState(() => LS.get('lc_reports', []));
  const [shifts, setShifts] = useState(() => LS.get('lc_shifts', []));
  const [reconLogs, setReconLogs] = useState(() => LS.get('lc_recon_logs', []));
  
  const [note, setNote] = useState('');
  const [activeDate, setActiveDate] = useState('');
  const [reconcilingItem, setReconcilingItem] = useState(null);

  // Sync state with localStorage changes
  useEffect(() => {
    const handleStorage = () => {
      setReports(LS.get('lc_reports', []));
      setShifts(LS.get('lc_shifts', []));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Tổng hợp dữ liệu đối chiếu theo từng ngày
  const reconData = useMemo(() => {
    const dates = Array.from(new Set([
      ...reports.map(r => r.date),
      ...shifts.map(s => s.date)
    ])).sort((a, b) => b.localeCompare(a));

    return dates.map(d => {
      const rep = reports.find(r => r.date === d);
      const dayShifts = shifts.filter(s => s.date === d && s.roleType === 'cashier');
      
      const managerRev = rep ? (rep.cashRevenue || 0) + (rep.transferRevenue || 0) : 0;
      const cashierRev = dayShifts.reduce((s, sh) => s + (sh.totalRevenue || 0), 0);
      const diff = managerRev - cashierRev;
      
      const log = reconLogs.find(l => l.date === d);

      return {
        date: d,
        managerRev,
        cashierRev,
        diff,
        status: log ? 'reconciled' : diff === 0 ? 'matched' : 'discrepancy',
        log,
        repId: rep?.id
      };
    });
  }, [reports, shifts, reconLogs]);

  const handleStartReconcile = (item) => {
    setReconcilingItem(item);
    setNote(item.log ? item.log.note : '');
  };

  const handleSaveReconcile = () => {
    if (!reconcilingItem) return;
    const newLogs = [...reconLogs.filter(l => l.date !== reconcilingItem.date)];
    newLogs.push({
      date: reconcilingItem.date,
      reconciledAt: new Date().toISOString(),
      reconciledBy: LS.get('lc_user', { name: 'Kế Toán Viên' }).name,
      note: note.trim() || 'Đối chiếu số liệu khớp hoàn toàn'
    });
    
    LS.set('lc_recon_logs', newLogs);
    setReconLogs(newLogs);
    
    // Nếu có báo cáo tương ứng và chênh lệch bằng 0, tự động cập nhật trạng thái duyệt của báo cáo đó thành approved nếu đang chờ duyệt
    if (reconcilingItem.repId) {
      const updatedReps = reports.map(r => {
        if (r.id === reconcilingItem.repId && r.status === 'pending' && reconcilingItem.diff === 0) {
          return { ...r, status: 'approved', reviewedBy: LS.get('lc_user', { name: 'Kế Toán Viên' }).name, reviewedAt: new Date().toISOString() };
        }
        return r;
      });
      LS.set('lc_reports', updatedReps);
      setReports(updatedReps);
      // Phát đi sự kiện storage nội bộ để các view khác trong app.jsx cập nhật tức thời
      window.dispatchEvent(new Event('storage'));
    }

    setReconcilingItem(null);
    setNote('');
    alert(`✓ Đã xác nhận đối chiếu thành công ngày ${fmtDate(reconcilingItem.date)}!`);
  };

  return (
    <div className="fade space-y-6">
      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f0f0e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          Đối Chiếu Doanh Thu Đa Chiều (Quản Lý vs Ca Thu Ngân)
        </h2>
        <p style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.5 }}>
          Hệ thống tự động so khớp tổng số liệu báo cáo doanh thu từ <b>Quản Lý Quán</b> với tổng số tiền bàn giao cuối ca từ <b>Thu Ngân</b>.
          Phát hiện sai sót chênh lệch tức thời để thực hiện điều chỉnh hoặc phê duyệt nhanh.
        </p>
      </div>

      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', background: '#fafafa', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>Danh Sách Bảng Đối Chiếu Số Liệu Hàng Ngày</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb', fontSize: 11, fontWeight: 700, color: '#64748b' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>NGÀY BÁO CÁO</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>QUẢN LÝ KHAI BÁO</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>CA THU NGÂN NỘP</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>CHÊNH LỆCH</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>TRẠNG THÁI</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {reconData.map((item, idx) => {
              const statusColors = {
                reconciled: ['#d1fae5', '#065f46', 'Đã Đối Chiếu'],
                matched: ['#eff6ff', '#1e40af', 'Khớp Số Liệu'],
                discrepancy: ['#fee2e2', '#991b1b', 'Lệch Số Liệu']
              };
              const [bg, col, text] = statusColors[item.status];
              return (
                <tr key={item.date} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'transparent' : '#f8fafc' }} className="table-row-hover">
                  <td style={{ padding: '12px 8px', fontWeight: 700, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{fmtDate(item.date)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }} className="mono">{fmt(item.managerRev)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }} className="mono">{fmt(item.cashierRev)}</td>
                  <td style={{ 
                    padding: '12px 8px', 
                    textAlign: 'right', 
                    fontWeight: 700, 
                    color: item.diff === 0 ? '#15803d' : '#be123c',
                    borderRight: '1px solid #e5e7eb',
                    whiteSpace: 'nowrap'
                  }} className="mono">
                    {item.diff > 0 ? `+${fmt(item.diff)}` : item.diff < 0 ? `-${fmt(Math.abs(item.diff))}` : '0 ₫'}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                    <span style={{ background: bg, color: col, padding: '2.5px 8px', borderRadius: '2px', fontSize: 10.5, fontWeight: 700, border: `1.5px solid ${col}44`, whiteSpace: 'nowrap', display: 'inline-block' }}>
                      {text}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button 
                      className={`btn ${item.status === 'reconciled' ? 'btn-gray' : 'btn-blue'}`}
                      style={{ padding: '3.5px 10px', fontSize: 11, borderRadius: '2px', height: 26, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}
                      onClick={() => handleStartReconcile(item)}
                    >
                      {item.status === 'reconciled' ? 'Xem Ghi Chú' : 'Xác Nhận Đối Chiếu'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {reconcilingItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="fade" style={{ background: 'white', padding: 24, borderRadius: '2px', width: '100%', maxWidth: 460, border: '1.5px solid #0f0f0e', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f0f0e', marginBottom: 12, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>
              {reconcilingItem.log ? 'CHI TIẾT ĐỐI CHIẾU' : 'XÁC NHẬN ĐỐI CHIẾU SỐ LIỆU'} NGÀY {fmtDate(reconcilingItem.date)}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', padding: 10, border: '1.5px solid #e5e7eb', borderRadius: '2px' }}>
                <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>QUẢN LÝ BÁO CÁO</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }} className="mono">{fmt(reconcilingItem.managerRev)}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: 10, border: '1.5px solid #e5e7eb', borderRadius: '2px' }}>
                <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700 }}>CA THU NGÂN NỘP</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }} className="mono">{fmt(reconcilingItem.cashierRev)}</div>
              </div>
            </div>

            <div style={{ 
              background: reconcilingItem.diff === 0 ? '#f0fdf4' : '#fef2f2',
              color: reconcilingItem.diff === 0 ? '#15803d' : '#991b1b',
              padding: 10, border: `1px solid ${reconcilingItem.diff === 0 ? '#bbf7d0' : '#fecaca'}`, borderRadius: '2px', fontSize: 12, fontWeight: 600, marginBottom: 16
            }}>
              Chênh lệch số liệu: <b className="mono">{reconcilingItem.diff === 0 ? 'Khớp hoàn hảo (0 ₫)' : fmt(reconcilingItem.diff)}</b>
            </div>

            {reconcilingItem.log && (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#78350f', padding: '10px 12px', borderRadius: '2px', fontSize: 11.5, marginBottom: 16 }}>
                <div>Người đối chiếu: <b>{reconcilingItem.log.reconciledBy}</b></div>
                <div style={{ marginTop: 2 }}>Thời gian: <b>{new Date(reconcilingItem.log.reconciledAt).toLocaleString('vi-VN')}</b></div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6 }}>
                {reconcilingItem.log ? 'Ghi chú đối chiếu' : 'Nhập nội dung xử lý chênh lệch / Ghi chú đối chiếu'}
              </label>
              <textarea 
                className="input-field" 
                rows={3} 
                style={{ borderRadius: '2px', border: '1.5px solid #e5e7eb' }} 
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Nhập lý do chênh lệch hoặc biên bản bàn giao ngân quỹ..."
                disabled={!!reconcilingItem.log}
              />
            </div>

            <div style={{ display: 'flex', justify: 'flex-end', gap: 10 }}>
              <button className="btn btn-gray" style={{ borderRadius: '2px', height: 34, fontWeight: 600 }} onClick={() => setReconcilingItem(null)}>Đóng</button>
              {!reconcilingItem.log && (
                <button className="btn btn-blue" style={{ borderRadius: '2px', height: 34, fontWeight: 600 }} onClick={handleSaveReconcile}>
                  Xác Nhận Lưu Sổ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ── 2. 📦 QUẢN LÝ KHO & XNK (AccInventory) ──
export const AccInventory = () => {
  const [items, setItems] = useState(() => LS.get('lc_inventory', makeInventorySeed()));
  const [logs, setLogs] = useState(() => LS.get('lc_inventory_logs', makeInventoryLogsSeed()));
  
  const [tab, setTab] = useState('stock'); // 'stock' | 'logs'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('standard');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [origin, setOrigin] = useState('');

  // Form log states
  const [logItemId, setLogItemId] = useState('');
  const [logType, setLogType] = useState('domestic_in');
  const [logQty, setLogQty] = useState('');
  const [logNote, setLogNote] = useState('');
  const [customsCode, setCustomsCode] = useState('');
  const [customsTax, setCustomsTax] = useState('');

  useEffect(() => {
    LS.set('lc_inventory', items);
  }, [items]);

  useEffect(() => {
    LS.set('lc_inventory_logs', logs);
  }, [logs]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!name || !code || !quantity) return;
    const newItem = {
      id: 'inv-' + genId(),
      name,
      type,
      code,
      unit,
      quantity: Number(quantity),
      minStock: Number(minStock || 0),
      unitPrice: Number(unitPrice || 0),
      supplier,
      origin: type === 'import' ? origin : 'Việt Nam'
    };

    setItems([newItem, ...items]);
    setShowAddModal(false);
    // Reset form
    setName(''); setType('standard'); setCode(''); setUnit('kg'); setQuantity(''); setMinStock(''); setUnitPrice(''); setSupplier(''); setOrigin('');
    alert('✓ Đã thêm mặt hàng kho mới thành công!');
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    const targetItem = items.find(i => i.id === logItemId);
    if (!targetItem || !logQty) return;

    const qtyVal = Number(logQty);
    let newQty = targetItem.quantity;
    if (logType === 'import_in' || logType === 'domestic_in') {
      newQty += qtyVal;
    } else {
      if (newQty < qtyVal) {
        alert('✕ Số lượng tồn kho hiện tại không đủ để xuất kho!');
        return;
      }
      newQty -= qtyVal;
    }

    // Update item stock
    setItems(items.map(i => i.id === logItemId ? { ...i, quantity: newQty } : i));

    // Add log
    const newLog = {
      id: 'log-' + genId(),
      itemId: logItemId,
      itemName: targetItem.name,
      type: logType,
      quantity: qtyVal,
      date: todayStr(),
      note: logNote || (logType.endsWith('_in') ? 'Nhập kho nguyên vật liệu' : 'Xuất kho phục vụ quầy bar'),
      performedBy: LS.get('lc_user', { name: 'Kế Toán Viên' }).name,
      ...(logType === 'import_in' && {
        customsCode,
        customsTax: Number(customsTax || 0)
      })
    };

    setLogs([newLog, ...logs]);
    setShowLogModal(false);
    
    // Reset
    setLogItemId(''); setLogType('domestic_in'); setLogQty(''); setLogNote(''); setCustomsCode(''); setCustomsTax('');
    alert('✓ Đã ghi sổ kho thành công!');
  };

  return (
    <div className="fade space-y-6">
      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f0f0e', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            Quản Lý Kho Nguyên Liệu & Xuất Nhập Khẩu (XNK) Chuyên Sâu
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-blue" style={{ borderRadius: '2px', fontSize: 11, padding: '5px 12px', display: 'flex', align: 'center', gap: 6, fontWeight: 600 }} onClick={() => setShowAddModal(true)}>
              <Plus size={12} /> Thêm Nguyên Liệu Mới
            </button>
            <button className="btn btn-red" style={{ borderRadius: '2px', fontSize: 11, padding: '5px 12px', display: 'flex', align: 'center', gap: 6, fontWeight: 600 }} onClick={() => setShowLogModal(true)}>
              <Scale size={12} /> Nhập/Xuất Kho
            </button>
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
          Theo dõi sát sao lượng tồn kho tức thời, lập phiếu nhập xuất nội địa, quản lý thủ tục Hải quan & thuế tự vệ đối với hàng hóa và máy móc <b>Xuất Nhập Khẩu</b> từ Ý, Colombia, Brazil.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #e5e7eb' }}>
        <button 
          style={{
            padding: '8px 16px', fontSize: 12.5, fontWeight: 700, border: 'none', background: 'transparent',
            color: tab === 'stock' ? '#1e40af' : '#6b7280',
            borderBottom: tab === 'stock' ? '3px solid #1e40af' : '3px solid transparent',
            cursor: 'pointer', marginBottom: -2
          }}
          onClick={() => setTab('stock')}
        >
          Lượng Tồn Kho Thực Tế
        </button>
        <button 
          style={{
            padding: '8px 16px', fontSize: 12.5, fontWeight: 700, border: 'none', background: 'transparent',
            color: tab === 'logs' ? '#1e40af' : '#6b7280',
            borderBottom: tab === 'logs' ? '3px solid #1e40af' : '3px solid transparent',
            cursor: 'pointer', marginBottom: -2
          }}
          onClick={() => setTab('logs')}
        >
          Nhật Ký Nhập Xuất & Hải Quan
        </button>
      </div>

      {tab === 'stock' ? (
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb', fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>MÃ SKU</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb' }}>TÊN MẶT HÀNG</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>PHÂN LOẠI</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>TỒN KHO HỆ THỐNG</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>ĐƠN GIÁ</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>NHÀ CUNG CẤP</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>XUẤT XỨ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const isLow = item.quantity <= item.minStock;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'transparent' : '#f8fafc' }} className="table-row-hover">
                    <td style={{ padding: '12px 8px', fontWeight: 700, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }} className="mono">{item.code}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 600, borderRight: '1px solid #e5e7eb' }}>{item.name}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                      <span style={{
                        background: item.type === 'import' ? '#fef3c7' : '#eff6ff',
                        color: item.type === 'import' ? '#78350f' : '#1e40af',
                        padding: '2.5px 8px', borderRadius: '2px', fontSize: 10.5, fontWeight: 700,
                        border: `1px solid ${item.type === 'import' ? '#fcd34d' : '#bfdbfe'}`,
                        whiteSpace: 'nowrap', display: 'inline-block'
                      }}>
                        {item.type === 'import' ? 'XNK Ngoại' : 'Nội Địa'}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '12px 8px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #e5e7eb',
                      color: isLow ? '#be123c' : '#0f0f0e', whiteSpace: 'nowrap'
                    }} className="mono">
                      {item.quantity} {item.unit} {isLow && <span style={{ fontSize: 9.5, fontWeight: 600, background: '#fee2e2', color: '#991b1b', padding: '1px 4px', marginLeft: 4, whiteSpace: 'nowrap', display: 'inline-block' }}>Dưới định mức</span>}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }} className="mono">{fmt(item.unitPrice)}</td>
                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{item.supplier}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.origin}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb', fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>NGÀY</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb' }}>MẶT HÀNG</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>LOẠI PHIẾU</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>SỐ LƯỢNG</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>THÔNG TIN HẢI QUAN & THUẾ</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb' }}>DIỄN GIẢI CHI TIẾT</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>KẾ TOÁN LẬP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => {
                const labelColors = {
                  import_in: ['#fef3c7', '#78350f', 'Nhập Khẩu'],
                  domestic_in: ['#d1fae5', '#065f46', 'Nhập Nội Địa'],
                  out: ['#fee2e2', '#991b1b', 'Xuất Kho']
                };
                const [bg, col, text] = labelColors[log.type] || ['#f1f5f9', '#475569', 'Khác'];
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'transparent' : '#f8fafc' }} className="table-row-hover">
                    <td style={{ padding: '12px 8px', fontWeight: 600, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{fmtDate(log.date)}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 600, borderRight: '1px solid #e5e7eb' }}>{log.itemName}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                      <span style={{ background: bg, color: col, padding: '2.5px 8px', borderRadius: '2px', fontSize: 10.5, fontWeight: 700, border: `1.5px solid ${col}44`, whiteSpace: 'nowrap', display: 'inline-block' }}>
                        {text}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }} className="mono">{log.quantity}</td>
                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e5e7eb', fontSize: 11.5, whiteSpace: 'nowrap' }}>
                      {log.customsCode ? (
                        <div>
                          <div>Mã tờ khai: <b className="mono">{log.customsCode}</b></div>
                          <div style={{ color: '#b45309', marginTop: 1 }}>Thuế nhập khẩu: <b className="mono">{fmt(log.customsTax)}</b></div>
                        </div>
                      ) : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Không áp dụng</span>}
                    </td>
                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e5e7eb', color: '#4b5563' }}>{log.note}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 500, whiteSpace: 'nowrap' }}>{log.performedBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleAddItem} className="fade" style={{ background: 'white', padding: 24, borderRadius: '2px', width: '100%', maxWidth: 500, border: '1.5px solid #0f0f0e', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f0f0e', marginBottom: 16, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>THÊM HÀNG HÓA/NGUYÊN LIỆU MỚI</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Phân loại</label>
                <select className="input-field" style={{ borderRadius: '2px' }} value={type} onChange={e => setType(e.target.value)}>
                  <option value="standard">Nguyên liệu nội địa</option>
                  <option value="import">Thiết bị/Nguyên liệu nhập khẩu (XNK)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Mã SKU/Định danh</label>
                <input className="input-field mono" style={{ borderRadius: '2px' }} required value={code} onChange={e => setCode(e.target.value)} placeholder="NK-ARA-COL" />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Tên sản phẩm/Nguyên vật liệu</label>
              <input className="input-field" style={{ borderRadius: '2px' }} required value={name} onChange={e => setName(e.target.value)} placeholder="Hạt Cà Phê Arabica Colombia (Special Grade)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Đơn vị tính</label>
                <input className="input-field" style={{ borderRadius: '2px' }} required value={unit} onChange={e => setUnit(e.target.value)} placeholder="kg, cái, hộp..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Tồn ban đầu</label>
                <input type="number" className="input-field mono" style={{ borderRadius: '2px' }} required value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Tồn tối thiểu</label>
                <input type="number" className="input-field mono" style={{ borderRadius: '2px' }} required value={minStock} onChange={e => setMinStock(e.target.value)} placeholder="20" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Đơn giá (VND)</label>
                <input type="number" className="input-field mono" style={{ borderRadius: '2px' }} required value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="320000" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Nhà cung cấp</label>
                <input className="input-field" style={{ borderRadius: '2px' }} required value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Andes Coffee Co." />
              </div>
            </div>

            {type === 'import' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Xuất xứ (Quốc gia)</label>
                <input className="input-field" style={{ borderRadius: '2px' }} required value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Colombia, Italy, Brazil..." />
              </div>
            )}

            <div style={{ display: 'flex', justify: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-gray" style={{ borderRadius: '2px', height: 34 }} onClick={() => setShowAddModal(false)}>Hủy bỏ</button>
              <button type="submit" className="btn btn-blue" style={{ borderRadius: '2px', height: 34 }}>Thêm Mặt Hàng</button>
            </div>
          </form>
        </div>
      )}

      {/* Log Stock Modal */}
      {showLogModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleAddLog} className="fade" style={{ background: 'white', padding: 24, borderRadius: '2px', width: '100%', maxWidth: 500, border: '1.5px solid #0f0f0e', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f0f0e', marginBottom: 16, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>LẬP PHIẾU NHẬP XUẤT KHO</h3>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Chọn mặt hàng trong kho</label>
              <select className="input-field" style={{ borderRadius: '2px' }} required value={logItemId} onChange={e => setLogItemId(e.target.value)}>
                <option value="">-- Chọn mặt hàng cần lập phiếu --</option>
                {items.map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.code}) - Tồn: {i.quantity} {i.unit}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Loại giao dịch</label>
                <select className="input-field" style={{ borderRadius: '2px' }} value={logType} onChange={e => setLogType(e.target.value)}>
                  <option value="domestic_in">Nhập kho nội địa</option>
                  <option value="import_in">Nhập khẩu chính ngạch (XNK)</option>
                  <option value="out">Xuất kho sử dụng</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Số lượng giao dịch</label>
                <input type="number" className="input-field mono" style={{ borderRadius: '2px' }} required value={logQty} onChange={e => setLogQty(e.target.value)} placeholder="0" />
              </div>
            </div>

            {logType === 'import_in' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Mã tờ khai hải quan</label>
                  <input className="input-field mono" style={{ borderRadius: '2px' }} required value={customsCode} onChange={e => setCustomsCode(e.target.value)} placeholder="HQ-XXXXXX" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Thuế nhập khẩu hải quan</label>
                  <input type="number" className="input-field mono" style={{ borderRadius: '2px' }} required value={customsTax} onChange={e => setCustomsTax(e.target.value)} placeholder="VND" />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Diễn giải / Nhật ký xuất nhập</label>
              <textarea className="input-field" rows={3} style={{ borderRadius: '2px', border: '1.5px solid #e5e7eb' }} required value={logNote} onChange={e => setLogNote(e.target.value)} placeholder="Nhập chi tiết về đợt nhập xuất kho..." />
            </div>

            <div style={{ display: 'flex', justify: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-gray" style={{ borderRadius: '2px', height: 34 }} onClick={() => setShowLogModal(false)}>Hủy bỏ</button>
              <button type="submit" className="btn btn-blue" style={{ borderRadius: '2px', height: 34 }}>Ghi Sổ Kho</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};


// ── 3. 🧾 QUẢN LÝ HÓA ĐƠN GTGT & PHÁP LÝ (AccInvoices) ──
export const AccInvoices = () => {
  const [invoices, setInvoices] = useState(() => LS.get('lc_invoices_v2', makeInvoiceSeed()));
  const [showAdd, setShowAdd] = useState(false);

  // Form states
  const [number, setNumber] = useState('');
  const [type, setType] = useState('in');
  const [partnerName, setPartnerName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState(10);

  useEffect(() => {
    LS.set('lc_invoices_v2', invoices);
  }, [invoices]);

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!number || !partnerName || !taxCode || !amount) return;

    const amt = Number(amount);
    const tax = Math.round(amt * (taxRate / 100));
    const total = amt + tax;

    // Tự động kiểm tra tính hợp pháp sơ bộ
    let status = 'verified';
    let checkNote = 'Chữ ký số hợp lệ. Tra cứu Tổng cục Thuế hoạt động bình thường.';

    if (taxCode.endsWith('X') || taxCode.length < 10) {
      status = 'invalid';
      checkNote = 'Cảnh báo: Mã số thuế tạm ngừng hoạt động hoặc không tồn tại trên cổng thông tin!';
    } else if (amt > 100000000) {
      status = 'pending';
      checkNote = 'Đang chờ kiểm tra phê duyệt thủ công (Hóa đơn trên 100 triệu).';
    }

    const newInvoice = {
      id: 'invc-' + genId(),
      number,
      date: todayStr(),
      type,
      partnerName,
      taxCode,
      amount: amt,
      taxRate,
      totalAmount: total,
      status,
      checkNote
    };

    setInvoices([newInvoice, ...invoices]);
    setShowAdd(false);
    
    // Reset form
    setNumber(''); setType('in'); setPartnerName(''); setTaxCode(''); setAmount(''); setTaxRate(10);
    alert('Đã ghi nhận hóa đơn tài chính mới!');
  };

  const handleVerify = (id) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'verified', checkNote: 'Đã thẩm định thủ công hợp pháp thành công.' } : i));
    alert('Đã cập nhật trạng thái thẩm định hóa đơn thành công!');
  };

  return (
    <div className="fade space-y-6">
      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f0f0e', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            Quản Lý Hóa Đơn Đỏ (GTGT) & Thẩm Định Pháp Lý Thuế
          </h2>
          <button className="btn btn-blue" style={{ borderRadius: '2px', fontSize: 11, padding: '5px 12px', display: 'flex', align: 'center', gap: 6, fontWeight: 600 }} onClick={() => setShowAdd(true)}>
            <Plus size={12} /> Phát Hành / Ghi Nhận Hóa Đơn GTGT
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
          Ghi nhận hóa đơn đầu vào phục vụ sản xuất, phát hành hóa đơn đầu ra VAT (8% hoặc 10%), và áp dụng công cụ thẩm định pháp lý tự động so khớp thông tin đăng ký doanh nghiệp quốc gia.
        </p>
      </div>

      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb', fontSize: 11, fontWeight: 700, color: '#64748b' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb', width: 90, whiteSpace: 'nowrap' }}>SỐ HÓA ĐƠN</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb', width: 100, whiteSpace: 'nowrap' }}>NGÀY PHÁT HÀNH</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', width: 90, whiteSpace: 'nowrap' }}>LOẠI</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb', minWidth: 200 }}>ĐƠN VỊ ĐỐI TÁC</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb', width: 110, whiteSpace: 'nowrap' }}>MÃ SỐ THUẾ (MST)</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', minWidth: 140, whiteSpace: 'nowrap' }}>TỔNG CỘNG CHƯA THUẾ</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', minWidth: 140, whiteSpace: 'nowrap' }}>TIỀN THUẾ GTGT</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', width: 220 }}>PHÁP LÝ HÓA ĐƠN</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', width: 130, whiteSpace: 'nowrap' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => {
              const badgeColors = {
                verified: ['#d1fae5', '#065f46', 'Hợp Lệ'],
                pending: ['#fef3c7', '#78350f', 'Thiếu Chứng Từ'],
                issued: ['#eff6ff', '#1e40af', 'Đã Phát Hành'],
                invalid: ['#fee2e2', '#be123c', 'Không Hợp Lệ']
              };
              const [bg, col, text] = badgeColors[inv.status] || ['#f1f5f9', '#475569', 'Khác'];
              return (
                <tr key={inv.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'transparent' : '#f8fafc' }} className="table-row-hover">
                  <td style={{ padding: '12px 8px', fontWeight: 700, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }} className="mono">{inv.number}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 600, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{fmtDate(inv.date)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                    <span style={{
                      background: inv.type === 'in' ? '#e0f2fe' : '#f5f5f4',
                      color: inv.type === 'in' ? '#0369a1' : '#44403c',
                      padding: '2.5px 8px', borderRadius: '2px', fontSize: 10.5, fontWeight: 700,
                      border: `1px solid ${inv.type === 'in' ? '#bae6fd' : '#e7e5e4'}`,
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }}>
                      {inv.type === 'in' ? 'Mua Vào' : 'Bán Ra'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 600, borderRight: '1px solid #e5e7eb', minWidth: 200 }}>{inv.partnerName}</td>
                  <td style={{ padding: '12px 8px', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }} className="mono">{inv.taxCode}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap', minWidth: 120 }} className="mono">{fmt(inv.amount)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap', minWidth: 120 }} className="mono">
                    <span style={{ fontSize: 10, color: '#9ca3af', marginRight: 4 }}>({inv.taxRate}%)</span>
                    <b>{fmt(Math.round(inv.amount * (inv.taxRate / 100)))}</b>
                  </td>
                  <td style={{ padding: '12px 8px', borderRight: '1px solid #e5e7eb' }}>
                    <div 
                      onClick={() => alert(`THÔNG TIN PHÁP LÝ HÓA ĐƠN #${inv.number}\n\n- Đối tác: ${inv.partnerName}\n- Mã số thuế: ${inv.taxCode}\n- Trạng thái: ${text.trim()}\n\nCHI TIẾT BÁO CÁO THẨM ĐỊNH:\n${inv.checkNote}`)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                      title="Bấm để xem chi tiết lý do thẩm định"
                    >
                      <span style={{ background: bg, color: col, padding: '2.5px 8px', borderRadius: '2px', fontSize: 10.5, fontWeight: 700, border: `1.5px solid ${col}44`, display: 'inline-block', whiteSpace: 'nowrap' }}>
                        {text}
                      </span>
                      <div style={{ fontSize: 10.5, color: '#6b7280', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inv.checkNote}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', width: 130, whiteSpace: 'nowrap' }}>
                    {inv.status === 'pending' || inv.status === 'invalid' ? (
                      <button 
                        className="btn btn-blue" 
                        style={{ padding: '4px 10px', fontSize: 11, borderRadius: '2px', height: 26, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}
                        onClick={() => handleVerify(inv.id)}
                      >
                        Duyệt Hợp Lệ
                      </button>
                    ) : <span style={{ color: '#9ca3af', fontSize: 11, whiteSpace: 'nowrap' }}>Đã khóa sổ</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleCreateInvoice} className="fade" style={{ background: 'white', padding: 24, borderRadius: '2px', width: '100%', maxWidth: 500, border: '1.5px solid #0f0f0e', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f0f0e', marginBottom: 16, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>KHAI BÁO / PHÁT HÀNH HÓA ĐƠN ĐỎ GTGT</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Phân loại hóa đơn</label>
                <select className="input-field" style={{ borderRadius: '2px' }} value={type} onChange={e => setType(e.target.value)}>
                  <option value="in">Hóa đơn mua vào (Đầu vào chi phí)</option>
                  <option value="out">Hóa đơn bán ra (Đầu ra doanh thu)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Số hóa đơn (7 chữ số)</label>
                <input className="input-field mono" style={{ borderRadius: '2px' }} required value={number} onChange={e => setNumber(e.target.value)} placeholder="0000123" maxLength={7} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Tên công ty đối tác / Khách hàng</label>
              <input className="input-field" style={{ borderRadius: '2px' }} required value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="Công ty TNHH Cà phê Việt" />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Mã số thuế doanh nghiệp (MST)</label>
              <input className="input-field mono" style={{ borderRadius: '2px' }} required value={taxCode} onChange={e => setTaxCode(e.target.value)} placeholder="Nhập MST đối tác..." />
              <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginTop: 4 }}>* Nhập đuôi ký tự X để giả định tình huống MST bất thường/bị đình chỉ.</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Tổng giá trị hàng hóa chưa thuế (VND)</label>
                <input type="number" className="input-field mono" style={{ borderRadius: '2px' }} required value={amount} onChange={e => setAmount(e.target.value)} placeholder="VND" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Thuế suất GTGT</label>
                <select className="input-field" style={{ borderRadius: '2px' }} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))}>
                  <option value={10}>10%</option>
                  <option value={8}>8% (Giảm thuế)</option>
                  <option value={0}>0% (Miễn thuế)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justify: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-gray" style={{ borderRadius: '2px', height: 34 }} onClick={() => setShowAdd(false)}>Hủy bỏ</button>
              <button type="submit" className="btn btn-blue" style={{ borderRadius: '2px', height: 34 }}>Phát Hành Hóa Đơn</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};


// ── 4. 💸 THEO DÕI CÔNG NỢ AP/AR (AccDebts) ──
export const AccDebts = () => {
  const [debts, setDebts] = useState(() => LS.get('lc_debts_v2', makeDebtSeed()));
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [infoDebt, setInfoDebt] = useState(null);
  const [debtTab, setDebtTab] = useState('all'); // 'all' | 'AP' | 'AR'
  
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');

  useEffect(() => {
    LS.set('lc_debts_v2', debts);
  }, [debts]);

  const handleOpenPay = (debt) => {
    setSelectedDebt(debt);
    setPayAmount(debt.amount - debt.paid);
    setPayNote('');
    setShowPayModal(true);
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!selectedDebt || !payAmount) return;

    const payVal = Number(payAmount);
    if (payVal <= 0) {
      alert('✕ Số tiền thanh toán phải lớn hơn 0!');
      return;
    }

    const updatedDebts = debts.map(d => {
      if (d.id === selectedDebt.id) {
        const newPaid = d.paid + payVal;
        const newHistory = [...d.history, {
          date: todayStr(),
          amount: payVal,
          note: payNote || 'Kế toán ghi sổ trả nợ'
        }];
        return {
          ...d,
          paid: newPaid,
          history: newHistory,
          status: newPaid >= d.amount ? 'within_term' : d.status // Nếu hoàn tất thì tự động ok
        };
      }
      return d;
    });

    setDebts(updatedDebts);
    setShowPayModal(false);
    
    // Đồng thời tự động ghi nhận một phiếu Thu/Chi vào Sổ Quỹ (Cashbook) để giữ cân đối quỹ tài chính!
    const cashbook = LS.get('lc_cashbook', makeCashbookSeed());
    const isAP = selectedDebt.type === 'AP';
    const newCashLog = {
      id: 'cb-' + genId(),
      date: todayStr(),
      type: isAP ? 'payment' : 'receipt',
      method: 'transfer',
      category: isAP ? 'Chi trả nợ NCC' : 'Thu nợ đại lý sỉ',
      amount: payVal,
      note: `${isAP ? 'Chi trả' : 'Thu hồi'} công nợ đối tác ${selectedDebt.partnerName} - ${payNote || 'Kế toán ghi sổ'}`,
      performedBy: LS.get('lc_user', { name: 'Kế Toán Viên' }).name
    };
    LS.set('lc_cashbook', [newCashLog, ...cashbook]);
    // Dispatch event to sync cashbook if open elsewhere
    window.dispatchEvent(new Event('storage'));

    setSelectedDebt(null); setPayAmount(''); setPayNote('');
    alert('✓ Đã ghi nhận thanh toán công nợ và đồng bộ hạch toán Sổ Quỹ thành công!');
  };

  return (
    <div className="fade space-y-6">
      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f0f0e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          Theo Dõi Công Nợ Phải Trả (AP) & Công Nợ Phải Thu (AR)
        </h2>
        <p style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
          Quản lý luồng công nợ phải trả cho nhà cung cấp nguyên vật liệu nhập khẩu (Accounts Payable) và công nợ phải thu của đại lý, các đối tác mua sỉ cà phê rang xay (Accounts Receivable).
          Tự động phân loại nợ Quá Hạn thông minh để có chính sách đòi nợ hoặc thanh toán phù hợp.
        </p>
      </div>

      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
        {/* Tab filter bar */}
        <div style={{ padding: '12px 18px', background: '#fafafa', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { key: 'all',  label: 'Tất Cả', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
              { key: 'AP',   label: 'Phải Trả (AP) — NCC', color: '#be123c', bg: '#fff1f2', border: '#fca5a5' },
              { key: 'AR',   label: 'Phải Thu (AR) — Khách hàng', color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
            ].map(tab => {
              const subset = tab.key === 'all' ? debts : debts.filter(d => d.type === tab.key);
              const totalBalance = subset.reduce((s, d) => s + Math.max(0, d.amount - d.paid), 0);
              const isActive = debtTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setDebtTab(tab.key)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '2px',
                    border: `1.5px solid ${isActive ? tab.color : '#e5e7eb'}`,
                    background: isActive ? tab.bg : 'white',
                    color: isActive ? tab.color : '#6b7280',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: 11.5,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 1,
                    transition: 'all 0.12s'
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8 }} className="mono">
                    Dư nợ: {fmtK(totalBalance)}
                  </span>
                </button>
              );
            })}
          </div>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>
            {(debtTab === 'all' ? debts : debts.filter(d => d.type === debtTab)).length} đối tác
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb', fontSize: 11, fontWeight: 700, color: '#64748b' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb' }}>ĐỐI TÁC CÔNG NỢ</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>PHÂN LOẠI NỢ</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>TỔNG SỐ NỢ GHI SỔ</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>ĐÃ THANH TOÁN</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>DƯ NỢ CÒN LẠI</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>HẠN THANH TOÁN</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>TRẠNG THÁI HẠN BÁO</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {(debtTab === 'all' ? debts : debts.filter(d => d.type === debtTab)).map((d, idx) => {
              const balance = d.amount - d.paid;
              const isOverdue = d.status === 'overdue' && balance > 0;
              const isFinished = balance <= 0;
              
              return (
                <tr key={d.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'transparent' : '#f8fafc' }} className="table-row-hover">
                  <td style={{ padding: '12px 8px', fontWeight: 700, borderRight: '1px solid #e5e7eb' }}>
                    <div>{d.partnerName}</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                      <div style={{ fontSize: 10.5, color: '#6b7280', fontWeight: 500 }}>{d.note}</div>
                      {(d.bankAccount || d.paymentTermDays) && (
                        <button
                          onClick={() => setInfoDebt(d)}
                          style={{ flexShrink: 0, background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2px', padding: '1px 7px', fontSize: 11, fontWeight: 700, color: '#475569', cursor: 'pointer', lineHeight: 1.6 }}
                          title="Xem thông tin ngân hàng & thời hạn thanh toán"
                        >···</button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                    <span style={{
                      background: d.type === 'AP' ? '#fff1f2' : '#f0fdf4',
                      color: d.type === 'AP' ? '#be123c' : '#15803d',
                      padding: '2.5px 8px', borderRadius: '2px', fontSize: 10.5, fontWeight: 700,
                      border: `1px solid ${d.type === 'AP' ? '#fca5a5' : '#bbf7d0'}`,
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }}>
                      {d.type === 'AP' ? 'Phải Trả (AP)' : 'Phải Thu (AR)'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }} className="mono">{fmt(d.amount)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600, borderRight: '1px solid #e5e7eb', color: '#15803d', whiteSpace: 'nowrap' }} className="mono">{fmt(d.paid)}</td>
                  <td style={{ 
                    padding: '12px 8px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #e5e7eb',
                    color: isFinished ? '#9ca3af' : balance > 50000000 ? '#be123c' : '#0f0f0e',
                    whiteSpace: 'nowrap'
                  }} className="mono">
                    {balance <= 0 ? 'Đã hoàn tất' : fmt(balance)}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', fontWeight: 600, whiteSpace: 'nowrap' }} className="mono">{fmtDate(d.dueDate)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                    {isFinished ? (
                      <span style={{
                        background: '#d1fae5', color: '#065f46', padding: '2.5px 8px', borderRadius: '2px', fontSize: 10.5, fontWeight: 700, border: '1px solid #86efac',
                        whiteSpace: 'nowrap', display: 'inline-block'
                      }}>
                        Hoàn Tất
                      </span>
                    ) : isOverdue ? (
                      <span style={{
                        background: '#fee2e2', color: '#be123c', padding: '2.5px 8px', borderRadius: '2px', fontSize: 10.5, fontWeight: 700, border: '1px solid #fca5a5',
                        whiteSpace: 'nowrap', display: 'inline-block'
                      }}>
                        Quá Hạn
                      </span>
                    ) : (
                      <span style={{
                        background: '#fef3c7', color: '#b45309', padding: '2.5px 8px', borderRadius: '2px', fontSize: 10.5, fontWeight: 700, border: '1px solid #fde68a',
                        whiteSpace: 'nowrap', display: 'inline-block'
                      }}>
                        Trong Hạn
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {!isFinished ? (
                      <button 
                        className="btn btn-blue" 
                        style={{ padding: '3.5px 10px', fontSize: 11, borderRadius: '2px', height: 26, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}
                        onClick={() => handleOpenPay(d)}
                      >
                        {d.type === 'AP' ? 'Trả Nợ NCC' : 'Thu Hồi Nợ'}
                      </button>
                    ) : (
                      <div style={{ maxHeight: 40, overflowY: 'auto' }}>
                        {d.history.map((h, i) => (
                          <div key={i} style={{ fontSize: 10, color: '#6b7280' }}>
                            {fmtDate(h.date)}: <b>{fmt(h.amount)}</b>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── INFO POPUP ── */}
      {infoDebt && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setInfoDebt(null)}
        >
          <div
            className="fade"
            style={{ background: 'white', borderRadius: '2px', border: '1.5px solid #0f0f0e', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: 420, padding: 24 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0f0f0e', borderBottom: '2px solid #e5e7eb', paddingBottom: 10, marginBottom: 14 }}>
              {infoDebt.partnerName}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              {infoDebt.bankAccount && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'start' }}>
                  <span style={{ color: '#6b7280', fontWeight: 600 }}>Số tài khoản:</span>
                  <span className="mono" style={{ fontWeight: 700, color: '#1e293b', wordBreak: 'break-word' }}>{infoDebt.bankAccount}</span>
                </div>
              )}
              {infoDebt.paymentTermDays && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'start' }}>
                  <span style={{ color: '#6b7280', fontWeight: 600 }}>Thời hạn thanh toán:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>Net {infoDebt.paymentTermDays} ngày kể từ ngày giao hàng</span>
                </div>
              )}
              {infoDebt.dueDate && (
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, alignItems: 'start' }}>
                  <span style={{ color: '#6b7280', fontWeight: 600 }}>Hạn thanh toán cuối:</span>
                  <span style={{ fontWeight: 700, color: '#be123c' }}>{fmtDate(infoDebt.dueDate)}</span>
                </div>
              )}
            </div>
            <div style={{ marginTop: 18, textAlign: 'right' }}>
              <button className="btn btn-gray" style={{ borderRadius: '2px', height: 32, fontSize: 12, fontWeight: 600 }} onClick={() => setInfoDebt(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {showPayModal && selectedDebt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleSavePayment} className="fade" style={{ background: 'white', padding: 24, borderRadius: '2px', width: '100%', maxWidth: 460, border: '1.5px solid #0f0f0e', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f0f0e', marginBottom: 12, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>
              GHI NHẬN THANH TOÁN CÔNG NỢ
            </h3>
            
            <div style={{ background: '#f8fafc', padding: 12, border: '1.5px solid #e5e7eb', borderRadius: '2px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ color: '#6b7280' }}>Đối tác:</span>
                <span style={{ fontWeight: 700 }}>{selectedDebt.partnerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ color: '#6b7280' }}>Tổng số nợ ban đầu:</span>
                <span className="mono" style={{ fontWeight: 600 }}>{fmt(selectedDebt.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ color: '#6b7280' }}>Dư nợ hiện tại:</span>
                <span className="mono" style={{ fontWeight: 700, color: '#be123c' }}>{fmt(selectedDebt.amount - selectedDebt.paid)}</span>
              </div>
              {selectedDebt.dueDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, paddingTop: 6, borderTop: '1px dashed #e5e7eb' }}>
                  <span style={{ color: '#6b7280' }}>Hạn thanh toán cuối:</span>
                  <span style={{ fontWeight: 700, color: '#be123c' }}>{fmtDate(selectedDebt.dueDate)}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Số tiền ghi sổ (VND)</label>
              <input 
                type="number" 
                className="input-field mono" 
                style={{ borderRadius: '2px' }} 
                required 
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                placeholder="Nhập số tiền..."
                max={selectedDebt.amount - selectedDebt.paid}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Nội dung ghi chú thanh toán</label>
              <textarea 
                className="input-field" 
                rows={2} 
                style={{ borderRadius: '2px', border: '1.5px solid #e5e7eb' }} 
                required 
                value={payNote}
                onChange={e => setPayNote(e.target.value)}
                placeholder="Ví dụ: Chuyển khoản ngân hàng ACB đợt 2..."
              />
            </div>

            <div style={{ display: 'flex', justify: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-gray" style={{ borderRadius: '2px', height: 34 }} onClick={() => setShowPayModal(false)}>Hủy bỏ</button>
              <button type="submit" className="btn btn-blue" style={{ borderRadius: '2px', height: 34 }}>
                {selectedDebt.type === 'AP' ? 'Xác Nhận Chi Trả' : 'Xác Nhận Thu Nợ'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};


// ── 5. 🏦 SỔ QUỸ THU CHI TIỀN MẶT & CK (AccCashbook) ──
export const AccCashbook = () => {
  const [logs, setLogs] = useState(() => LS.get('lc_cashbook', makeCashbookSeed()));
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [type, setType] = useState('receipt');
  const [method, setMethod] = useState('transfer');
  const [category, setCategory] = useState('Doanh thu ngày');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Sync state with localStorage changes
  useEffect(() => {
    const handleStorage = () => {
      setLogs(LS.get('lc_cashbook', []));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    LS.set('lc_cashbook', logs);
  }, [logs]);

  // Cân đối dòng tiền và số dư tức thời
  const { totalReceipts, totalPayments, cashBalance, bankBalance, currentBalance } = useMemo(() => {
    let receipts = 0;
    let payments = 0;
    let cash = 50000000; // Số dư đầu kỳ giả lập tiền mặt 50M
    let bank = 350000000; // Số dư đầu kỳ giả lập ngân hàng 350M

    logs.forEach(log => {
      const amt = Number(log.amount || 0);
      if (log.type === 'receipt') {
        receipts += amt;
        if (log.method === 'cash') cash += amt;
        else bank += amt;
      } else {
        payments += amt;
        if (log.method === 'cash') cash -= amt;
        else bank -= amt;
      }
    });

    return {
      totalReceipts: receipts,
      totalPayments: payments,
      cashBalance: cash,
      bankBalance: bank,
      currentBalance: cash + bank
    };
  }, [logs]);

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!amount || !note) return;

    const amtVal = Number(amount);
    if (method === 'cash' && amtVal > 5000000) {
      alert('✕ Giao dịch trên 5.000.000 ₫ bắt buộc thanh toán qua Ngân Hàng chuyển khoản theo quy định nội bộ Lee\'s Coffee!');
      setMethod('transfer');
      return;
    }

    const newLog = {
      id: 'cb-' + genId(),
      date: todayStr(),
      type,
      method,
      category,
      amount: amtVal,
      note: note.trim(),
      performedBy: LS.get('lc_user', { name: 'Kế Toán Viên' }).name
    };

    setLogs([newLog, ...logs]);
    setShowAddModal(false);
    
    // Reset Form
    setType('receipt'); setMethod('transfer'); setCategory('Doanh thu ngày'); setAmount(''); setNote('');
    alert('✓ Đã ghi nhận bút toán thu chi vào Sổ Quỹ thành công!');
  };

  return (
    <div className="fade space-y-6">
      {/* Balance Summary Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderTop: '3px solid #1e40af', borderRadius: '2px', padding: '16px 18px' }}>
          <div style={{ fontSize: 9.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>TỔNG DÒNG THU GHI SỔ</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e40af' }} className="mono">{fmt(totalReceipts)}</div>
        </div>
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderTop: '3px solid #be123c', borderRadius: '2px', padding: '16px 18px' }}>
          <div style={{ fontSize: 9.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>TỔNG DÒNG CHI GHI SỔ</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#be123c' }} className="mono">{fmt(totalPayments)}</div>
        </div>
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderTop: '3px solid #15803d', borderRadius: '2px', padding: '16px 18px' }}>
          <div style={{ fontSize: 9.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>SỐ DƯ TIỀN MẶT CỬA HÀNG</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#15803d' }} className="mono">{fmt(cashBalance)}</div>
        </div>
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderTop: '3px solid #7c3aed', borderRadius: '2px', padding: '16px 18px' }}>
          <div style={{ fontSize: 9.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>SỐ DƯ TÀI KHOẢN NGÂN HÀNG</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#7c3aed' }} className="mono">{fmt(bankBalance)}</div>
        </div>
      </div>

      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f0f0e', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            Sổ Nhật Ký Thu Chi Quỹ Tiền Mặt & Tiền Gửi Ngân Hàng (Cashbook)
          </h2>
          <button className="btn btn-blue" style={{ borderRadius: '2px', fontSize: 11, padding: '5px 12px', display: 'flex', align: 'center', gap: 6, fontWeight: 600 }} onClick={() => setShowAddModal(true)}>
            <Plus size={12} /> Lập Phiếu Thu / Chi Mới
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
          Theo dõi nhật ký dòng tiền ra/vào hệ thống. Hỗ trợ đối soát số dư tiền mặt tại két sắt cửa hàng và số dư tiền gửi ngân hàng ACB của Lee's Coffee.
          Báo cáo số dư tức thời ngay khi ghi sổ giao dịch.
        </p>
      </div>

      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb', fontSize: 11, fontWeight: 700, color: '#64748b' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>NGÀY GHI SỔ</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>PHÂN LOẠI QUỸ</th>
              <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>PHƯƠNG THỨC</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>HẠNG MỤC THU CHI</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>GIÁ TRỊ</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', borderRight: '1px solid #e5e7eb' }}>DIỄN GIẢI NỘI DUNG</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', whiteSpace: 'nowrap' }}>KẾ TOÁN GHI SỔ</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => {
              const isCashViolation = log.method === 'cash' && Number(log.amount) > 5000000;
              return (
                <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb', background: isCashViolation ? '#fef2f2' : idx % 2 === 0 ? 'transparent' : '#f8fafc' }} className="table-row-hover">
                  <td style={{ padding: '12px 8px', fontWeight: 600, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{fmtDate(log.date)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                    <span style={{
                      background: log.type === 'receipt' ? '#f0fdf4' : '#fff1f2',
                      color: log.type === 'receipt' ? '#15803d' : '#be123c',
                      padding: '2.5px 8px', borderRadius: '2px', fontSize: 10.5, fontWeight: 800,
                      border: `1px solid ${log.type === 'receipt' ? '#bbf7d0' : '#fca5a5'}`,
                      whiteSpace: 'nowrap',
                      display: 'inline-block'
                    }}>
                      {log.type === 'receipt' ? 'Phiếu Thu (+)' : 'Phiếu Chi (-)'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', borderRight: '1px solid #e5e7eb', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span>{log.method === 'cash' ? 'Tiền Mặt' : 'Ngân Hàng'}</span>
                      {isCashViolation && (
                        <span style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '2px', padding: '1px 5px', fontSize: 9.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          ⚠ Vi phạm &gt;5tr
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 600, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{log.category}</td>
                  <td style={{ 
                    padding: '12px 8px', textAlign: 'right', fontWeight: 700, borderRight: '1px solid #e5e7eb',
                    color: log.type === 'receipt' ? '#15803d' : '#be123c',
                    whiteSpace: 'nowrap'
                  }} className="mono">
                    {log.type === 'receipt' ? '+' : '-'}{fmt(log.amount)}
                  </td>
                  <td style={{ padding: '12px 8px', borderRight: '1px solid #e5e7eb', color: '#4b5563' }}>{log.note}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 500, whiteSpace: 'nowrap' }}>{log.performedBy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleAddLog} className="fade" style={{ background: 'white', padding: 24, borderRadius: '2px', width: '100%', maxWidth: 460, border: '1.5px solid #0f0f0e', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f0f0e', marginBottom: 16, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>LẬP PHIẾU THU / PHIẾU CHI MỚI</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Loại phiếu quỹ</label>
                <select className="input-field" style={{ borderRadius: '2px' }} value={type} onChange={e => setType(e.target.value)}>
                  <option value="receipt">Phiếu Thu (Tăng ngân quỹ)</option>
                  <option value="payment">Phiếu Chi (Giảm ngân quỹ)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Hình thức quỹ</label>
                <select className="input-field" style={{ borderRadius: '2px' }} value={method} onChange={e => setMethod(e.target.value)}>
                  <option value="transfer">Ngân hàng chuyển khoản (ACB)</option>
                  <option value="cash">Tiền mặt tại két sắt quán</option>
                </select>
              </div>
            </div>

            {/* Cảnh báo vượt hạn mức tiền mặt */}
            {method === 'cash' && Number(amount) > 5000000 && (
              <div className="fade" style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '2px', padding: '8px 12px', marginBottom: 12, fontSize: 11.5, color: '#991b1b', fontWeight: 600, lineHeight: 1.5 }}>
                ⚠️ Giao dịch trên <b>5.000.000 ₫</b> phải thực hiện qua <b>Ngân Hàng chuyển khoản</b> theo quy định nội bộ. Hình thức đã tự động chuyển sang Ngân Hàng.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Hạng mục thu chi</label>
                <select className="input-field" style={{ borderRadius: '2px' }} value={category} onChange={e => setCategory(e.target.value)}>
                  {type === 'receipt' ? (
                    <>
                      <option value="Doanh thu ngày">Bàn giao doanh thu quán</option>
                      <option value="Doanh thu bán sỉ">Thu tiền đại lý sỉ</option>
                      <option value="Thu khác">Thu hồi thanh lý / Khác</option>
                    </>
                  ) : (
                    <>
                      <option value="Chi mua nguyên liệu">Thanh toán nhà cung cấp</option>
                      <option value="Lương nhân viên">Thanh toán lương nhân sự</option>
                      <option value="Chi phí cố định">Chi điện nước, mặt bằng</option>
                      <option value="Chi phí phát sinh">Chi phí phát sinh khác</option>
                    </>
                  )}
                </select>
              </div>
                <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Giá trị ghi sổ (VND)</label>
                <input
                  type="number"
                  className="input-field mono"
                  style={{ borderRadius: '2px', borderColor: method === 'cash' && Number(amount) > 5000000 ? '#fca5a5' : undefined }}
                  required
                  value={amount}
                  onChange={e => {
                    setAmount(e.target.value);
                    if (method === 'cash' && Number(e.target.value) > 5000000) {
                      setMethod('transfer');
                    }
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Diễn giải nội dung giao dịch</label>
              <textarea className="input-field" rows={3} style={{ borderRadius: '2px', border: '1.5px solid #e5e7eb' }} required value={note} onChange={e => setNote(e.target.value)} placeholder="Nhập chi tiết về nghiệp vụ kinh tế phát sinh..." />
            </div>

            <div style={{ display: 'flex', justify: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-gray" style={{ borderRadius: '2px', height: 34 }} onClick={() => setShowAddModal(false)}>Hủy bỏ</button>
              <button type="submit" className="btn btn-blue" style={{ borderRadius: '2px', height: 34 }}>Ghi Sổ Quỹ</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};


// ── 6. 📊 BÁO CÁO THUẾ & BCTC TÓM TẮT (AccTax) ──
export const AccTax = () => {
  const [reports, setReports] = useState(() => LS.get('lc_reports', []));
  const [selectedQuarter, setSelectedQuarter] = useState('Q2');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Tính toán dữ liệu tài chính phục vụ khai báo thuế theo thời gian lọc
  const taxSummary = useMemo(() => {
    // Lọc báo cáo đã duyệt (hoặc tất cả để tính toán giả định)
    const quarterMonths = {
      Q1: [0, 1, 2],
      Q2: [3, 4, 5],
      Q3: [6, 7, 8],
      Q4: [9, 10, 11]
    }[selectedQuarter];

    const qReps = reports.filter(r => {
      const d = new Date(r.date + ' ');
      return d.getFullYear().toString() === selectedYear && quarterMonths.includes(d.getMonth());
    });

    let totalRevenue = 0;
    let totalCOGS = 0; // Giá vốn hàng bán
    let totalOPEX = 0; // Chi phí cố định & vận hành
    let totalOtherExp = 0;

    qReps.forEach(r => {
      const { rev, exp } = calcR(r);
      totalRevenue += rev;
      totalCOGS += r.goodsCost || 0;
      totalOPEX += (r.fixedExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
      totalOtherExp += (r.otherExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
    });

    // Thuế GTGT đầu ra giả định 10%
    const vatOutput = Math.round(totalRevenue * 0.1);
    // Thuế GTGT đầu vào khấu trừ giả định (cốp định dựa trên COGS & OPEX có hóa đơn, tầm 80% chi phí có VAT)
    const vatInput = Math.round((totalCOGS + totalOPEX) * 0.8 * 0.1);
    const netVATPayable = vatOutput - vatInput;

    // Lợi nhuận trước thuế EBT
    const ebt = totalRevenue - (totalCOGS + totalOPEX + totalOtherExp);
    // Thuế TNDN tạm tính (20% trên EBT nếu EBT dương)
    const citTax = ebt > 0 ? Math.round(ebt * 0.2) : 0;
    
    // Quyết toán thuế TNCN nhân viên (giả định 10% quỹ lương OPEX làm thuế suất)
    const salaryPool = Math.round(totalOPEX * 0.6); // Quỹ lương chiếm 60% OPEX
    const pitTax = Math.round(salaryPool * 0.05); // 5% thuế TNCN bình quân

    return {
      revenue: totalRevenue,
      cogs: totalCOGS,
      opex: totalOPEX,
      otherExp: totalOtherExp,
      ebt,
      vatOutput,
      vatInput,
      netVATPayable,
      citTax,
      pitTax,
      salaryPool
    };
  }, [reports, selectedQuarter, selectedYear]);

  return (
    <div className="fade space-y-6">
      {/* Filtering Selector */}
      <div style={{ display: 'flex', gap: 12, background: 'white', padding: 16, borderRadius: '2px', border: '1.5px solid #e5e7eb' }}>
        <div style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#4b5563' }}>Kỳ kế toán báo cáo:</span>
          <select className="input-field" style={{ width: 140, borderRadius: '2px', border: '1px solid #e5e7eb' }} value={selectedQuarter} onChange={e => setSelectedQuarter(e.target.value)}>
            <option value="Q1">Quý I</option>
            <option value="Q2">Quý II</option>
            <option value="Q3">Quý III</option>
            <option value="Q4">Quý IV</option>
          </select>
          <select className="input-field" style={{ width: 120, borderRadius: '2px', border: '1px solid #e5e7eb' }} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            <option value="2026">Năm 2026</option>
            <option value="2025">Năm 2025</option>
          </select>
        </div>
        <button className="btn btn-blue" style={{ height: 38, borderRadius: '2px', fontWeight: 600, display: 'flex', align: 'center', gap: 6 }} onClick={() => window.print()}>
          <Printer size={14} /> In Báo Cáo Tài Chính
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Tờ khai Thuế GTGT & Thu nhập tạm tính */}
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 20 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#0f0f0e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>
            Báo Cáo Thuế GTGT & TNDN Quyết Toán
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12.5, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4b5563' }}>Doanh thu tính thuế GTGT (10%):</span>
              <span className="mono" style={{ fontWeight: 600, marginLeft: 8 }}>{fmt(taxSummary.revenue)}</span>
            </div>
            <div style={{ fontSize: 12.5, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4b5563' }}>Thuế GTGT đầu ra phát sinh (A):</span>
              <span className="mono" style={{ fontWeight: 600, color: '#be123c', marginLeft: 8 }}>{fmt(taxSummary.vatOutput)}</span>
            </div>
            <div style={{ fontSize: 12.5, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4b5563' }}>Thuế GTGT đầu vào khấu trừ ước tính (B):</span>
              <span className="mono" style={{ fontWeight: 600, color: '#15803d', marginLeft: 8 }}>{fmt(taxSummary.vatInput)}</span>
            </div>
            <div style={{ fontSize: 12.5, background: '#f8fafc', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '2px', fontWeight: 700, margin: '4px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#0f0f0e' }}>Thuế GTGT phải nộp ngân sách (A - B):</span>
              <span className="mono" style={{ color: taxSummary.netVATPayable >= 0 ? '#be123c' : '#15803d', marginLeft: 8 }}>{fmt(taxSummary.netVATPayable)}</span>
            </div>

            <div style={{ height: 10 }} />
            
            <div style={{ fontSize: 12.5, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4b5563' }}>Lợi nhuận kế toán trước thuế (EBT):</span>
              <span className="mono" style={{ fontWeight: 600, marginLeft: 8 }}>{fmt(taxSummary.ebt)}</span>
            </div>
            <div style={{ fontSize: 12.5, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4b5563' }}>Thuế TNDN tạm tính theo quý (20%):</span>
              <span className="mono" style={{ fontWeight: 700, color: '#be123c', marginLeft: 8 }}>{fmt(taxSummary.citTax)}</span>
            </div>
            <div style={{ fontSize: 12.5, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4b5563' }}>Quyết toán thuế TNCN nhân viên (PIT):</span>
              <span className="mono" style={{ fontWeight: 700, color: '#be123c', marginLeft: 8 }}>{fmt(taxSummary.pitTax)}</span>
            </div>
          </div>
        </div>

        {/* BCTC Tóm Tắt (Balance Sheet / P&L) */}
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 20 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 800, color: '#0f0f0e', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>
            Báo Cáo Kết Quả HĐKD (P&L Thuế) Tóm Tắt
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12.5, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#0f0f0e', fontWeight: 600 }}>1. Doanh thu thuần bán hàng & dịch vụ:</span>
              <span className="mono" style={{ fontWeight: 700, color: '#1e40af', marginLeft: 8 }}>{fmt(taxSummary.revenue)}</span>
            </div>
            <div style={{ fontSize: 12.5, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4b5563', paddingLeft: 12 }}>- Giá vốn hàng bán (COGS - Nguyên liệu):</span>
              <span className="mono" style={{ fontWeight: 600, marginLeft: 8 }}>{fmt(taxSummary.cogs)}</span>
            </div>
            <div style={{ fontSize: 12.5, borderBottom: '1.5px solid #e5e7eb', paddingBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#0f0f0e' }}>2. Lợi nhuận gộp về bán hàng (GP):</span>
              <span className="mono" style={{ color: '#15803d', marginLeft: 8 }}>{fmt(taxSummary.revenue - taxSummary.cogs)}</span>
            </div>
            
            <div style={{ fontSize: 12.5, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4b5563', paddingLeft: 12 }}>- Chi phí vận hành & cố định (OPEX):</span>
              <span className="mono" style={{ fontWeight: 600, marginLeft: 8 }}>{fmt(taxSummary.opex)}</span>
            </div>
            <div style={{ fontSize: 12.5, borderBottom: '1px solid #f1f5f9', paddingBottom: 6, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4b5563', paddingLeft: 12 }}>- Chi phí phát sinh bất thường:</span>
              <span className="mono" style={{ fontWeight: 600, marginLeft: 8 }}>{fmt(taxSummary.otherExp)}</span>
            </div>

            <div style={{ fontSize: 12.5, background: '#eff6ff', padding: '8px 10px', border: '1px solid #bfdbfe', borderRadius: '2px', fontWeight: 700, margin: '4px 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#1e40af' }}>3. Lợi nhuận ròng sau thuế ước tính:</span>
              <span className="mono" style={{ color: taxSummary.citTax >= 0 && (taxSummary.ebt - taxSummary.citTax) >= 0 ? '#15803d' : '#be123c', marginLeft: 8 }}>
                {fmt(taxSummary.ebt - taxSummary.citTax)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
