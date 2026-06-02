import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Minus, BarChart2, PieChart as PieChartIcon,
  Coffee, Plus, Pencil, Trash2, Check, X, Search, Tag,
  Package, AlertTriangle, Copy, Settings, Bell, RefreshCw, Eye, Percent,
  ChevronDown, ChevronLeft, ChevronRight, Clock, Calendar, UserPlus, Edit3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// ── HELPERS ──
const fmt  = n => new Intl.NumberFormat('vi-VN').format(n || 0) + ' ₫';
const fmtK = n => { if (!n) return '0'; if (n >= 1e6) return (n/1e6).toFixed(1)+'M'; if (n >= 1e3) return Math.round(n/1e3)+'K'; return ''+n; };
const fmtDate = d => { if (!d) return ''; const dt = new Date(d+'T00:00:00'); return dt.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}); };
const todayStr = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const genId = () => Math.random().toString(36).slice(2,9);
const LS = {
  get: (k,d) => { try { const v=localStorage.getItem(k); return v!=null?JSON.parse(v):d; } catch { return d; } },
  set: (k,v) => localStorage.setItem(k,JSON.stringify(v)),
};

const calcR = r => {
  const rev = (r.cashRevenue||0)+(r.transferRevenue||0)+(r.cardRevenue||0)+(r.grabRevenue||0)+(r.shopeeRevenue||0);
  const exp = (r.goodsCost||0)+(r.fixedExpenses||[]).reduce((s,e)=>s+(e.amount||0),0)+(r.otherExpenses||[]).reduce((s,e)=>s+(e.amount||0),0);
  return { rev, exp, profit: rev - exp };
};

// ── DEFAULT CATALOG (same as ShiftForm) ──
const DEFAULT_CATALOG = [
  { id:'c01', name:'Cà Phê Sữa Đá Nguyên Bản',    price:25000, cat:'coffee',   active:true },
  { id:'c02', name:'Cà Phê Sữa Đá Đậm',           price:30000, cat:'coffee',   active:true },
  { id:'c03', name:'Cà Phê Phin Đen Đá',           price:25000, cat:'coffee',   active:true },
  { id:'c04', name:'Cà Phê Phin Đen Đá Đậm',      price:25000, cat:'coffee',   active:true },
  { id:'c05', name:'Bạc Xỉu Đá',                  price:25000, cat:'coffee',   active:true },
  { id:'c06', name:'Cà Phê Muối',                  price:30000, cat:'coffee',   active:true },
  { id:'c07', name:'Cà Phê Cốt Dừa',              price:30000, cat:'coffee',   active:true },
  { id:'c08', name:'Espresso',                     price:25000, cat:'coffee',   active:true },
  { id:'c09', name:'Latte',                        price:25000, cat:'coffee',   active:true },
  { id:'c10', name:'Capuchino',                    price:25000, cat:'coffee',   active:true },
  { id:'c11', name:'Americano',                    price:25000, cat:'coffee',   active:true },
  { id:'c12', name:'Cà Phê Chai Original',         price:139000,cat:'coffee',   active:true },
  { id:'c13', name:'Cà Phê Chai Vanilla',          price:139000,cat:'coffee',   active:true },
  { id:'c14', name:'Cà Phê Chai Triple Shot',      price:179000,cat:'coffee',   active:true },
  { id:'m01', name:'Sữa Tươi Trân Châu Đường Đen',price:25000, cat:'milk_tea', active:true },
  { id:'m02', name:'Trà Sữa Lài Ngọc Trai',       price:25000, cat:'milk_tea', active:true },
  { id:'m03', name:'Hồng Trà Sữa Ngọc Trai',      price:25000, cat:'milk_tea', active:true },
  { id:'m04', name:'Cốt Dừa Cacao',               price:35000, cat:'milk_tea', active:true },
  { id:'m05', name:'Matcha Hương Xuân',            price:39000, cat:'milk_tea', active:true },
  { id:'m06', name:'Freeze Matcha Dừa Non',        price:39000, cat:'milk_tea', active:true },
  { id:'m07', name:'Freeze Matcha Dừa Xoài',      price:39000, cat:'milk_tea', active:true },
  { id:'t01', name:'Trà Sen Phủ Kem Muối',        price:35000, cat:'tea',      active:true },
  { id:'t02', name:'Trà Vải Hồng Phủ Kem Muối',  price:35000, cat:'tea',      active:true },
  { id:'t03', name:'Trà Nho Nhã Phủ Kem Muối',   price:35000, cat:'tea',      active:true },
  { id:'t04', name:'Trà Dâu Phủ Kem Muối',       price:35000, cat:'tea',      active:true },
  { id:'t05', name:'Trà Tắc / Chanh',             price:10000, cat:'tea',      active:true },
  { id:'t06', name:'Trà Mãng Cầu',               price:35000, cat:'tea',      active:true },
  { id:'t07', name:'Trà Mơ Xí Muội',             price:35000, cat:'tea',      active:true },
  { id:'t08', name:'Trà Ổi Hồng',                price:35000, cat:'tea',      active:true },
  { id:'j01', name:'Nước Ép Ổi / Xoài / Dưa Hấu',price:20000,cat:'juice',    active:true },
  { id:'j02', name:'Thơm (Nước Ép)',              price:30000, cat:'juice',    active:true },
  { id:'j03', name:'Nước Ép Cam / Bưởi / Táo / Quýt',price:35000,cat:'juice', active:true },
  { id:'j04', name:'Nước Mía Nguyên Bản',         price:15000, cat:'juice',    active:true },
  { id:'j05', name:'Nước Mía Tắc',               price:20000, cat:'juice',    active:true },
  { id:'j06', name:'Nước Mía Dừa',               price:20000, cat:'juice',    active:true },
  { id:'j07', name:'Nước Mía Sầu Riêng',         price:30000, cat:'juice',    active:true },
  { id:'j08', name:'Nước Mía Kem Muối',           price:20000, cat:'juice',    active:true },
];

export const makeCatalogSeed = () => {
  if (!LS.get('lc_catalog', null)) LS.set('lc_catalog', DEFAULT_CATALOG);
};

const CAT_META = {
  coffee:   { label: 'Cà Phê',    color: '#7c3aed', bg: '#ede9fe', emoji: '' },
  milk_tea: { label: 'Trà Sữa',   color: '#0369a1', bg: '#e0f2fe', emoji: '' },
  tea:      { label: 'Trà',       color: '#15803d', bg: '#dcfce7', emoji: '' },
  juice:    { label: 'Nước Ép',   color: '#d97706', bg: '#fef3c7', emoji: '' },
};

// ═══════════════════════════════════════════════
// 1. 📊 PHÂN TÍCH HIỆU SUẤT KINH DOANH
// ═══════════════════════════════════════════════
export const MgrPerformance = ({ reports }) => {
  const [period, setPeriod] = useState('7');

  const approved = useMemo(() =>
    reports.filter(r => r.status === 'approved').sort((a,b) => a.date.localeCompare(b.date))
  , [reports]);

  const now = new Date();
  const cutoff = (days) => {
    const d = new Date(now); d.setDate(d.getDate() - days);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const periodData = useMemo(() =>
    approved.filter(r => r.date >= cutoff(Number(period)))
  , [approved, period]);

  const prevData = useMemo(() =>
    approved.filter(r => r.date >= cutoff(Number(period)*2) && r.date < cutoff(Number(period)))
  , [approved, period]);

  const total = useMemo(() => periodData.reduce((acc, r) => {
    const { rev, exp, profit } = calcR(r);
    return {
      rev: acc.rev + rev, exp: acc.exp + exp, profit: acc.profit + profit,
      cash:   acc.cash   + (r.cashRevenue||0),
      tf:     acc.tf     + (r.transferRevenue||0),
      card:   acc.card   + (r.cardRevenue||0),
      grab:   acc.grab   + (r.grabRevenue||0),
      shopee: acc.shopee + (r.shopeeRevenue||0),
    };
  }, { rev:0, exp:0, profit:0, cash:0, tf:0, card:0, grab:0, shopee:0 }), [periodData]);

  const prevTotal = useMemo(() => prevData.reduce((acc, r) => {
    const { rev } = calcR(r); return { rev: acc.rev + rev };
  }, { rev:0 }), [prevData]);

  const pct = prevTotal.rev > 0 ? ((total.rev - prevTotal.rev) / prevTotal.rev * 100).toFixed(1) : null;

  // Bar chart data
  const barData = useMemo(() => periodData.map(r => {
    const { rev, profit } = calcR(r);
    return { name: r.date.slice(5), DT: Math.round(rev/1000), LN: Math.round(profit/1000) };
  }), [periodData]);

  // Pie chart data — 5 kênh
  const pieData = useMemo(() => [
    { name: 'Tiền mặt',    value: total.cash,   color: '#1e40af' },
    { name: 'Chuyển khoản',value: total.tf,     color: '#3b82f6' },
    { name: 'Thẻ ATM',     value: total.card,   color: '#7c3aed' },
    { name: 'Grab Food',   value: total.grab,   color: '#15803d' },
    { name: 'Shopee',      value: total.shopee, color: '#d97706' },
  ].filter(d => d.value > 0), [total]);

  const KPICard = ({ label, value, sub, color, trend }) => (
    <div style={{ background:'white', border:'1.5px solid #e5e7eb', borderRadius:'2px', padding:'16px 18px', borderTop:`3px solid ${color}` }}>
      <div style={{ fontSize:10, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:800, color, lineHeight:1 }} className="mono">{value}</div>
      {sub && <div style={{ fontSize:11, color:'#9ca3af', marginTop:5, fontWeight:500 }}>{sub}</div>}
      {trend !== undefined && trend !== null && (
        <div style={{ fontSize:11, fontWeight:700, color: trend >= 0 ? '#15803d' : '#be123c', marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
          {trend >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
          {trend >= 0 ? '+' : ''}{trend}% so với kỳ trước
        </div>
      )}
    </div>
  );

  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Period selector */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12, fontWeight:700, color:'#4b5563' }}>Xem theo:</span>
        {[['7','7 ngày'],['14','14 ngày'],['30','30 ngày']].map(([k,l]) => (
          <button key={k} onClick={() => setPeriod(k)} style={{
            padding:'5px 14px', borderRadius:'2px', fontSize:12, fontWeight:700, cursor:'pointer',
            background: period===k ? '#1e40af' : 'white',
            color: period===k ? 'white' : '#4b5563',
            border: period===k ? '1.5px solid #1e40af' : '1.5px solid #e5e7eb',
            transition:'all 0.1s'
          }}>{l}</button>
        ))}
        <span style={{ fontSize:11, color:'#9ca3af', marginLeft:8 }}>{periodData.length} ngày có dữ liệu</span>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14 }}>
        <KPICard label="Tổng Doanh Thu" value={fmtK(total.rev)+' ₫'} sub={`${periodData.length} ngày được duyệt`} color="#1e40af" trend={pct !== null ? Number(pct) : null} />
        <KPICard label="Tổng Chi Phí" value={fmtK(total.exp)+' ₫'} sub="COGS + vận hành + phát sinh" color="#be123c" />
        <KPICard label="Lợi Nhuận Ròng" value={fmtK(total.profit)+' ₫'} sub={total.rev > 0 ? 'Biên LN: '+(total.profit/total.rev*100).toFixed(1)+'%' : ''} color={total.profit >= 0 ? '#15803d' : '#be123c'} />
        <KPICard label="Doanh Thu / Ngày TB" value={periodData.length > 0 ? fmtK(Math.round(total.rev/periodData.length))+' ₫' : '—'} color="#d97706" />
      </div>

      {/* Trend bar chart */}
      <div style={{ background:'white', border:'1.5px solid #e5e7eb', borderRadius:'2px', padding:20 }}>
        <div style={{ fontSize:11, fontWeight:800, color:'#0f0f0e', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:14 }}>
          XU HƯỚNG DOANH THU & LỢI NHUẬN THEO NGÀY
        </div>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize:10, fill:'#64748b' }} stroke="#e5e7eb" />
              <YAxis tick={{ fontSize:10, fill:'#64748b' }} stroke="#e5e7eb" tickFormatter={v => v+'K'} />
              <Tooltip
                contentStyle={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'2px', fontSize:11.5 }}
                formatter={(v,n) => [fmtK(v*1000)+' ₫', n==='DT'?'Doanh thu':'Lợi nhuận']}
              />
              <Legend formatter={v => v==='DT'?'Doanh thu':'Lợi nhuận'} wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="DT" fill="#1e40af" radius={0} />
              <Bar dataKey="LN" fill="#15803d" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#9ca3af', fontSize:13 }}>
            Chưa đủ dữ liệu được duyệt để vẽ biểu đồ
          </div>
        )}
      </div>

      {/* Bottom row: comparison + pie */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16 }}>
        {/* Week comparison table */}
        <div style={{ background:'white', border:'1.5px solid #e5e7eb', borderRadius:'2px', padding:20 }}>
          <div style={{ fontSize:11, fontWeight:800, color:'#0f0f0e', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:14 }}>
            SO SÁNH KỲ NÀY vs KỲ TRƯỚC ({period} ngày)
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
            <thead>
              <tr style={{ borderBottom:'2px solid #e5e7eb', background:'#f8fafc' }}>
                {['Chỉ Số','Kỳ Trước','Kỳ Này','Thay Đổi'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign:h==='Chỉ Số'?'left':'right', fontSize:10.5, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const prevTotals = prevData.reduce((acc,r) => {
                  const { rev,exp,profit } = calcR(r);
                  return { rev:acc.rev+rev, exp:acc.exp+exp, profit:acc.profit+profit };
                }, { rev:0, exp:0, profit:0 });
                return [
                  ['Doanh thu', prevTotals.rev, total.rev],
                  ['Chi phí', prevTotals.exp, total.exp],
                  ['Lợi nhuận', prevTotals.profit, total.profit],
                ].map(([label, prev, curr], idx) => {
                  const diff = curr - prev;
                  const pct2 = prev > 0 ? ((diff/prev)*100).toFixed(1) : null;
                  const up = diff >= 0;
                  return (
                    <tr key={label} style={{ borderBottom:'1px solid #f1f5f9', background:idx%2===0?'white':'#f8fafc' }}>
                      <td style={{ padding:'10px 12px', fontWeight:700, color:'#0f0f0e' }}>{label}</td>
                      <td style={{ padding:'10px 12px', textAlign:'right', color:'#6b7280' }} className="mono">{fmtK(prev)} ₫</td>
                      <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:700, color:'#1e40af' }} className="mono">{fmtK(curr)} ₫</td>
                      <td style={{ padding:'10px 12px', textAlign:'right' }}>
                        <span style={{
                          background: up ? '#d1fae5' : '#fee2e2',
                          color: up ? '#065f46' : '#be123c',
                          padding:'2px 8px', borderRadius:'2px', fontSize:11, fontWeight:700,
                          border:`1px solid ${up ? '#a7f3d0' : '#fca5a5'}`
                        }}>
                          {up ? '▲' : '▼'} {pct2 !== null ? Math.abs(Number(pct2))+'%' : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Channel pie */}
        <div style={{ background:'white', border:'1.5px solid #e5e7eb', borderRadius:'2px', padding:20 }}>
          <div style={{ fontSize:11, fontWeight:800, color:'#0f0f0e', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:10 }}>
            TỶ TRỌNG 5 KÊNH DOANH THU
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={68} paddingAngle={2}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [fmtK(v)+' ₫']} contentStyle={{ fontSize:11, borderRadius:'2px', border:'1px solid #e5e7eb' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11.5 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:10, height:10, borderRadius:'1px', background:d.color, flexShrink:0 }} />
                      <span style={{ color:'#4b5563', fontWeight:600 }}>{d.name}</span>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ color:d.color, fontWeight:700 }} className="mono">{total.rev > 0 ? (d.value/total.rev*100).toFixed(1)+'%' : '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#9ca3af', fontSize:12 }}>Chưa có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════
