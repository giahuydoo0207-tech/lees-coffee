import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays, AlertOctagon, Users, ChevronLeft, ChevronRight,
  Plus, CheckCircle2, Clock, AlertTriangle, Wrench, ShoppingCart,
  Zap, Shield, MessageSquareWarning, BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ── HELPERS ──
const fmt = n => new Intl.NumberFormat('vi-VN').format(n || 0) + ' ₫';
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fmtDate = d => {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const genId = () => Math.random().toString(36).slice(2, 9);
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v != null ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ── SEED DATA ──
export const makeScheduleSeed = () => {
  const STAFF_LIST = ['Panda', 'Bé Na', 'Duy', 'Thanh', 'Phương', 'Hân', 'Ngọc', 'Phúc'];
  const shifts = ['morning', 'afternoon'];
  const roles = ['cashier', 'barista'];
  const schedule = [];

  // Tạo lịch cho 14 ngày (tuần này + tuần tới)
  for (let i = -3; i < 11; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    STAFF_LIST.forEach((name, idx) => {
      const dayFactor = d.getDay(); // 0=CN, 1=T2...
      // Chỉ xếp ca ngẫu nhiên xoay vòng để trông chân thực và gọn gàng
      if ((idx + dayFactor) % 2 === 0) {
        const shiftIdx = (idx + dayFactor) % 2;
        const shift = shifts[shiftIdx];
        schedule.push({
          id: genId(),
          date: ds,
          staffName: name,
          shift: shift,
          roleType: idx % 2 === 0 ? 'barista' : 'cashier',
          timeIn: shift === 'morning' ? '06:00' : '14:00',
          timeOut: shift === 'morning' ? '14:00' : '22:00',
          note: '',
          swapRequest: null
        });
      }
    });
  }
  return schedule;
};

export const makeIncidentsSeed = () => [
  {
    id: 'inc-1',
    date: '2026-05-20',
    reportedBy: 'Nguyễn Văn Nam',
    type: 'equipment',
    severity: 'urgent',
    title: 'Máy pha espresso bị rò nước',
    description: 'Máy Simonelli bị rò nước ở khớp nối đầu pha. Đã tắt máy, chuyển sang dùng máy dự phòng.',
    action: 'Tắt máy chính, sử dụng máy backup. Đã báo kỹ thuật.',
    status: 'acknowledged',
    acknowledgedBy: 'Lê Văn Cường'
  },
  {
    id: 'inc-2',
    date: '2026-05-21',
    reportedBy: 'Trần Minh Tâm',
    type: 'customer',
    severity: 'normal',
    title: 'Khách phàn nàn đồ uống chờ quá lâu',
    description: 'Khách bàn 5 phản ánh chờ Freeze Matcha hơn 20 phút trong giờ cao điểm chiều.',
    action: 'Xin lỗi khách, phục vụ thêm nước lọc miễn phí và ưu tiên xử lý đơn ngay.',
    status: 'pending',
    acknowledgedBy: null
  }
];

// ── 1. 📅 XEM LỊCH PHÂN CA (StaffSchedule) ──
export const StaffSchedule = ({ user }) => {
  const [schedule, setSchedule] = useState(() => LS.get('lc_schedule', makeScheduleSeed()));
  const [weekOffset, setWeekOffset] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [swapReason, setSwapReason] = useState('');

  useEffect(() => { LS.set('lc_schedule', schedule); }, [schedule]);

  // Tính 7 ngày của tuần đang xem
  const weekDays = useMemo(() => {
    const days = [];
    const now = new Date();
    // Tìm thứ Hai đầu tuần
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + mondayOffset + i + weekOffset * 7);
      days.push({
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        label: d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        isToday: d.toDateString() === now.toDateString()
      });
    }
    return days;
  }, [weekOffset]);

  const shiftColors = {
    morning: { bg: '#e2f1e8', color: '#166534', label: 'Ca Sáng', time: '06:00–14:00' },
    mid: { bg: '#f3e8ff', color: '#6b21a8', label: 'Làm Giữa Ca', time: '10:00–18:00' },
    afternoon: { bg: '#e0e7ff', color: '#3730a3', label: 'Ca Chiều', time: '14:00–22:00' }
  };

  // Lịch của bản thân
  const mySlots = useMemo(() => {
    return schedule.filter(s => s.staffName === user.name);
  }, [schedule, user.name]);

  const getMySlot = (date) => mySlots.find(s => s.date === date);

  const handleSwapRequest = (slot) => {
    setSelectedSlot(slot);
    setSwapReason(slot.swapRequest || '');
    setShowSwapModal(true);
  };

  const handleSaveSwap = () => {
    const updated = schedule.map(s =>
      s.id === selectedSlot.id ? { ...s, swapRequest: swapReason.trim() || null } : s
    );
    setSchedule(updated);
    setShowSwapModal(false);
    setSwapReason('');
    alert(swapReason.trim() ? '✓ Đã gửi yêu cầu đổi ca đến quản lý!' : '✓ Đã huỷ yêu cầu đổi ca.');
  };

  // Tính tổng ca tuần này
  const weekSlots = mySlots.filter(s => weekDays.some(d => d.date === s.date));

  return (
    <div className="fade space-y-6">
      {/* Header */}
      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f0f0e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarDays size={18} style={{ color: '#1e40af' }} /> LỊCH PHÂN CA LÀM VIỆC CÁ NHÂN
        </h2>
        <p style={{ fontSize: 12.5, color: '#4b5563', lineHeight: 1.5, margin: 0 }}>
          Xem lịch ca của bản thân theo tuần. Nếu cần đổi ca, bấm vào ô ca tương ứng để gửi yêu cầu lên Quản Lý Quán.
        </p>
      </div>

      {/* Week navigator + Summary */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <div style={{ flex: 1, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            style={{ width: 32, height: 32, border: '1.5px solid #e5e7eb', borderRadius: '2px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
            onClick={() => setWeekOffset(weekOffset - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0f0f0e' }}>
              {weekOffset === 0 ? 'Tuần Này' : weekOffset === 1 ? 'Tuần Sau' : weekOffset === -1 ? 'Tuần Trước' : `${weekOffset > 0 ? '+' : ''}${weekOffset} tuần`}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
              {fmtDate(weekDays[0]?.date)} – {fmtDate(weekDays[6]?.date)}
            </div>
          </div>
          <button
            style={{ width: 32, height: 32, border: '1.5px solid #e5e7eb', borderRadius: '2px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
            onClick={() => setWeekOffset(weekOffset + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Summary stats */}
        {[
          ['Ca tuần này', weekSlots.length + ' ca', '#1e40af', '#eff6ff'],
          ['Ca sáng', weekSlots.filter(s => s.shift === 'morning').length + ' ca', '#166534', '#e2f1e8'],
          ['Ca chiều', weekSlots.filter(s => s.shift === 'afternoon').length + ' ca', '#3730a3', '#e0e7ff']
        ].map(([l, v, c, bg]) => (
          <div key={l} style={{ background: bg, border: `1.5px solid ${c}44`, borderRadius: '2px', padding: '10px 16px', minWidth: 100, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Weekly calendar grid */}
      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '2px solid #e5e7eb' }}>
          {weekDays.map(day => (
            <div
              key={day.date}
              style={{
                padding: '10px 8px',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: day.isToday ? 'white' : '#64748b',
                background: day.isToday ? '#1e40af' : '#f8fafc',
                borderRight: '1px solid #e5e7eb',
                letterSpacing: '0.02em'
              }}
            >
              {day.label}
            </div>
          ))}
        </div>

        {/* Shift cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: 140 }}>
          {weekDays.map((day, idx) => {
            const slot = getMySlot(day.date);
            const sc = slot ? shiftColors[slot.shift] : null;
            return (
              <div
                key={day.date}
                style={{
                  borderRight: idx < 6 ? '1px solid #e5e7eb' : 'none',
                  padding: 8,
                  background: day.isToday ? '#eff6ff' : 'white',
                  cursor: slot ? 'pointer' : 'default',
                  transition: 'background 0.1s'
                }}
                className={slot ? 'table-row-hover' : ''}
                onClick={() => slot && handleSwapRequest(slot)}
              >
                {slot ? (
                  <div style={{
                    background: sc.bg,
                    border: `1.5px solid ${sc.color}44`,
                    borderRadius: '2px',
                    padding: '8px 10px',
                    position: 'relative'
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {sc.label}
                    </div>
                    <div style={{ fontSize: 11, color: sc.color, marginTop: 2, fontWeight: 600 }}>
                      {sc.time}
                    </div>
                    <div style={{
                      fontSize: 9.5, marginTop: 4, fontWeight: 700,
                      color: slot.roleType === 'barista' ? '#d97706' : '#1e40af',
                      background: slot.roleType === 'barista' ? '#fffbeb' : '#eff6ff',
                      padding: '1px 5px', borderRadius: '2px', display: 'inline-block',
                      border: `1px solid ${slot.roleType === 'barista' ? '#fcd34d' : '#bfdbfe'}`
                    }}>
                      {slot.roleType === 'barista' ? 'Pha Chế' : 'Thu Ngân'}
                    </div>
                    {slot.swapRequest && (
                      <div style={{ fontSize: 9, color: '#be123c', marginTop: 4, fontWeight: 700 }}>
                        ⏳ Chờ duyệt đổi ca
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
                    <span style={{ fontSize: 11, color: '#d1d5db', fontWeight: 500 }}>Nghỉ</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: 11.5, color: '#6b7280', fontStyle: 'italic', paddingLeft: 4 }}>
        💡 Bấm vào ô ca để gửi yêu cầu đổi ca đến Quản Lý Quán. Yêu cầu sẽ hiển thị trạng thái "Chờ duyệt đổi ca".
      </div>

      {/* Swap Modal */}
      {showSwapModal && selectedSlot && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="fade" style={{
            background: 'white', padding: 24, borderRadius: '2px',
            width: '100%', maxWidth: 420, border: '1.5px solid #0f0f0e',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f0f0e', marginBottom: 12, borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>
              {selectedSlot.swapRequest ? 'CẬP NHẬT YÊU CẦU ĐỔI CA' : 'GỬI YÊU CẦU ĐỔI CA'}
            </h3>

            <div style={{ background: '#f8fafc', padding: 12, border: '1.5px solid #e5e7eb', borderRadius: '2px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Ca cần đổi:</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f0f0e', marginTop: 2 }}>
                {fmtDate(selectedSlot.date)} — {shiftColors[selectedSlot.shift]?.label} ({shiftColors[selectedSlot.shift]?.time})
              </div>
              <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 4 }}>
                Vai trò: <b>{selectedSlot.roleType === 'barista' ? 'Pha Chế' : 'Thu Ngân'}</b>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                Lý do muốn đổi ca (bắt buộc nếu muốn gửi yêu cầu)
              </label>
              <textarea
                className="input-field"
                rows={3}
                style={{ borderRadius: '2px', border: '1.5px solid #e5e7eb' }}
                value={swapReason}
                onChange={e => setSwapReason(e.target.value)}
                placeholder="Ví dụ: Có việc gia đình đột xuất, xin đổi sang ca chiều hoặc nhờ bạn Tâm đổi ca giúp..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-gray" style={{ borderRadius: '2px', height: 34 }} onClick={() => setShowSwapModal(false)}>Đóng</button>
              {selectedSlot.swapRequest && (
                <button className="btn btn-red" style={{ borderRadius: '2px', height: 34 }} onClick={() => { setSwapReason(''); handleSaveSwap(); }}>
                  Huỷ Yêu Cầu
                </button>
              )}
              <button className="btn btn-blue" style={{ borderRadius: '2px', height: 34 }} onClick={handleSaveSwap} disabled={!swapReason.trim()}>
                Gửi Yêu Cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ── 2. 📢 BÁO CÁO SỰ CỐ (StaffIncidents) ──
export const StaffIncidents = ({ user }) => {
  const [incidents, setIncidents] = React.useState(() => LS.get('lc_incidents', makeIncidentsSeed()));
  const [showForm, setShowForm]   = React.useState(false);
  const [title, setTitle]         = React.useState('');
  const [desc, setDesc]           = React.useState('');
  const [actionNote, setActionNote] = React.useState('');
  const [severity, setSeverity]   = React.useState('low');

  React.useEffect(() => { LS.set('lc_incidents', incidents); }, [incidents]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const inc = {
      id: genId(),
      date: todayStr(),
      title: title.trim(),
      desc: desc.trim(),
      action: actionNote.trim(),
      severity,
      reportedBy: user ? user.name : '',
    };
    setIncidents(prev => [inc, ...prev]);
    setTitle(''); setDesc(''); setActionNote(''); setSeverity('low'); setShowForm(false);
  };

  const severityColors = {
    low:  { bg: '#f0fdf4', border: '#86efac', text: '#166534', label: 'NHE' },
    mid:  { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', label: 'TRUNG BINH' },
    high: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', label: 'NGHIEM TRONG' },
  };

  return (
    <div style={{ padding: '0 0 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>Bao Cao Su Co</h2>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>Ghi nhan va theo doi su co trong ca truc</p>
        </div>
        <button
          className="btn btn-blue"
          style={{ borderRadius: '2px', height: 36, paddingLeft: 14, paddingRight: 14 }}
          onClick={() => setShowForm(true)}
        >
          + Bao Cao Su Co Moi
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000 }}>
          <div style={{ background: 'white', borderRadius: '2px', padding: 24, width: '100%', maxWidth: 440, border: '1.5px solid #1e40af', boxShadow: '0 16px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Bao Cao Su Co Moi</div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>x</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Muc do nghiem trong</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['low', 'mid', 'high'].map(s => {
                    const c = severityColors[s];
                    return (
                      <button key={s} type="button"
                        onClick={() => setSeverity(s)}
                        style={{ flex: 1, padding: '6px 4px', fontSize: 10, fontWeight: 700, borderRadius: '2px', cursor: 'pointer',
                          background: severity === s ? c.bg : '#f8fafc',
                          border: '1.5px solid ' + (severity === s ? c.border : '#e5e7eb'),
                          color: severity === s ? c.text : '#374151' }}>
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Tieu de su co</label>
                <input
                  className="input-field"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Mo ta ngan gon su co..."
                  style={{ borderRadius: '2px', padding: '8px 12px', border: '1.5px solid #e5e7eb' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Chi tiet su co</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Mo ta chi tiet..."
                  style={{ borderRadius: '2px', border: '1.5px solid #e5e7eb', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Bien phap xu ly tam thoi</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                  placeholder="Bien phap da xu ly..."
                  style={{ borderRadius: '2px', border: '1.5px solid #e5e7eb', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-gray" style={{ borderRadius: '2px', height: 34 }}
                  onClick={() => { setShowForm(false); setTitle(''); setDesc(''); setActionNote(''); setSeverity('low'); }}>
                  Huy
                </button>
                <button type="submit" className="btn btn-blue" style={{ borderRadius: '2px', height: 34 }}>
                  Gui Bao Cao
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        {incidents.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af', fontSize: 13 }}>
            Chua co bao cao su co nao. Nhan nut tren de tao moi.
          </div>
        )}
        {incidents.map(inc => {
          const c = severityColors[inc.severity] || severityColors.low;
          return (
            <div key={inc.id} style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: '2px', background: c.bg, color: c.text, border: '1px solid ' + c.border }}>
                      {c.label}
                    </span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>{inc.date}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>- {inc.reportedBy}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{inc.title}</div>
                  {inc.desc && <div style={{ fontSize: 12, color: '#374151', marginBottom: 3 }}>{inc.desc}</div>}
                  {inc.action && <div style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>Bien phap: {inc.action}</div>}
                </div>
                <button
                  onClick={() => setIncidents(prev => prev.filter(x => x.id !== inc.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, fontSize: 16 }}>
                  x
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