// 2. 📋 QUẢN LÝ THỰC ĐƠN & GIÁ BÁN
// ═══════════════════════════════════════════════
export const MgrMenu = () => {
  const [catalog, setCatalog] = useState(() => LS.get('lc_catalog', DEFAULT_CATALOG));
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCat, setEditCat] = useState('coffee');
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addCat, setAddCat] = useState('coffee');

  useEffect(() => { LS.set('lc_catalog', catalog); }, [catalog]);

  const filtered = useMemo(() =>
    catalog.filter(item =>
      (filterCat === 'all' || item.cat === filterCat) &&
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  , [catalog, filterCat, search]);

  const stats = useMemo(() => ({
    total: catalog.length,
    active: catalog.filter(i => i.active).length,
    bycat: Object.fromEntries(Object.keys(CAT_META).map(k => [k, catalog.filter(i => i.cat === k).length]))
  }), [catalog]);

  const startEdit = (item) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditCat(item.cat);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editPrice) return;
    setCatalog(prev => prev.map(i => i.id === editId
      ? { ...i, name: editName.trim(), price: Number(editPrice), cat: editCat }
      : i
    ));
    setEditId(null);
  };

  const cancelEdit = () => setEditId(null);

  const toggleActive = (id) => {
    setCatalog(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i));
  };

  const deleteItem = (id) => {
    if (!window.confirm('Xoá món này khỏi thực đơn?')) return;
    setCatalog(prev => prev.filter(i => i.id !== id));
  };

  const handleAdd = () => {
    if (!addName.trim() || !addPrice) return;
    const newItem = { id: 'u-'+genId(), name: addName.trim(), price: Number(addPrice), cat: addCat, active: true };
    setCatalog(prev => [...prev, newItem]);
    setAddName(''); setAddPrice(''); setAddCat('coffee'); setShowAdd(false);
  };

  const resetDefault = () => {
    if (!window.confirm('Khôi phục thực đơn mặc định? Các món đã thêm/sửa sẽ bị mất.')) return;
    setCatalog(DEFAULT_CATALOG);
  };

  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Header + stats */}
      <div style={{ background:'white', border:'1.5px solid #e5e7eb', borderRadius:'2px', padding:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div>
            <h2 style={{ fontSize:14, fontWeight:800, color:'#0f0f0e', margin:0 }}>
              QUẢN LÝ THỰC ĐƠN & GIÁ BÁN
            </h2>
            <p style={{ fontSize:12, color:'#6b7280', margin:'4px 0 0', lineHeight:1.4 }}>
              Thêm, sửa, ẩn món — Thu ngân sẽ thấy thực đơn cập nhật mới nhất khi kết ca.
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={resetDefault} style={{ padding:'6px 12px', borderRadius:'2px', border:'1.5px solid #e5e7eb', background:'white', fontSize:11.5, cursor:'pointer', color:'#6b7280', fontWeight:600 }}>
              Khôi phục mặc định
            </button>
            <button onClick={() => setShowAdd(true)} style={{ padding:'6px 14px', borderRadius:'2px', border:'none', background:'#1e40af', color:'white', fontSize:12, cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
              <Plus size={13} /> Thêm Món Mới
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:10 }}>
          {[
            ['Tổng Số Món', stats.total, '#0f0f0e', '#f8fafc'],
            ['Đang Bán', stats.active, '#15803d', '#dcfce7'],
            ...Object.entries(CAT_META).map(([k,m]) => [m.label, stats.bycat[k]||0, m.color, m.bg])
          ].map(([l,v,c,bg]) => (
            <div key={l} style={{ background:bg, borderRadius:'2px', padding:'8px 12px', textAlign:'center', border:`1px solid ${c}22` }}>
              <div style={{ fontSize:9.5, color:c, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' }}>{l}</div>
              <div style={{ fontSize:18, fontWeight:800, color:c, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + Search */}
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1 }}>
          <input
            className="input-field"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm tên món..."
            style={{ paddingLeft:32, borderRadius:'2px', fontSize:12.5 }}
          />
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
        </div>
        {[['all','Tất Cả'],...Object.entries(CAT_META).map(([k,m])=>[k,m.label])].map(([k,l]) => (
          <button key={k} onClick={() => setFilterCat(k)} style={{
            padding:'6px 12px', borderRadius:'2px', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
            background: filterCat===k ? '#1e40af' : 'white',
            color: filterCat===k ? 'white' : '#4b5563',
            border: filterCat===k ? '1.5px solid #1e40af' : '1.5px solid #e5e7eb',
          }}>{l}</button>
        ))}
      </div>

      {/* Menu table */}
      <div style={{ background:'white', border:'1.5px solid #e5e7eb', borderRadius:'2px', overflow:'hidden' }}>
        <div style={{ maxHeight: '420px', overflowY: 'auto' }} className="custom-scrollbar">
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10, boxShadow: '0 1px 0 #e5e7eb' }}>
              <tr style={{ background:'#f8fafc' }}>
                {['Tên Món','Nhóm','Đơn Giá','Trạng Thái',''].map((h,i) => (
                  <th key={i} style={{ padding:'10px 16px', textAlign:i===2||i===3?'center':'left', fontSize:10.5, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding:'40px', textAlign:'center', color:'#9ca3af', fontSize:13 }}>Không tìm thấy món nào</td></tr>
            ) : filtered.map((item, idx) => {
              const meta = CAT_META[item.cat] || CAT_META.coffee;
              const isEditing = editId === item.id;
              return (
                <tr key={item.id} style={{ borderBottom:idx===filtered.length-1?'none':'1px solid #f1f5f9', background: !item.active ? '#f8fafc' : idx%2===0 ? 'white' : '#fafafa', opacity: item.active ? 1 : 0.6 }} className="table-row-hover">
                  <td style={{ padding:'10px 16px', maxWidth:260 }}>
                    {isEditing ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width:'100%', border:'1.5px solid #1e40af', borderRadius:'2px', padding:'4px 8px', fontSize:12.5, background:'#eff6ff' }} />
                    ) : (
                      <span style={{ fontWeight:600, color: item.active ? '#0f0f0e' : '#9ca3af' }}>{item.name}</span>
                    )}
                  </td>
                  <td style={{ padding:'10px 16px' }}>
                    {isEditing ? (
                      <select value={editCat} onChange={e => setEditCat(e.target.value)} style={{ border:'1.5px solid #1e40af', borderRadius:'2px', padding:'4px 6px', fontSize:12, background:'#eff6ff' }}>
                        {Object.entries(CAT_META).map(([k,m]) => <option key={k} value={k}>{m.label}</option>)}
                      </select>
                    ) : (
                      <span style={{ background:meta.bg, color:meta.color, padding:'2px 8px', borderRadius:'2px', fontSize:10.5, fontWeight:700, border:`1px solid ${meta.color}33` }}>
                        {meta.label}
                      </span>
                    )}
                  </td>
                  <td style={{ padding:'10px 16px', textAlign:'center' }}>
                    {isEditing ? (
                      <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ width:90, border:'1.5px solid #1e40af', borderRadius:'2px', padding:'4px 8px', fontSize:12.5, background:'#eff6ff', textAlign:'right' }} className="mono" />
                    ) : (
                      <span style={{ fontWeight:700, color:'#1e40af' }} className="mono">{fmt(item.price)}</span>
                    )}
                  </td>
                  <td style={{ padding:'10px 16px', textAlign:'center' }}>
                    {isEditing ? null : (
                      <button onClick={() => toggleActive(item.id)} style={{
                        padding:'3px 10px', borderRadius:'2px', fontSize:11, fontWeight:700, cursor:'pointer', border:'none',
                        background: item.active ? '#dcfce7' : '#f1f5f9',
                        color: item.active ? '#065f46' : '#9ca3af',
                      }}>
                        {item.active ? 'Đang Bán' : 'Tạm Ẩn'}
                      </button>
                    )}
                  </td>
                  <td style={{ padding:'8px 14px', textAlign:'right', whiteSpace:'nowrap' }}>
                    {isEditing ? (
                      <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                        <button onClick={saveEdit} style={{ width:28, height:28, borderRadius:'2px', border:'none', background:'#15803d', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Check size={13} />
                        </button>
                        <button onClick={cancelEdit} style={{ width:28, height:28, borderRadius:'2px', border:'1.5px solid #e5e7eb', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <X size={13} style={{ color:'#6b7280' }} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                        <button onClick={() => startEdit(item)} style={{ width:28, height:28, borderRadius:'2px', border:'1.5px solid #e5e7eb', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} className="btn-outline">
                          <Pencil size={12} style={{ color:'#4b5563' }} />
                        </button>
                        <button onClick={() => deleteItem(item.id)} style={{ width:28, height:28, borderRadius:'2px', border:'1.5px solid #fee2e2', background:'#fff1f2', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Trash2 size={12} style={{ color:'#be123c' }} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

      {/* Add item modal */}
      {showAdd && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div className="fade" style={{ background:'white', padding:24, borderRadius:'2px', width:'100%', maxWidth:400, border:'1.5px solid #0f0f0e', boxShadow:'0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:'#0f0f0e', marginBottom:16, borderBottom:'2px solid #e5e7eb', paddingBottom:8 }}>
              THÊM MÓN MỚI VÀO THỰC ĐƠN
            </h3>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>Tên món</label>
              <input className="input-field" style={{ borderRadius:'2px' }} value={addName} onChange={e => setAddName(e.target.value)} placeholder="Ví dụ: Smoothie Dâu Xoài..." />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:6 }}>Đơn giá (₫)</label>
              <input type="number" className="input-field mono" style={{ borderRadius:'2px', textAlign:'right' }} value={addPrice} onChange={e => setAddPrice(e.target.value)} placeholder="35000" />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:8 }}>Nhóm</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8 }}>
                {Object.entries(CAT_META).map(([k,m]) => (
                  <div key={k} onClick={() => setAddCat(k)} style={{ padding:'8px 10px', borderRadius:'2px', cursor:'pointer', border:`1.5px solid ${addCat===k ? m.color : '#e5e7eb'}`, background:addCat===k ? m.bg : 'white', transition:'all 0.1s', textAlign:'center' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:addCat===k ? m.color : '#6b7280' }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button className="btn btn-gray" style={{ borderRadius:'2px', height:34 }} onClick={() => { setShowAdd(false); setAddName(''); setAddPrice(''); }}>Huỷ</button>
              <button className="btn btn-blue" style={{ borderRadius:'2px', height:34 }} onClick={handleAdd} disabled={!addName.trim() || !addPrice}>Thêm vào thực đơn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// 3. ⚠️ CẢNH BÁO TỒN KHO NGUYÊN LIỆU
// ═══════════════════════════════════════════════
export const MgrInventoryAlert = () => {
  const defaultThresholds = {
    'Hạt Cà phê rang xay': 5,
    'Sữa đặc Larose hộp': 10,
    'Sữa tươi DalatMilk': 6,
    'Bột Trà xanh Matcha': 200,
    'Trân châu đường đen': 3
  };

  const defaultCustomIngredients = [
    { id: 'i1', name: 'Hạt Cà phê rang xay', unit: 'kg' },
    { id: 'i2', name: 'Sữa đặc Larose hộp', unit: 'hộp' },
    { id: 'i3', name: 'Sữa tươi DalatMilk', unit: 'l' },
    { id: 'i4', name: 'Bột Trà xanh Matcha', unit: 'g' },
    { id: 'i5', name: 'Trân châu đường đen', unit: 'kg' },
  ];

  const [thresholds, setThresholds] = useState(() => LS.get('lc_inventory_thresholds', defaultThresholds));
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editIng, setEditIng] = useState(null);
  const [editVal, setEditVal] = useState('');

  // Custom ingredient list management
  const [customIngredients, setCustomIngredients] = useState(() => LS.get('lc_custom_ingredients', defaultCustomIngredients));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('kg');
  const [newIngThreshold, setNewIngThreshold] = useState('');
  const [newIngStock, setNewIngStock] = useState('');

  // Quick stock replenishment simulation state
  const [replenishIng, setReplenishIng] = useState('');
  const [replenishVal, setReplenishVal] = useState('');
  const [replenishDeductVal, setReplenishDeductVal] = useState('');

  // Reload trigger
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    LS.set('lc_inventory_thresholds', thresholds);
  }, [thresholds]);

  useEffect(() => {
    LS.set('lc_custom_ingredients', customIngredients);
  }, [customIngredients]);

  // Computed Inventory
  const inventoryList = useMemo(() => {
    // 1. Check manager simulation first
    let inv = LS.get('lc_manager_inventory', null);
    
    // 2. Otherwise read from latest Barista shift
    if (!inv) {
      const shifts = LS.get('lc_shifts', []);
      const latestBarista = shifts.find(s => s.roleType === 'barista');
      if (latestBarista && latestBarista.ingredients) {
        inv = latestBarista.ingredients.map(ing => ({
          id: ing.id,
          name: ing.name,
          unit: ing.unit,
          current: (Number(ing.start) || 0) + (Number(ing.in) || 0) - (Number(ing.out) || 0)
        }));
      }
    }
    
    // 3. Fallback to custom ingredients list with defaults
    if (!inv) {
      const savedCustom = LS.get('lc_custom_ingredients', defaultCustomIngredients);
      inv = savedCustom.map(ing => ({
        id: ing.id,
        name: ing.name,
        unit: ing.unit,
        current: ing.stockAmount != null ? ing.stockAmount : (ing.name === 'Sữa đặc Larose hộp' ? 4 : ing.name === 'Bột Trà xanh Matcha' ? 90 : ing.name === 'Trân châu đường đen' ? 2.2 : 12)
      }));
    }
    
    return inv.map(item => {
      const limit = thresholds[item.name] != null ? thresholds[item.name] : 0;
      let status = 'safe'; // Safe
      if (item.current <= limit * 0.5) {
        status = 'danger'; // Danger
      } else if (item.current <= limit) {
        status = 'warning'; // Warning
      }
      return { ...item, threshold: limit, status };
    });
  }, [thresholds, reloadKey]);

  // Statistics
  const stats = useMemo(() => {
    const total = inventoryList.length;
    const danger = inventoryList.filter(i => i.status === 'danger').length;
    const warning = inventoryList.filter(i => i.status === 'warning').length;
    const safe = inventoryList.filter(i => i.status === 'safe').length;
    return { total, danger, warning, safe };
  }, [inventoryList]);

  // Generate Purchase Order Formatted String
  const orderText = useMemo(() => {
    const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const user = LS.get('lc_user', { name: 'Quản Lý Quán' });
    const lowStockItems = inventoryList.filter(i => i.status !== 'safe');
    
    if (lowStockItems.length === 0) {
      return `--- PHIẾU ĐỀ XUẤT NHẬP HÀNG ---\nCửa hàng: Lee's Coffee\nNgày lập: ${today}\nNgười lập: ${user.name}\n\nHiện tại kho hàng đầy đủ, không có mặt hàng nào dưới mức an toàn.`;
    }

    let text = `--- PHIẾU ĐỀ XUẤT NHẬP HÀNG ---\nCửa hàng: Lee's Coffee\nNgày lập: ${today}\nNgười lập: ${user.name}\n\n⚠️ Danh sách nguyên vật liệu cần nhập gấp:\n`;
    lowStockItems.forEach((item, idx) => {
      // Recommended: Order (Threshold * 3) - Current Stock rounded up
      const recommend = Math.ceil(item.threshold * 3 - item.current);
      text += `${idx + 1}. ${item.name}:\n   - Tồn thực tế: ${item.current} ${item.unit} (Mức tối thiểu: ${item.threshold} ${item.unit})\n   - Đề xuất nhập thêm: ${recommend} ${item.unit}\n`;
    });
    text += `\nTổng cộng: ${lowStockItems.length} mặt hàng cần bổ sung.\n--------------------------------`;
    return text;
  }, [inventoryList]);

  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(orderText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Threshold edit controls
  const startEdit = (item) => {
    setEditIng(item.name);
    setEditVal(String(item.threshold));
  };

  const saveEdit = () => {
    if (editIng && editVal !== '') {
      setThresholds(prev => ({ ...prev, [editIng]: Number(editVal) }));
      setEditIng(null);
    }
  };

  // Add new ingredient
  const handleAddIngredient = () => {
    if (!newIngName.trim() || !newIngUnit.trim()) return;
    const newId = 'ci-' + genId();
    const newIng = { id: newId, name: newIngName.trim(), unit: newIngUnit.trim(), stockAmount: Number(newIngStock) || 0 };
    setCustomIngredients(prev => [...prev, newIng]);
    if (newIngThreshold !== '') {
      setThresholds(prev => ({ ...prev, [newIngName.trim()]: Number(newIngThreshold) }));
    }
    // Update manager inventory to include new item
    const existingInv = LS.get('lc_manager_inventory', null);
    if (existingInv) {
      LS.set('lc_manager_inventory', [...existingInv, { id: newId, name: newIngName.trim(), unit: newIngUnit.trim(), current: Number(newIngStock) || 0 }]);
    }
    setNewIngName(''); setNewIngUnit('kg'); setNewIngThreshold(''); setNewIngStock('');
    setShowAddModal(false);
    setReloadKey(prev => prev + 1);
  };

  // Delete ingredient
  const handleDeleteIngredient = (itemName) => {
    if (!window.confirm(`Xoá nguyên liệu "${itemName}" khỏi danh sách quản lý tồn kho?`)) return;
    setCustomIngredients(prev => prev.filter(i => i.name !== itemName));
    setThresholds(prev => { const next = { ...prev }; delete next[itemName]; return next; });
    // Update manager inventory as well
    const existingInv = LS.get('lc_manager_inventory', null);
    if (existingInv) {
      LS.set('lc_manager_inventory', existingInv.filter(i => i.name !== itemName));
    }
    setReloadKey(prev => prev + 1);
  };

  // Stock Replenishment Simulation
  const handleReplenish = (e) => {
    e.preventDefault();
    if (!replenishIng || (replenishVal === '' && replenishDeductVal === '')) return;

    const addAmt = Number(replenishVal) || 0;
    const deductAmt = Number(replenishDeductVal) || 0;
    const netChange = addAmt - deductAmt;

    const currentInv = inventoryList.map(item => {
      if (item.name === replenishIng) {
        return {
          id: item.id,
          name: item.name,
          unit: item.unit,
          current: Math.max(0, item.current + netChange)
        };
      }
      return { id: item.id, name: item.name, unit: item.unit, current: item.current };
    });

    LS.set('lc_manager_inventory', currentInv);
    setReplenishVal('');
    setReplenishDeductVal('');
    setReloadKey(prev => prev + 1);
    const parts = [];
    if (addAmt > 0) parts.push(`+${addAmt} (nạp thêm)`);
    if (deductAmt > 0) parts.push(`-${deductAmt} (xuất/trừ)`);
    alert(`⚡ Đã cập nhật kho: ${replenishIng} → ${parts.join(', ')} = ${netChange >= 0 ? '+' : ''}${netChange} ròng.`);
  };

  const resetReplenishment = () => {
    if (window.confirm('Khôi phục tồn kho theo ca trực Barista thực tế gần nhất?')) {
      localStorage.removeItem('lc_manager_inventory');
      setReloadKey(prev => prev + 1);
    }
  };

  return (
    <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top action header and stats */}
      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0f0f0e', margin: 0 }}>
              CẢNH BÁO TỒN KHO NGUYÊN LIỆU GIAO BAN
            </h2>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0', lineHeight: 1.4 }}>
              Giám sát tồn kho nguyên liệu thời gian thực được tổng kết từ ca trực Barista gần nhất.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={resetReplenishment} style={{ padding: '6px 12px', borderRadius: '2px', border: '1.5px solid #e5e7eb', background: 'white', fontSize: 11.5, cursor: 'pointer', color: '#6b7280', fontWeight: 600 }}>
              Khôi phục theo ca gần nhất
            </button>
            <button onClick={() => setShowAddModal(true)} style={{ padding: '6px 14px', borderRadius: '2px', border: 'none', background: '#15803d', color: 'white', fontSize: 12, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={13} /> Thêm Nguyên Liệu
            </button>
            <button onClick={() => setShowOrderModal(true)} style={{ padding: '6px 14px', borderRadius: '2px', border: 'none', background: '#be123c', color: 'white', fontSize: 12, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={13} /> Tạo Phiếu Đặt Hàng Gấp
            </button>
          </div>
        </div>

        {/* Alarm badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            ['TẤT CẢ NGUYÊN LIỆU', stats.total, '#0f0f0e', '#f8fafc', '#e5e7eb'],
            ['MỨC NGUY CẤP (DANGER)', stats.danger, '#be123c', '#fff1f2', '#fecdd3'],
            ['CẦN LƯU Ý (WARNING)', stats.warning, '#d97706', '#fffbeb', '#fef3c7'],
            ['AN TOÀN (SAFE)', stats.safe, '#15803d', '#f0fdf4', '#bbf7d0']
          ].map(([label, val, col, bg, borderCol]) => (
            <div key={label} style={{ background: bg, border: `1.5px solid ${borderCol}`, borderRadius: '2px', padding: '10px 14px' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: col, marginTop: 4 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        {/* Main inventory status table */}
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Nguyên Liệu</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tồn Kho Thực Tế</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Đơn Vị</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Mức Tối Thiểu (Cảnh báo)</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Trạng Thái</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}></th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map((item, idx) => {
                const isEditing = editIng === item.name;
                return (
                  <tr key={item.name} style={{ borderBottom: idx === inventoryList.length - 1 ? 'none' : '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }} className="table-row-hover">
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f0f0e' }}>{item.name}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: item.status === 'danger' ? '#be123c' : item.status === 'warning' ? '#d97706' : '#111827' }} className="mono">
                      {item.current}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280', fontWeight: 500 }}>{item.unit}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 4, justify: 'center', alignItems: 'center' }}>
                          <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)} style={{ width: 60, padding: '3px 6px', border: '1.5px solid #be123c', borderRadius: '2px', textAlign: 'right', fontSize: 12 }} className="mono" />
                          <button onClick={saveEdit} style={{ background: '#be123c', color: 'white', border: 'none', borderRadius: '2px', padding: '3px 6px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>Lưu</button>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 600, color: '#4b5563' }} className="mono">{item.threshold}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: item.status === 'danger' ? '#be123c' : item.status === 'warning' ? '#d97706' : '#15803d',
                        border: `2px solid ${item.status === 'danger' ? '#fca5a5' : item.status === 'warning' ? '#fef3c7' : '#bbf7d0'}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }} title={item.status === 'danger' ? 'Nguy cấp (Danger)' : item.status === 'warning' ? 'Cần lưu ý (Warning)' : 'An toàn (Safe)'} />
                    </td>
                    <td style={{ padding: '8px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {!isEditing && (
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button onClick={() => startEdit(item)} style={{ background: 'none', border: '1.5px solid #e5e7eb', borderRadius: '2px', color: '#be123c', cursor: 'pointer', fontSize: 11, fontWeight: 700, padding: '3px 8px' }}>
                            Sửa mức
                          </button>
                          <button onClick={() => handleDeleteIngredient(item.name)} style={{ width: 26, height: 26, borderRadius: '2px', border: '1.5px solid #fee2e2', background: '#fff1f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Xoá nguyên liệu">
                            <Trash2 size={11} style={{ color: '#be123c' }} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Status Legend Row */}
          <div style={{
            display: 'flex',
            gap: 16,
            padding: '10px 16px',
            background: '#f8fafc',
            borderTop: '1.5px solid #e5e7eb',
            fontSize: 11.5,
            fontWeight: 700,
            color: '#475569',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 9.5, color: '#64748b', textTransform: 'uppercase', marginRight: 4 }}>Chú thích:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#15803d', border: '1.5px solid #bbf7d0' }} />
              <span>An toàn</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#d97706', border: '1.5px solid #fef3c7' }} />
              <span>Cần lưu ý</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#be123c', border: '1.5px solid #fca5a5' }} />
              <span>Nguy cấp</span>
            </div>
          </div>
        </div>

        {/* Quick simulator panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Simulation replenishment */}
          <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#0f0f0e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
              NHẬP KHO NHANH (MÔ PHỎNG)
            </div>
            <form onSubmit={handleReplenish}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Nguyên vật liệu</label>
                <select className="input-field" style={{ borderRadius: '2px', padding: '6px 10px', fontSize: 12 }} value={replenishIng} onChange={e => setReplenishIng(e.target.value)} required>
                  <option value="">-- Chọn nguyên liệu --</option>
                  {inventoryList.map(item => (
                    <option key={item.name} value={item.name}>{item.name} ({item.unit})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#15803d', marginBottom: 5 }}>Số lượng nạp thêm (+)</label>
                <input type="number" step="any" className="input-field mono" style={{ borderRadius: '2px', padding: '6px 10px', fontSize: 12, textAlign: 'right', borderColor: '#bbf7d0' }} value={replenishVal} onChange={e => setReplenishVal(e.target.value)} placeholder="Ví dụ: 10, 200..." />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#be123c', marginBottom: 5 }}>Số lượng trừ (−)</label>
                <input type="number" step="any" className="input-field mono" style={{ borderRadius: '2px', padding: '6px 10px', fontSize: 12, textAlign: 'right', borderColor: '#fca5a5' }} value={replenishDeductVal} onChange={e => setReplenishDeductVal(e.target.value)} placeholder="Ví dụ: 5, 50..." />
              </div>
              <button type="submit" className="btn btn-blue" style={{ width: '100%', borderRadius: '2px', fontSize: 12, fontWeight: 700, justifyContent: 'center' }}>
                Cập nhật số liệu kho
              </button>
            </form>
          </div>

          {/* Quick recommendations */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              GỢI Ý MUA HÀNG KHẨN CẤP
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inventoryList.filter(i => i.status !== 'safe').length === 0 ? (
                <div style={{ fontSize: 11.5, color: '#6b7280', fontStyle: 'italic' }}>Không có đề xuất bổ sung nào. Kho hàng đang ở trạng thái an toàn.</div>
              ) : (
                inventoryList.filter(i => i.status !== 'safe').map(item => {
                  const rec = Math.ceil(item.threshold * 3 - item.current);
                  return (
                    <div key={item.name} style={{ fontSize: 11.5, color: '#4b5563', borderLeft: '3.5px solid #be123c', paddingLeft: 8, padding: '4px 0 4px 8px' }}>
                      Cần đặt gấp <strong>{rec} {item.unit}</strong> <strong>{item.name}</strong>.
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Order Modal */}
      {showOrderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="fade" style={{ background: 'white', padding: 24, borderRadius: '2px', width: '100%', maxWidth: 460, border: '1.5px solid #be123c', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#be123c', margin: '0 0 14px', borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>
              PHIẾU ĐỀ XUẤT NHẬP HÀNG GẤP
            </h3>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 1.4 }}>
              Hệ thống tự động tính toán đề xuất số lượng mua hàng dựa trên nguyên lý: <strong>(Mức tối thiểu * 3) - Tồn kho hiện tại</strong> để đảm bảo kho vận hành trong 1 tuần tới.
            </p>
            <pre style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '2px', padding: 14, fontSize: 11.5, color: '#334155', fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto', marginBottom: 18, lineHeight: 1.5 }}>
              {orderText}
            </pre>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-gray" style={{ borderRadius: '2px', height: 34 }} onClick={() => setShowOrderModal(false)}>Đóng</button>
              <button className="btn btn-blue" style={{ borderRadius: '2px', height: 34, background: copied ? '#15803d' : '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }} onClick={handleCopy}>
                <Copy size={13} /> {copied ? 'Đã sao chép!' : 'Copy Phiếu Đặt Hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="fade" style={{ background: 'white', padding: 24, borderRadius: '2px', width: '100%', maxWidth: 420, border: '1.5px solid #15803d', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#15803d', margin: '0 0 16px', borderBottom: '2px solid #e5e7eb', paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={15} /> THÊM NGUYÊN LIỆU MỚI
            </h3>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Tên nguyên liệu <span style={{ color: '#be123c' }}>*</span></label>
              <input
                className="input-field"
                style={{ borderRadius: '2px' }}
                value={newIngName}
                onChange={e => setNewIngName(e.target.value)}
                placeholder="Ví dụ: Đường nâu, Syrup vani..."
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Đơn vị tính <span style={{ color: '#be123c' }}>*</span></label>
                <select
                  className="input-field"
                  style={{ borderRadius: '2px', fontSize: 12.5 }}
                  value={newIngUnit}
                  onChange={e => setNewIngUnit(e.target.value)}
                >
                  {['kg', 'g', 'l', 'ml', 'hộp', 'gói', 'chai', 'túi', 'thùng', 'cái'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Tồn kho ban đầu</label>
                <input
                  type="number"
                  step="any"
                  className="input-field mono"
                  style={{ borderRadius: '2px', textAlign: 'right' }}
                  value={newIngStock}
                  onChange={e => setNewIngStock(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Mức tối thiểu cảnh báo</label>
              <input
                type="number"
                step="any"
                className="input-field mono"
                style={{ borderRadius: '2px', textAlign: 'right' }}
                value={newIngThreshold}
                onChange={e => setNewIngThreshold(e.target.value)}
                placeholder="Để trống nếu chưa cần cảnh báo"
              />
              <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 4 }}>💡 Khi tồn kho ≤ mức này sẽ bật cảnh báo màu vàng/đỏ</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-gray" style={{ borderRadius: '2px', height: 34 }} onClick={() => { setShowAddModal(false); setNewIngName(''); setNewIngUnit('kg'); setNewIngThreshold(''); setNewIngStock(''); }}>Huỷ</button>
              <button
                style={{ padding: '0 18px', height: 34, borderRadius: '2px', border: 'none', background: newIngName.trim() ? '#15803d' : '#d1d5db', color: 'white', fontSize: 12, fontWeight: 700, cursor: newIngName.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={handleAddIngredient}
                disabled={!newIngName.trim()}
              >
                <Plus size={13} /> Thêm vào danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// 4. 🎯 THIẾT LẬP MỤC TIÊU & KPI
// ═══════════════════════════════════════════════
export const MgrTargets = ({ reports }) => {
  const defaultTargets = {
    revenue: 150000000, // 150 triệu VND
    profit: 45000000,   // 45 triệu VND
    cups: 3000,         // 3000 cốc
    cogs: 25            // 25% COGS
  };

  const [targets, setTargets] = useState(() => LS.get('lc_manager_targets', defaultTargets));
  const [showConfig, setShowConfig] = useState(false);
  const [cfgRev, setCfgRev] = useState('');
  const [cfgProf, setCfgProf] = useState('');
  const [cfgCups, setCfgCups] = useState('');
  const [cfgCogs, setCfgCogs] = useState('');

  useEffect(() => {
    LS.set('lc_manager_targets', targets);
  }, [targets]);

  // Compute May 2026 actual values from approved reports and cashier shifts
  const actuals = useMemo(() => {
    // Approved reports for May 2026
    const mayReps = reports.filter(r => r.status === 'approved' && r.date.startsWith('2026-05'));
    
    const totalRev = mayReps.reduce((s, r) => {
      const { rev } = calcR(r);
      return s + rev;
    }, 0);
    
    const totalProfit = mayReps.reduce((s, r) => {
      const { profit } = calcR(r);
      return s + profit;
    }, 0);
    
    const totalGoods = mayReps.reduce((s, r) => s + (r.goodsCost || 0), 0);

    // Sum cashier shift orders in May 2026
    const shifts = LS.get('lc_shifts', []);
    const mayShifts = shifts.filter(s => s.roleType === 'cashier' && s.date.startsWith('2026-05'));
    const totalCups = mayShifts.reduce((s, sh) => s + (sh.orders || 0), 0);

    const actualCogsPct = totalRev > 0 ? (totalGoods / totalRev) * 100 : 0;

    return {
      revenue: totalRev,
      profit: totalProfit,
      cups: totalCups,
      cogs: actualCogsPct
    };
  }, [reports]);

  // Elapsed Month Progress Calculation (May has 31 days)
  const elapsedMonthPct = useMemo(() => {
    // Current local date in 2026-05-22 is Day 22 of 31
    const d = new Date('2026-05-22T22:59:11+07:00');
    const today = d.getDate();
    const daysInMonth = 31; // May has 31 days
    return (today / daysInMonth) * 100;
  }, []);

  const openConfiguration = () => {
    setCfgRev(String(targets.revenue));
    setCfgProf(String(targets.profit));
    setCfgCups(String(targets.cups));
    setCfgCogs(String(targets.cogs));
    setShowConfig(true);
  };

  const saveConfiguration = (e) => {
    e.preventDefault();
    setTargets({
      revenue: Number(cfgRev),
      profit: Number(cfgProf),
      cups: Number(cfgCups),
      cogs: Number(cfgCogs)
    });
    setShowConfig(false);
  };

  const getKPIColor = (progress) => {
    const diff = progress - elapsedMonthPct;
    if (diff >= 0) return '#15803d'; // Green (Ahead of time)
    if (diff >= -10) return '#d97706'; // Amber (Slightly lagging)
    return '#be123c'; // Red (Seriously lagging)
  };

  const getCOGSColor = (actualVal) => {
    return actualVal <= targets.cogs ? '#15803d' : '#be123c'; // Green if lower/equal, Red if higher
  };

  const getKPIAlert = (kpiName, actualVal, targetVal, isCogs = false) => {
    if (isCogs) {
      if (actualVal <= targetVal) {
        return { text: 'Tỷ lệ giá vốn đang kiểm soát rất tốt!', isWarning: false };
      }
      return { text: `⚠️ Vượt tỉ lệ giá vốn tối đa ${(actualVal - targetVal).toFixed(1)}%. Cần rà soát khấu hao và định lượng nguyên liệu Barista!`, isWarning: true };
    }

    const progress = targetVal > 0 ? (actualVal / targetVal) * 100 : 0;
    const diff = progress - elapsedMonthPct;
    
    if (diff >= 0) {
      return { text: `Tiến độ ${kpiName} đang vượt kỳ vọng (+${diff.toFixed(1)}% so với ngày trôi qua). Xuất sắc!`, isWarning: false };
    }
    if (diff >= -10) {
      return { text: `⚠️ Tiến độ ${kpiName} hơi chậm (Hụt ${Math.abs(diff).toFixed(1)}% so với mốc ngày). Cần theo dõi thêm ca chiều.`, isWarning: true };
    }
    return { text: `🚨 Tiến độ ${kpiName} bị trễ nghiêm trọng (Hụt ${Math.abs(diff).toFixed(1)}% so với mốc ngày). Cần triển khai khuyến mại gấp!`, isWarning: true };
  };

  // Recharts Chart Data
  const chartData = useMemo(() => [
    {
      name: 'Doanh Thu (Trđ)',
      'Thực Tế': Math.round(actuals.revenue / 1000000),
      'Mục Tiêu': Math.round(targets.revenue / 1000000)
    },
    {
      name: 'Lợi Nhuận (Trđ)',
      'Thực Tế': Math.round(actuals.profit / 1000000),
      'Mục Tiêu': Math.round(targets.profit / 1000000)
    }
  ], [actuals, targets]);

  const KPICard = ({ title, actualStr, targetStr, progress, isCogs = false }) => {
    const col = isCogs ? getCOGSColor(actuals.cogs) : getKPIColor(progress);
    const advisory = isCogs 
      ? getKPIAlert('COGS', actuals.cogs, targets.cogs, true)
      : getKPIAlert(title, progress * (isCogs ? 1 : targetStr / 100), targetStr, isCogs);
    
    return (
      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 18, borderTop: `4px solid ${col}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</span>
          {!isCogs && (
            <span style={{ fontSize: 11, fontWeight: 700, color: col }}>
              Đạt {progress.toFixed(1)}%
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: col }} className="mono">{actualStr}</span>
          <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>/ Mục tiêu {targetStr}</span>
        </div>

        {/* Progress Bar (except COGS) */}
        {!isCogs && (
          <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: '1px', marginTop: 12, position: 'relative', overflow: 'hidden' }}>
            {/* Target indicator line of time elapsed */}
            <div style={{ position: 'absolute', left: `${elapsedMonthPct}%`, top: 0, width: 2, height: '100%', background: '#94a3b8', zIndex: 2 }} title="Mốc ngày thực tế của tháng" />
            <div style={{ width: `${Math.min(100, progress)}%`, height: '100%', background: col, borderRadius: '1px' }} />
          </div>
        )}

        {/* Early Warning Banner */}
        <div style={{ fontSize: 11, color: advisory.isWarning ? '#9a3412' : '#166534', background: advisory.isWarning ? '#fff7ed' : '#f0fdf4', border: `1px solid ${advisory.isWarning ? '#fed7aa' : '#bbf7d0'}`, borderRadius: '2px', padding: '6px 10px', marginTop: 12, fontWeight: 500, lineHeight: 1.4 }}>
          {advisory.text}
        </div>
      </div>
    );
  };

  return (
    <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Header Card */}
      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0f0f0e', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Percent size={16} style={{ color: '#1e40af' }} /> THIẾT LẬP MỤC TIÊU & GIÁM SÁT KPI THÁNG
            </h2>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0', lineHeight: 1.4 }}>
              Cấu hình chỉ số doanh số kinh doanh tháng hiện tại và theo dõi tiến độ hoàn thành theo dòng thời gian.
            </p>
          </div>
          <button onClick={openConfiguration} style={{ padding: '6px 14px', borderRadius: '2px', border: 'none', background: '#1e40af', color: 'white', fontSize: 12, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Settings size={13} /> Cấu Hình Chỉ Số Mục Tiêu
          </button>
        </div>

        {/* Elapsed Month Header Alarm Box */}
        <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '2px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>⏰</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
              Dòng thời gian: Tháng 05/2026 đã trôi qua <span style={{ color: '#1e40af' }} className="mono">{elapsedMonthPct.toFixed(1)}%</span> (Ngày 22/31)
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, fontStyle: 'italic' }}>
            Mốc thời gian trôi qua đóng vai trò là "Vạch đích phụ" để kiểm tra tiến độ hàng ngày.
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KPICard title="Mục Tiêu Doanh Thu" actualStr={fmt(actuals.revenue)} targetStr={fmt(targets.revenue)} progress={targets.revenue > 0 ? (actuals.revenue / targets.revenue) * 100 : 0} />
        <KPICard title="Lợi Nhuận Ròng" actualStr={fmt(actuals.profit)} targetStr={fmt(targets.profit)} progress={targets.profit > 0 ? (actuals.profit / targets.profit) * 100 : 0} />
        <KPICard title="Sản Lượng Cốc Nước" actualStr={actuals.cups + ' cốc'} targetStr={targets.cups + ' cốc'} progress={targets.cups > 0 ? (actuals.cups / targets.cups) * 100 : 0} />
        <KPICard title="Tỉ Lệ Giá Vốn (COGS)" actualStr={actuals.cogs.toFixed(1) + '%'} targetStr={targets.cogs.toFixed(1) + '%'} progress={0} isCogs={true} />
      </div>

      {/* Double Column Chart and History */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Recharts comparison bar chart */}
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#0f0f0e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>
            SO SÁNH THỰC TẾ vs MỤC TIÊU THÁNG 5
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: '#64748b', fontWeight: 600 }} stroke="#e5e7eb" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e5e7eb" />
              <Tooltip contentStyle={{ fontSize: 11.5, borderRadius: '2px' }} formatter={(v) => [`${v} Triệu ₫`]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Thực Tế" fill="#1e40af" radius={0} />
              <Bar dataKey="Mục Tiêu" fill="#94a3b8" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Historical performance table */}
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#0f0f0e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>
            LỊCH SỬ HOÀN THÀNH MỤC TIÊU LIÊN TIẾP
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tháng Báo Cáo</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Doanh Thu Thực Tế</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Lợi Nhuận Thực Tế</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tỉ Lệ Hoàn Thành</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Đánh Giá Tổng Kết</th>
              </tr>
            </thead>
            <tbody>
              {[
                { period: 'Tháng 04/2026', rev: 148500000, targetRev: 140000000, prof: 42100000, targetProf: 40000000, comment: 'Hoàn Thành Xuất Sắc 🟢' },
                { period: 'Tháng 03/2026', rev: 132000000, targetRev: 135000000, prof: 37800000, targetProf: 38000000, comment: 'Cận Hoàn Thành 🟡' },
                { period: 'Tháng 02/2026', rev: 118000000, targetRev: 110000000, prof: 31000000, targetProf: 30000000, comment: 'Hoàn Thành 🟢' }
              ].map((row, idx) => {
                const revPct = (row.rev / row.targetRev) * 100;
                return (
                  <tr key={row.period} style={{ borderBottom: idx === 2 ? 'none' : '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }} className="table-row-hover">
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f0f0e' }}>{row.period}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1e40af' }} className="mono">{fmt(row.rev)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#15803d' }} className="mono">{fmt(row.prof)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#1e40af' }} className="mono">{revPct.toFixed(1)}% Doanh số</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: row.comment.includes('Xuất Sắc') || row.comment.includes('Hoàn Thành') && !row.comment.includes('Cận') ? '#15803d' : '#d97706' }}>{row.comment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Configuration Modal */}
      {showConfig && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justify: 'center', zIndex: 1000 }}>
          <div className="fade" style={{ background: 'white', padding: 24, borderRadius: '2px', width: '100%', maxWidth: 400, border: '1.5px solid #1e40af', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1e40af', margin: '0 0 16px', borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>
              THIẾT LẬP MỤC TIÊU HOẠT ĐỘNG
            </h3>
            
            <form onSubmit={saveConfiguration}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Mục tiêu doanh thu (₫)</label>
                <input type="number" className="input-field mono" style={{ borderRadius: '2px', padding: '6px 10px', fontSize: 12.5, textAlign: 'right' }} value={cfgRev} onChange={e => setCfgRev(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Mục tiêu lợi nhuận (₫)</label>
                <input type="number" className="input-field mono" style={{ borderRadius: '2px', padding: '6px 10px', fontSize: 12.5, textAlign: 'right' }} value={cfgProf} onChange={e => setCfgProf(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Mục tiêu sản lượng cốc (ly/tháng)</label>
                <input type="number" className="input-field mono" style={{ borderRadius: '2px', padding: '6px 10px', fontSize: 12.5, textAlign: 'right' }} value={cfgCups} onChange={e => setCfgCups(e.target.value)} required />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Mức trần giá vốn COGS (%)</label>
                <input type="number" step="any" className="input-field mono" style={{ borderRadius: '2px', padding: '6px 10px', fontSize: 12.5, textAlign: 'right' }} value={cfgCogs} onChange={e => setCfgCogs(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-gray" style={{ borderRadius: '2px', height: 34 }} onClick={() => setShowConfig(false)}>Huỷ</button>
                <button type="submit" className="btn btn-blue" style={{ borderRadius: '2px', height: 34 }}>Lưu Cấu Hình</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// MgrShiftSchedule – Bảng Công Ca Làm Việc Tuần
// ─────────────────────────────────────────────────────────
const STAFF_LIST = [
  'Thanh Vân', 'Jamin', 'Kiều Nhi', 'Thảo Tiên', 'Ngọc Hân', 
  'Hồng Nghi', 'Xuân Ny', 'Minh Lạc', 'Trang', 'Quốc Duy', 
  'Zora', 'Gia Phú', 'Kim Ngân', 'Duy Bảo'
];
const DAYS_VI    = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
const DAY_KEYS   = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const SLOT_TYPES = ['morning', 'mid', 'evening'];

function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function formatWeekDate(monday, dayIdx) {
  const d = new Date(monday);
  d.setDate(d.getDate() + dayIdx);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}
function weekKey(monday) {
  return `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`;
}

const SLOT_CFG = {
  morning: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', headerBg: '#dbeafe', label: 'Ca Sáng', hours: '6H–14H',  defStart: '06', defEnd: '14' },
  mid:     { bg: '#fefce8', border: '#fde68a', text: '#92400e', headerBg: '#fef08a', label: 'Ca Giữa', hours: 'Linh hoạt', defStart: '10', defEnd: '18' },
  evening: { bg: '#f0fdf4', border: '#86efac', text: '#166534', headerBg: '#dcfce7', label: 'Ca Chiều', hours: '14H–22H', defStart: '14', defEnd: '22' },
};

// Helper to format hours and minutes nicely
const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return '';
  if (!timeStr.includes(':')) return `${parseInt(timeStr)}H`;
  const [h, m] = timeStr.split(':');
  return parseInt(m) === 0 ? `${parseInt(h)}H` : `${parseInt(h)}H${parseInt(m)}`;
};

// ── Add Staff Modal ──────────────────────────────────────
const AddStaffModal = ({ onClose, onAdd, existingNames, slotType }) => {
  const cfg = SLOT_CFG[slotType];
  const [selected, setSelected] = useState('');
  const [startH, setStartH]    = useState(cfg.defStart);
  const [startM, setStartM]    = useState('00');
  const [endH, setEndH]        = useState(cfg.defEnd);
  const [endM, setEndM]        = useState('00');
  const [noteType, setNoteType] = useState(''); // '', 'PHỤ BÁN CƠM', 'BẾP', 'VP', 'custom'
  const [customNote, setCustomNote] = useState('');

  const staffList = LS.get('lc_mgr_staff_v1', STAFF_LIST);
  const available = staffList.filter(s => !existingNames.includes(s));

  const handleSave = () => {
    if (!selected) return;
    const finalNote = noteType === 'custom' ? customNote.trim().toUpperCase() : noteType;
    onAdd({
      name: selected,
      start: `${startH}:${startM}`,
      end: `${endH}:${endM}`,
      note: finalNote,
      slotType
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="fade" style={{ background: 'white', borderRadius: '2px', padding: 24, width: 320, border: `1.5px solid ${cfg.border}`, boxShadow: '0 16px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
            <span style={{ background: cfg.headerBg, color: cfg.text, padding: '2px 8px', borderRadius: '2px', marginRight: 8, fontSize: 11, fontWeight: 800 }}>
              {cfg.label}
            </span>
            Thêm Nhân Viên
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={18} /></button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>Chọn nhân viên</label>
          <select value={selected} onChange={e => setSelected(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none' }}>
            <option value="">-- Chọn --</option>
            {available.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>Giờ bắt đầu</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <select value={startH} onChange={e => setStartH(e.target.value)}
                style={{ flex: 2, padding: '8px 4px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none' }}>
                {Array.from({ length: 24 }).map((_, i) => {
                  const val = String(i).padStart(2, '0');
                  return <option key={val} value={val}>{val}h</option>;
                })}
              </select>
              <select value={startM} onChange={e => setStartM(e.target.value)}
                style={{ flex: 2, padding: '8px 4px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none' }}>
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>Giờ kết thúc</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <select value={endH} onChange={e => setEndH(e.target.value)}
                style={{ flex: 2, padding: '8px 4px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none' }}>
                {Array.from({ length: 25 }).map((_, i) => {
                  const val = String(i).padStart(2, '0');
                  return <option key={val} value={val}>{val}h</option>;
                })}
              </select>
              <select value={endM} onChange={e => setEndM(e.target.value)}
                style={{ flex: 2, padding: '8px 4px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none' }}>
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>Ghi chú công việc (Note)</label>
          <select value={noteType} onChange={e => setNoteType(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', marginBottom: noteType === 'custom' ? 8 : 0 }}>
            <option value="">-- Không có ghi chú --</option>
            <option value="PHỤ BÁN CƠM">PHỤ BÁN CƠM</option>
            <option value="BẾP">BẾP</option>
            <option value="VP">VP</option>
            <option value="custom">Ghi chú tự nhập...</option>
          </select>
          {noteType === 'custom' && (
            <input type="text" placeholder="Nhập ghi chú..." value={customNote} onChange={e => setCustomNote(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 12.5, outline: 'none' }} />
          )}
        </div>

        <div style={{ marginBottom: 16, padding: '7px 12px', borderRadius: '2px', background: cfg.bg, border: `1.5px solid ${cfg.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={13} color={cfg.text} />
          <span style={{ fontSize: 12, fontWeight: 700, color: cfg.text }}>
            {formatTimeDisplay(`${startH}:${startM}`)} – {formatTimeDisplay(`${endH}:${endM}`)} {noteType && noteType !== 'custom' ? `· ${noteType}` : ''}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="btn btn-gray" style={{ flex: 1, borderRadius: '2px', height: 36 }}>Huỷ</button>
          <button disabled={!selected} onClick={handleSave} className="btn btn-blue"
            style={{ flex: 2, borderRadius: '2px', height: 36, opacity: selected ? 1 : 0.5 }}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Hours Modal ─────────────────────────────────────
const EditHoursModal = ({ entry, onClose, onSave }) => {
  const [startH, setStartH] = useState(() => entry.start.includes(':') ? entry.start.split(':')[0] : entry.start);
  const [startM, setStartM] = useState(() => entry.start.includes(':') ? entry.start.split(':')[1] : '00');
  const [endH, setEndH]     = useState(() => entry.end.includes(':') ? entry.end.split(':')[0] : entry.end);
  const [endM, setEndM]     = useState(() => entry.end.includes(':') ? entry.end.split(':')[1] : '00');
  const [noteType, setNoteType] = useState(() => {
    if (!entry.note) return '';
    if (['PHỤ BÁN CƠM', 'BẾP', 'VP'].includes(entry.note)) return entry.note;
    return 'custom';
  });
  const [customNote, setCustomNote] = useState(() => {
    if (!entry.note) return '';
    if (['PHỤ BÁN CƠM', 'BẾP', 'VP'].includes(entry.note)) return '';
    return entry.note;
  });

  const cfg = SLOT_CFG[entry.slotType] || SLOT_CFG.morning;

  const handleSave = () => {
    const finalNote = noteType === 'custom' ? customNote.trim().toUpperCase() : noteType;
    onSave({
      ...entry,
      start: `${startH}:${startM}`,
      end: `${endH}:${endM}`,
      note: finalNote
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="fade" style={{ background: 'white', borderRadius: '2px', padding: 24, width: 310, border: '1.5px solid #f59e0b', boxShadow: '0 16px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>✏️ Chỉnh sửa: {entry.name}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={18} /></button>
        </div>
        
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Từ giờ</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <select value={startH} onChange={e => setStartH(e.target.value)}
                style={{ flex: 2, padding: '8px 4px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none' }}>
                {Array.from({ length: 24 }).map((_, i) => {
                  const val = String(i).padStart(2, '0');
                  return <option key={val} value={val}>{val}h</option>;
                })}
              </select>
              <select value={startM} onChange={e => setStartM(e.target.value)}
                style={{ flex: 2, padding: '8px 4px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none' }}>
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Đến giờ</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <select value={endH} onChange={e => setEndH(e.target.value)}
                style={{ flex: 2, padding: '8px 4px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none' }}>
                {Array.from({ length: 25 }).map((_, i) => {
                  const val = String(i).padStart(2, '0');
                  return <option key={val} value={val}>{val}h</option>;
                })}
              </select>
              <select value={endM} onChange={e => setEndM(e.target.value)}
                style={{ flex: 2, padding: '8px 4px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 14, fontWeight: 800, textAlign: 'center', outline: 'none' }}>
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Ghi chú công việc (Note)</label>
          <select value={noteType} onChange={e => setNoteType(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', marginBottom: noteType === 'custom' ? 8 : 0 }}>
            <option value="">-- Không có ghi chú --</option>
            <option value="PHỤ BÁN CƠM">PHỤ BÁN CƠM</option>
            <option value="BẾP">BẾP</option>
            <option value="VP">VP</option>
            <option value="custom">Ghi chú tự nhập...</option>
          </select>
          {noteType === 'custom' && (
            <input type="text" placeholder="Nhập ghi chú..." value={customNote} onChange={e => setCustomNote(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '2px', border: '1.5px solid #e5e7eb', fontSize: 12.5, outline: 'none' }} />
          )}
        </div>

        <div style={{ marginBottom: 14, padding: '7px 12px', borderRadius: '2px', background: cfg.bg, border: `1.5px solid ${cfg.border}` }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: cfg.text }}>
            <Clock size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            {formatTimeDisplay(`${startH}:${startM}`)} – {formatTimeDisplay(`${endH}:${endM}`)} {noteType && noteType !== 'custom' ? `· ${noteType}` : ''}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="btn btn-gray" style={{ flex: 1, borderRadius: '2px', height: 34 }}>Huỷ</button>
          <button onClick={handleSave} style={{ flex: 2, borderRadius: '2px', height: 34, background: '#f59e0b', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────
export const MgrShiftSchedule = () => {
  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));
  const [schedule, setSchedule]   = useState(() => LS.get('lc_mgr_schedule_v3', {}));
  const [modal, setModal]         = useState(null); // { dayKey, slotType }
  const [editModal, setEditModal] = useState(null); // { dayKey, slotType, entry, idx }
  const [viewMode, setViewMode]   = useState('plan'); // 'plan' or 'export'

  useEffect(() => { LS.set('lc_mgr_schedule_v3', schedule); }, [schedule]);

  const wKey = weekKey(weekStart);

  const getEntries = (dayKey, slotType) => schedule?.[wKey]?.[dayKey]?.[slotType] || [];

  const addEntry = (dayKey, slotType, entry) => {
    setSchedule(prev => {
      const w = prev[wKey] || {};
      const d = w[dayKey] || {};
      const s = d[slotType] || [];
      return { ...prev, [wKey]: { ...w, [dayKey]: { ...d, [slotType]: [...s, { ...entry, id: genId() }] } } };
    });
  };

  const removeEntry = (dayKey, slotType, entryId) => {
    setSchedule(prev => {
      const arr = (prev?.[wKey]?.[dayKey]?.[slotType] || []).filter(e => e.id !== entryId);
      return { ...prev, [wKey]: { ...prev[wKey], [dayKey]: { ...(prev?.[wKey]?.[dayKey] || {}), [slotType]: arr } } };
    });
  };

  const saveEdit = (dayKey, slotType, idx, updated) => {
    setSchedule(prev => {
      const arr = [...(prev?.[wKey]?.[dayKey]?.[slotType] || [])];
      arr[idx] = updated;
      return { ...prev, [wKey]: { ...prev[wKey], [dayKey]: { ...(prev?.[wKey]?.[dayKey] || {}), [slotType]: arr } } };
    });
  };

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };

  // Total count
  const totalShifts = useMemo(() => {
    let count = 0;
    DAY_KEYS.forEach(dk => SLOT_TYPES.forEach(st => { count += getEntries(dk, st).length; }));
    return count;
  }, [schedule, wKey]);

  // ── Chip ───────────────────────────────────────────────
  const Chip = ({ entry, dayKey, slotType, idx }) => {
    const cfg = SLOT_CFG[slotType];
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        borderRadius: '4px',
        padding: '5px 8px',
        color: cfg.text,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            marginRight: 6,
            fontWeight: 700,
            fontSize: 11.5,
          }} title={entry.name}>
            {entry.name}
          </span>
          <span style={{
            fontSize: 9.5,
            opacity: 0.8,
            marginRight: 6,
            flexShrink: 0,
            background: cfg.headerBg,
            padding: '1px 4px',
            borderRadius: '3px',
            fontFamily: 'monospace',
            fontWeight: 700,
          }}>
            {formatTimeDisplay(entry.start)}-{formatTimeDisplay(entry.end)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <button
              onClick={() => setEditModal({ dayKey, slotType, entry, idx })}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: cfg.text,
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                opacity: 0.7,
              }}
              title="Sửa giờ làm"
            >
              <Edit3 size={11} />
            </button>
            <button
              onClick={() => removeEntry(dayKey, slotType, entry.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                opacity: 0.7,
              }}
              title="Xoá nhân viên"
            >
              <X size={11} />
            </button>
          </div>
        </div>
        {entry.note && (
          <div style={{
            fontSize: 9,
            fontWeight: 800,
            background: '#ffffff90',
            padding: '2px 4px',
            borderRadius: '2px',
            marginTop: 4,
            display: 'inline-block',
            alignSelf: 'start',
            letterSpacing: '0.02em',
            color: '#1e293b',
            borderLeft: `2.5px solid ${cfg.text}`
          }}>
            📝 {entry.note}
          </div>
        )}
      </div>
    );
  };

  // ── Grid Slot Section ──────────────────────────────────
  const GridSlotSection = ({ dayKey, slotType }) => {
    const entries = getEntries(dayKey, slotType);
    const cfg = SLOT_CFG[slotType];

    return (
      <div style={{
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 120,
      }}>
        {/* Cell header with count and Add button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 9.5, color: entries.length > 0 ? cfg.text : '#94a3b8', fontWeight: 700 }}>
            {entries.length > 0 ? `${entries.length} NV` : 'Trống'}
          </span>
          <button
            onClick={() => setModal({ dayKey, slotType })}
            style={{
              background: cfg.headerBg,
              border: `1.5px solid ${cfg.border}`,
              borderRadius: '3px',
              cursor: 'pointer',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: cfg.text,
              padding: 0,
            }}
            title="Thêm nhân viên"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Chips Stack */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          flexGrow: 1,
        }}>
          {entries.map((e, i) => (
            <Chip key={e.id} entry={e} dayKey={dayKey} slotType={slotType} idx={i} />
          ))}
        </div>
      </div>
    );
  };

  // ── Unified Export Calendar View ───────────────────────
  const ExportCalendarView = () => {
    const staffList = LS.get('lc_mgr_staff_v1', STAFF_LIST);
    return (
      <div style={{ padding: '0 0 16px' }} className="print-section">
        {/* Actions inside view */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 14 }} className="no-print">
          <button 
            onClick={() => window.print()}
            style={{
              background: '#1e40af',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            🖨️ In Lịch Làm Việc / Xuất PDF
          </button>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'white',
            textAlign: 'center',
            fontSize: 12.5,
          }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{
                  padding: '14px 10px',
                  fontWeight: 700,
                  color: '#1e293b',
                  border: '1.5px solid #e2e8f0',
                  fontSize: 12.5,
                  width: 150,
                  textAlign: 'center',
                }}>
                  Họ và Tên
                </th>
                {DAY_KEYS.map((dk, di) => {
                  const dateLabel = formatWeekDate(weekStart, di);
                  return (
                    <th key={dk} style={{
                      padding: '10px 8px',
                      fontWeight: 700,
                      color: '#1e293b',
                      border: '1.5px solid #e2e8f0',
                      width: 120,
                    }}>
                      <div style={{ fontSize: 12, color: '#475569', marginBottom: 2, fontWeight: 500 }}>{dateLabel}</div>
                      <div style={{ fontSize: 11.5, color: '#0f172a', fontWeight: 700, letterSpacing: '0.02em' }}>{DAYS_VI[di].toUpperCase()}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {staffList.map((staffName) => {
                return (
                  <tr key={staffName} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    {/* Employee Name column */}
                    <td style={{
                      padding: '12px 10px',
                      fontWeight: 700,
                      color: '#0f172a',
                      background: '#f8fafc',
                      border: '1.5px solid #e2e8f0',
                      textAlign: 'center',
                      fontSize: 12.5,
                    }}>
                      {staffName}
                    </td>

                    {/* 7 Days columns */}
                    {DAY_KEYS.map((dk) => {
                      // Find if this staff has any entry on this day
                      const dayEntries = SLOT_TYPES.flatMap(st => {
                        const entries = getEntries(dk, st);
                        return entries.filter(e => e.name === staffName);
                      });

                      if (dayEntries.length === 0) {
                        return (
                          <td key={dk} style={{
                            background: '#fefce8', // Softer yellow background for OFF
                            color: '#854d0e',
                            fontWeight: 700,
                            fontSize: 12,
                            border: '1.5px solid #e2e8f0',
                            padding: '12px 6px',
                            letterSpacing: '0.05em',
                          }}>
                            OFF
                          </td>
                        );
                      }

                      // Dynamic styling based on number of ca làm việc on this day
                      const hasMultiple = dayEntries.length > 1;
                      const singleCfg = !hasMultiple ? (SLOT_CFG[dayEntries[0].slotType] || SLOT_CFG.morning) : null;

                      return (
                        <td key={dk} style={{
                          background: hasMultiple ? '#f8fafc' : singleCfg.bg,
                          border: '1.5px solid #e2e8f0',
                          padding: hasMultiple ? '6px 4px' : '8px 6px',
                          verticalAlign: 'middle',
                          transition: 'background 0.1s',
                        }}>
                          {dayEntries.map((entry, idx) => {
                            const cfg = SLOT_CFG[entry.slotType] || SLOT_CFG.morning;
                            return (
                              <div key={idx} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                // Style as mini-badges if multiple ca exist in one cell
                                ...(hasMultiple ? {
                                  background: cfg.bg,
                                  border: `1px solid ${cfg.border}`,
                                  borderRadius: '2px',
                                  padding: '4px 6px',
                                  margin: '3px 0',
                                  width: '100%',
                                } : {})
                              }}>
                                <span style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: hasMultiple ? '#1e293b' : cfg.text,
                                  fontFamily: "'DM Mono', monospace",
                                }}>
                                  {formatTimeDisplay(entry.start)}-{formatTimeDisplay(entry.end)}
                                </span>
                                {entry.note && (
                                  <span style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    color: hasMultiple ? '#475569' : cfg.text,
                                    marginTop: 1,
                                    letterSpacing: '0.02em',
                                    background: hasMultiple ? 'transparent' : '#ffffff80',
                                    padding: hasMultiple ? 0 : '1px 5px',
                                    borderRadius: '2px',
                                    border: hasMultiple ? 'none' : `1px solid ${cfg.text}30`,
                                  }}>
                                    {entry.note.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── Today check ───────────────────────────────────────
  const todayLabel = (() => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}`;
  })();

  return (
    <div style={{ padding: '0 0 32px' }}>
      {/* Print & Custom Scrollbar Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 4px !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9 !important;
        }
      `}</style>

      {/* ── Mode Switcher & Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>Bảng Công Ca Làm Việc</h2>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0', fontWeight: 500 }}>Phân ca từng ngày trong tuần</p>
        </div>
        
        {/* Toggle Mode Buttons */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '4px', padding: '3px', border: '1px solid #e2e8f0' }} className="no-print">
          <button
            onClick={() => setViewMode('plan')}
            style={{
              padding: '6px 12px',
              borderRadius: '3px',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              background: viewMode === 'plan' ? '#ffffff' : 'transparent',
              color: viewMode === 'plan' ? '#0f172a' : '#64748b',
              boxShadow: viewMode === 'plan' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            🛠️ Chế độ Xếp ca
          </button>
          <button
            onClick={() => setViewMode('export')}
            style={{
              padding: '6px 12px',
              borderRadius: '3px',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              background: viewMode === 'export' ? '#ffffff' : 'transparent',
              color: viewMode === 'export' ? '#b45309' : '#64748b',
              boxShadow: viewMode === 'export' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            📋 Xuất kết quả (Lịch Tuần)
          </button>
        </div>

        <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '2px', padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#1e40af' }} className="no-print">
          {totalShifts} lượt làm việc
        </div>
      </div>

      {/* ── Week Navigator ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }} className="no-print">
        <button onClick={prevWeek} className="btn btn-gray" style={{ height: 34, borderRadius: '2px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ChevronLeft size={15} /> Trước
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 800, color: '#1e40af', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '2px', padding: '6px 16px' }}>
          <Calendar size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
          {formatWeekDate(weekStart, 0)} – {formatWeekDate(weekStart, 6)}
        </div>
        <button onClick={nextWeek} className="btn btn-gray" style={{ height: 34, borderRadius: '2px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
          Sau <ChevronRight size={15} />
        </button>
      </div>

      {/* ── Legend ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, padding: '7px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '2px', flexWrap: 'wrap' }} className="no-print">
        {SLOT_TYPES.map(st => {
          const cfg = SLOT_CFG[st];
          return (
            <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '2px', background: cfg.bg, border: `2px solid ${cfg.border}` }} />
              <span style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>{cfg.label} {cfg.hours}</span>
            </div>
          );
        })}
        <span style={{ marginLeft: 'auto', fontSize: 10.5, color: '#9ca3af', fontStyle: 'italic' }}>✏️ Nhấn icon bút để chỉnh giờ & thêm ghi chú</span>
      </div>

      {/* ── Main View Content ── */}
      {viewMode === 'export' ? (
        <ExportCalendarView />
      ) : (
        /* ── Schedule Grid ── */
        <div className="custom-scrollbar" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px repeat(7, minmax(200px, 1fr))',
            minWidth: 1520,
            background: '#e2e8f0',
            gap: '1px',
          }}>
            {/* Header row corner */}
            <div style={{
              background: '#f8fafc',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
              color: '#475569',
              textAlign: 'center',
            }}>
              Ca / Ngày
            </div>
            
            {/* Header row days */}
            {DAY_KEYS.map((dk, di) => {
              const dateLabel = formatWeekDate(weekStart, di);
              const isToday = dateLabel === todayLabel;
              return (
                <div key={dk} style={{
                  padding: '8px 5px',
                  background: isToday ? '#fde68a' : '#f8fafc',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: isToday ? '#713f12' : '#475569', letterSpacing: '0.03em' }}>{DAYS_VI[di]}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? '#92400e' : '#64748b' }}>{dateLabel}</div>
                  {isToday && <div style={{ fontSize: 8, fontWeight: 900, color: '#92400e', background: '#fef08a', borderRadius: '2px', padding: '1px 3px', marginTop: 1 }}>HÔM NAY</div>}
                </div>
              );
            })}

            {/* Slots rows */}
            {SLOT_TYPES.map((st) => {
              const cfg = SLOT_CFG[st];
              return (
                <React.Fragment key={st}>
                  {/* Row label column */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 900,
                      color: cfg.text,
                      background: cfg.headerBg,
                      border: `1px solid ${cfg.border}`,
                      padding: '2px 6px',
                      borderRadius: '2px',
                      textAlign: 'center',
                      display: 'inline-block',
                      width: '100%',
                    }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: '#64748b' }}>{cfg.hours}</span>
                  </div>

                  {/* Day columns for this slot */}
                  {DAY_KEYS.map((dk, di) => {
                    const dateLabel = formatWeekDate(weekStart, di);
                    const isToday = dateLabel === todayLabel;
                    return (
                      <div key={`${st}-${dk}`} style={{
                        background: isToday ? '#fffbeb' : 'white',
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        <GridSlotSection dayKey={dk} slotType={st} />
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {modal && (
        <AddStaffModal
          slotType={modal.slotType}
          onClose={() => setModal(null)}
          onAdd={(entry) => addEntry(modal.dayKey, modal.slotType, entry)}
          existingNames={SLOT_TYPES.flatMap(st => getEntries(modal.dayKey, st)).map(e => e.name)}
        />
      )}
      {editModal && (
        <EditHoursModal
          entry={editModal.entry}
          onClose={() => setEditModal(null)}
          onSave={(updated) => saveEdit(editModal.dayKey, editModal.slotType, editModal.idx, updated)}
        />
      )}
    </div>
  );
};

// ── Dynamic Staff Management Component ───────────────────
export const MgrStaffList = () => {
  const [staff, setStaff] = useState(() => LS.get('lc_mgr_staff_v1', STAFF_LIST));
  const [newStaffName, setNewStaffName] = useState('');
  const [error, setError] = useState('');
  const [onLeave, setOnLeave] = useState(() => LS.get('lc_staff_leave', {}));
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'login_history'
  const [loginHistory, setLoginHistory] = useState(() => LS.get('lc_login_history', []));

  const filteredStaff = useMemo(() => {
    return staff.filter(name => name.toLowerCase().includes(search.toLowerCase()));
  }, [staff, search]);

  const toggleLeave = (name) => setOnLeave(prev => {
    const next = { ...prev, [name]: !prev[name] };
    LS.set('lc_staff_leave', next);
    return next;
  });

  useEffect(() => {
    LS.set('lc_mgr_staff_v1', staff);
  }, [staff]);

  const handleAdd = (e) => {
    e.preventDefault();
    const name = newStaffName.trim();
    if (!name) return;
    if (staff.includes(name)) {
      setError('Nhân viên này đã tồn tại trong danh sách!');
      return;
    }
    setStaff(prev => [...prev, name]);
    setNewStaffName('');
    setError('');
  };

  const handleRemove = (name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xoá nhân viên ${name} khỏi hệ thống?`)) {
      setStaff(prev => prev.filter(s => s !== name));
    }
  };

  const clearLoginHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xoá toàn bộ lịch sử đăng nhập nhân viên?")) {
      LS.set('lc_login_history', []);
      setLoginHistory([]);
    }
  };

  return (
    <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tab Selector */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1.5px solid #cbd5e1', paddingBottom: 8 }}>
        <button
          onClick={() => setActiveTab('list')}
          style={{
            padding: '6px 14px',
            borderRadius: '2px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'list' ? '#1e40af' : '#fafafa',
            color: activeTab === 'list' ? 'white' : '#4b5563',
            border: activeTab === 'list' ? '1.5px solid #1e40af' : '1.5px solid #cbd5e1',
            transition: 'all 0.1s'
          }}
        >
          👥 Danh Sách Nhân Viên
        </button>
        <button
          onClick={() => {
            setActiveTab('login_history');
            setLoginHistory(LS.get('lc_login_history', []));
          }}
          style={{
            padding: '6px 14px',
            borderRadius: '2px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'login_history' ? '#1e40af' : '#fafafa',
            color: activeTab === 'login_history' ? 'white' : '#4b5563',
            border: activeTab === 'login_history' ? '1.5px solid #1e40af' : '1.5px solid #cbd5e1',
            transition: 'all 0.1s'
          }}
        >
          🕒 Lịch Sử Đăng Nhập
        </button>
      </div>

      {activeTab === 'list' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
          {/* Left Column: Staff Table */}
          <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1.5px solid #e5e7eb', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  DANH SÁCH NHÂN VIÊN ({staff.length})
                </h3>
                <p style={{ fontSize: 11.5, color: '#6b7280', margin: '4px 0 0' }}>Tất cả nhân sự trong phân hệ xếp ca của quán</p>
              </div>
              <div style={{ position: 'relative', width: '200px' }}>
                <input
                  className="input-field"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm tên nhân viên..."
                  style={{ paddingLeft: 30, paddingRight: 8, height: 32, fontSize: 12, borderRadius: '2px' }}
                />
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              </div>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead style={{ position: 'sticky', top: 0, background: '#fafafa', zIndex: 10, boxShadow: '0 1px 0 #e5e7eb' }}>
                  <tr style={{ background: '#fafafa' }}>
                    <th style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>Họ Và Tên</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase', width: 48 }}></th>
                    <th style={{ padding: '10px 20px', textAlign: 'right', width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((name, idx) => (
                    <tr key={name} style={{ borderBottom: idx === filteredStaff.length - 1 ? 'none' : '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }} className="table-row-hover">
                      <td style={{ padding: '12px 20px', fontWeight: 800, color: '#1e40af', fontSize: 13, textTransform: 'uppercase' }}>{name}</td>
                      <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                        <span
                          title={onLeave[name] ? 'Nghỉ phép — bấm để đổi' : 'Đang hoạt động — bấm để đổi'}
                          onClick={() => toggleLeave(name)}
                          style={{
                            display: 'inline-block',
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: onLeave[name] ? '#f59e0b' : '#22c55e',
                            boxShadow: onLeave[name] ? '0 0 0 2px #fef3c7' : '0 0 0 2px #dcfce7',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'background 0.2s, box-shadow 0.2s'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <button onClick={() => handleRemove(name)} style={{ background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }} title="Xoá nhân viên">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStaff.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                        {staff.length === 0 ? 'Chưa có nhân viên nào trong danh sách. Vui lòng thêm nhân viên mới!' : 'Không tìm thấy nhân viên phù hợp.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Sidebar Add Staff Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Form Add */}
            <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0f0f0e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                THÊM NHÂN VIÊN MỚI
              </div>
              <form onSubmit={handleAdd}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5 }}>Họ và tên nhân viên</label>
                  <input type="text" className="input-field" placeholder="Ví dụ: NGUYỄN VĂN AN..." value={newStaffName} onChange={e => setNewStaffName(e.target.value)} required style={{ borderRadius: '2px', padding: '8px 10px', fontSize: 12.5 }} />
                </div>
                {error && (
                  <div style={{ fontSize: 11, color: '#be123c', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '2px', padding: '6px 10px', marginBottom: 12, fontWeight: 600 }}>
                    ⚠️ {error}
                  </div>
                )}
                <button type="submit" className="btn btn-blue" style={{ width: '100%', borderRadius: '2px', fontSize: 12, fontWeight: 700, justifyContent: 'center', height: 36 }}>
                  Thêm Vào Danh Sách
                </button>
              </form>
            </div>

            {/* Sync Info Alert card */}
            <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '2px', padding: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                LIÊN KẾT BẢNG CÔNG TỰ ĐỘNG
              </div>
              <p style={{ fontSize: 11.5, color: '#1e40af', lineHeight: 1.5, margin: 0 }}>
                Danh sách nhân viên này được <strong>liên kết thời gian thực (Real-time sync)</strong> trực tiếp tới <strong>Bảng Công & Lịch Tuần</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Left Column: Login History Table */
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1.5px solid #e5e7eb', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                LỊCH SỬ ĐĂNG NHẬP NHÂN VIÊN ({loginHistory.length})
              </h3>
              <p style={{ fontSize: 11.5, color: '#6b7280', margin: '4px 0 0' }}>Ghi nhận mốc thời gian đăng nhập thực tế của hệ thống</p>
            </div>
            {loginHistory.length > 0 && (
              <button
                onClick={clearLoginHistory}
                style={{
                  background: '#fff1f2',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '2px',
                  color: '#be123c',
                  cursor: 'pointer',
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Trash2 size={13} /> Xoá Toàn Bộ Lịch Sử
              </button>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead style={{ position: 'sticky', top: 0, background: '#fafafa', zIndex: 10, boxShadow: '0 1px 0 #e5e7eb' }}>
                <tr style={{ background: '#fafafa' }}>
                  <th style={{ padding: '10px 20px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>Họ Và Tên Nhân Viên</th>
                  <th style={{ padding: '10px 20px', textAlign: 'right', color: '#64748b', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase', width: 280 }}>Thời Gian Đăng Nhập (Server Time)</th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.map((entry, idx) => (
                  <tr key={idx} style={{ borderBottom: idx === loginHistory.length - 1 ? 'none' : '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }} className="table-row-hover">
                    <td style={{ padding: '12px 20px', fontWeight: 800, color: '#1e40af', fontSize: 13, textTransform: 'uppercase' }}>{entry.name}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, color: '#475569' }} className="mono">{entry.time}</td>
                  </tr>
                ))}
                {loginHistory.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                      Chưa ghi nhận lượt đăng nhập nào trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
