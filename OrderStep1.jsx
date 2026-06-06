import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Minus, Trash2, CheckCircle2, 
  CreditCard, Wallet, Smartphone, Banknote, HelpCircle, 
  Sparkles, Check, ArrowRight, RefreshCw, ShoppingCart,
  Tag, UserCheck, LogOut, ArrowLeft, Printer,
  Maximize2, Minimize2, History, CalendarDays, AlertOctagon, Users, Clock
} from 'lucide-react';

// ── LOCAL STORAGE HELPER ──
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); if (v == null) return d; const parsed = JSON.parse(v); return parsed != null ? parsed : d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ── HARDCODED SAMPLE ITEMS ──
const SAMPLE_ITEMS = [
  // --- COFFEE SIGNATURE ---
  { id: 'cf_sig_01_m', name: 'Cà Phê Sữa Đá Nguyên Bản (M)', price: 25000, cat: 'coffee', type: 'drink', desc: 'Cà phê phin truyền thống thơm nồng kết hợp sữa đặc béo ngọt hảo hạng.', color: '#78350f', bg: '#fef3c7', icon: '☕' },
  { id: 'cf_sig_01_l', name: 'Cà Phê Sữa Đá Nguyên Bản (L)', price: 30000, cat: 'coffee', type: 'drink', desc: 'Cà phê phin truyền thống thơm nồng kết hợp sữa đặc béo ngọt hảo hạng.', color: '#78350f', bg: '#fef3c7', icon: '☕' },
  { id: 'cf_sig_02_m', name: 'Cà Phê Sữa Đá Đậm (M)', price: 30000, cat: 'coffee', type: 'drink', desc: 'Triple shot Espresso đậm đà ngập tràn năng lượng kết hợp sữa đặc.', color: '#92400e', bg: '#fef3c7', icon: '☕' },
  { id: 'cf_sig_02_l', name: 'Cà Phê Sữa Đá Đậm (L)', price: 35000, cat: 'coffee', type: 'drink', desc: 'Triple shot Espresso đậm đà ngập tràn năng lượng kết hợp sữa đặc.', color: '#92400e', bg: '#fef3c7', icon: '☕' },
  { id: 'cf_sig_03_m', name: 'Cà Phê Phin Đen Đá (M)', price: 25000, cat: 'coffee', type: 'drink', desc: 'Vị đắng mạnh mẽ truyền thống từ hạt Robusta rang đậm.', color: '#451a03', bg: '#fafaf9', icon: '☕' },
  { id: 'cf_sig_03_l', name: 'Cà Phê Phin Đen Đá (L)', price: 30000, cat: 'coffee', type: 'drink', desc: 'Vị đắng mạnh mẽ truyền thống từ hạt Robusta rang đậm.', color: '#451a03', bg: '#fafaf9', icon: '☕' },
  { id: 'cf_sig_04_m', name: 'Cà Phê Phin Đen Đá Đậm (M)', price: 25000, cat: 'coffee', type: 'drink', desc: 'Cà phê đen đá pha phin đặc biệt cực đậm dành cho ngày làm việc năng lượng.', color: '#451a03', bg: '#fafaf9', icon: '☕' },
  { id: 'cf_sig_04_l', name: 'Cà Phê Phin Đen Đá Đậm (L)', price: 30000, cat: 'coffee', type: 'drink', desc: 'Cà phê đen đá pha phin đặc biệt cực đậm dành cho ngày làm việc năng lượng.', color: '#451a03', bg: '#fafaf9', icon: '☕' },
  { id: 'cf_sig_05_m', name: 'Bạc Xỉu Đá (M)', price: 25000, cat: 'coffee', type: 'drink', desc: 'Nhiều sữa tươi nguyên kem béo ngậy pha chút cà phê phin thơm nhẹ.', color: '#b45309', bg: '#fffbeb', icon: '🥛' },
  { id: 'cf_sig_05_l', name: 'Bạc Xỉu Đá (L)', price: 30000, cat: 'coffee', type: 'drink', desc: 'Nhiều sữa tươi nguyên kem béo ngậy pha chút cà phê phin thơm nhẹ.', color: '#b45309', bg: '#fffbeb', icon: '🥛' },
  { id: 'cf_sig_06_m', name: 'Cà Phê Muối (M)', price: 30000, cat: 'coffee', type: 'drink', desc: 'Sự kết hợp hoàn hảo giữa vị đắng cà phê và lớp kem béo muối mặn ngậy.', color: '#78350f', bg: '#fafaf9', icon: '🧂' },
  { id: 'cf_sig_06_l', name: 'Cà Phê Muối (L)', price: 35000, cat: 'coffee', type: 'drink', desc: 'Sự kết hợp hoàn hảo giữa vị đắng cà phê và lớp kem béo muối mặn ngậy.', color: '#78350f', bg: '#fafaf9', icon: '🧂' },
  { id: 'cf_sig_07_m', name: 'Cà Phê Cốt Dừa (M)', price: 30000, cat: 'coffee', type: 'drink', desc: 'Hương thơm nồng nàn quyện cùng cốt dừa sữa đá bào mát lạnh.', color: '#78350f', bg: '#fffbeb', icon: '🥥' },
  { id: 'cf_sig_07_l', name: 'Cà Phê Cốt Dừa (L)', price: 35000, cat: 'coffee', type: 'drink', desc: 'Hương thơm nồng nàn quyện cùng cốt dừa sữa đá bào mát lạnh.', color: '#78350f', bg: '#fffbeb', icon: '🥥' },
  // --- COFFEE ESPRESSO ---
  { id: 'cf_esp_01_m', name: 'Espresso (Hot/Ice) (M)', price: 25000, cat: 'coffee', type: 'drink', desc: 'Hạt Arabica/Robusta hảo hạng chiết xuất áp suất cao, thơm ngậy nguyên chất.', color: '#451a03', bg: '#fafaf9', icon: '☕' },
  { id: 'cf_esp_01_l', name: 'Espresso (Hot/Ice) (L)', price: 30000, cat: 'coffee', type: 'drink', desc: 'Hạt Arabica/Robusta hảo hạng chiết xuất áp suất cao, thơm ngậy nguyên chất.', color: '#451a03', bg: '#fafaf9', icon: '☕' },
  { id: 'cf_esp_02_m', name: 'Latte (Hot/Ice) (M)', price: 25000, cat: 'coffee', type: 'drink', desc: 'Một shot Espresso thơm dịu hòa cùng sữa nóng phủ bọt mịn tinh tế.', color: '#78350f', bg: '#fffbeb', icon: '🥛' },
  { id: 'cf_esp_02_l', name: 'Latte (Hot/Ice) (L)', price: 30000, cat: 'coffee', type: 'drink', desc: 'Một shot Espresso thơm dịu hòa cùng sữa nóng phủ bọt mịn tinh tế.', color: '#78350f', bg: '#fffbeb', icon: '🥛' },
  { id: 'cf_esp_03_m', name: 'Capuchino (M)', price: 25000, cat: 'coffee', type: 'drink', desc: 'Sự cân bằng hoàn hảo giữa Espresso, sữa nóng và lớp bọt sữa dày bồng bềnh.', color: '#78350f', bg: '#fffbeb', icon: '☕' },
  { id: 'cf_esp_03_l', name: 'Capuchino (L)', price: 30000, cat: 'coffee', type: 'drink', desc: 'Sự cân bằng hoàn hảo giữa Espresso, sữa nóng và lớp bọt sữa dày bồng bềnh.', color: '#78350f', bg: '#fffbeb', icon: '☕' },
  { id: 'cf_esp_04_m', name: 'Americano (Hot/Ice) (M)', price: 25000, cat: 'coffee', type: 'drink', desc: 'Espresso thanh nhẹ pha loãng với nước ấm, giữ nguyên hương vị hạt mộc.', color: '#451a03', bg: '#fafaf9', icon: '☕' },
  { id: 'cf_esp_04_l', name: 'Americano (Hot/Ice) (L)', price: 30000, cat: 'coffee', type: 'drink', desc: 'Espresso thanh nhẹ pha loãng với nước ấm, giữ nguyên hương vị hạt mộc.', color: '#451a03', bg: '#fafaf9', icon: '☕' },
  // --- COFFEE BOTTLE ---
  { id: 'cf_bot_01', name: 'Cà Phê Chai Original (1L)', price: 139000, cat: 'coffee', type: 'drink', desc: 'Cà phê cốt sữa đậm đà đóng chai tiện dụng mang đi trữ tủ lạnh.', color: '#451a03', bg: '#fef3c7', icon: '🍾' },
  { id: 'cf_bot_02', name: 'Cà Phê Chai Vanilla (1L)', price: 139000, cat: 'coffee', type: 'drink', desc: 'Cà phê cốt sữa thêm hương Vanilla thanh ngọt dịu mát lạnh.', color: '#451a03', bg: '#fef3c7', icon: '🍾' },
  { id: 'cf_bot_03', name: 'Cà Phê Chai Triple Shot (1L)', price: 179000, cat: 'coffee', type: 'drink', desc: 'Siêu đậm đà đặc biệt với ba lần lượng Espresso nguyên bản.', color: '#451a03', bg: '#fef3c7', icon: '🍾' },
  // --- SUGARCANE ---
  { id: 'sc_01_m', name: 'Nước Mía Nguyên Bản (M)', price: 15000, cat: 'sugarcane', type: 'drink', desc: 'Nước mía Uncle Ba ép tươi nguyên chất siêu ngọt mát giải nhiệt.', color: '#15803d', bg: '#f0fdf4', icon: '🎋' },
  { id: 'sc_01_l', name: 'Nước Mía Nguyên Bản (L)', price: 20000, cat: 'sugarcane', type: 'drink', desc: 'Nước mía Uncle Ba ép tươi nguyên chất siêu ngọt mát giải nhiệt.', color: '#15803d', bg: '#f0fdf4', icon: '🎋' },
  { id: 'sc_02_m', name: 'Nước Mía Tắc (M)', price: 20000, cat: 'sugarcane', type: 'drink', desc: 'Nước mía ép cùng quả quất thơm ngát chua thanh bừng tỉnh sức sống.', color: '#15803d', bg: '#fefce8', icon: '🍊' },
  { id: 'sc_02_l', name: 'Nước Mía Tắc (L)', price: 25000, cat: 'sugarcane', type: 'drink', desc: 'Nước mía ép cùng quả quất thơm ngát chua thanh bừng tỉnh sức sống.', color: '#15803d', bg: '#fefce8', icon: '🍊' },
  { id: 'sc_03_m', name: 'Nước Mía Dừa (M)', price: 20000, cat: 'sugarcane', type: 'drink', desc: 'Nước mía quyện sánh cốt dừa tươi béo thơm ngậy mát dịu.', color: '#15803d', bg: '#fafaf9', icon: '🥥' },
  { id: 'sc_03_l', name: 'Nước Mía Dừa (L)', price: 25000, cat: 'sugarcane', type: 'drink', desc: 'Nước mía quyện sánh cốt dừa tươi béo thơm ngậy mát dịu.', color: '#15803d', bg: '#fafaf9', icon: '🥥' },
  { id: 'sc_04_m', name: 'Nước Mía Sầu Riêng (M)', price: 30000, cat: 'sugarcane', type: 'drink', desc: 'Nước mía thơm lừng hòa cùng cơm sầu Riêng Ri6 béo mịn thượng hạng.', color: '#a16207', bg: '#fefce8', icon: '🍈' },
  { id: 'sc_04_l', name: 'Nước Mía Sầu Riêng (L)', price: 35000, cat: 'sugarcane', type: 'drink', desc: 'Nước mía thơm lừng hòa cùng cơm sầu Riêng Ri6 béo mịn thượng hạng.', color: '#a16207', bg: '#fefce8', icon: '🍈' },
  { id: 'sc_05_m', name: 'Nước Mía Kem Muối (M)', price: 20000, cat: 'sugarcane', type: 'drink', desc: 'Sự sáng tạo đột phá giữa nước mía thanh ngọt và kem muối mặn béo ngậy.', color: '#15803d', bg: '#fafaf9', icon: '🧂' },
  { id: 'sc_05_l', name: 'Nước Mía Kem Muối (L)', price: 25000, cat: 'sugarcane', type: 'drink', desc: 'Sự sáng tạo đột phá giữa nước mía thanh ngọt và kem muối mặn béo ngậy.', color: '#15803d', bg: '#fafaf9', icon: '🧂' },
  // --- MILK TEA ---
  { id: 'mt_01_m', name: 'Sữa Tươi Trân Châu Đường Đen (M)', price: 25000, cat: 'milk_tea', type: 'drink', desc: 'Sữa tươi thanh trùng béo ngậy quyện đường đen Okinawa và trân châu dẻo.', color: '#1e40af', bg: '#eff6ff', icon: '🧋' },
  { id: 'mt_01_l', name: 'Sữa Tươi Trân Châu Đường Đen (L)', price: 30000, cat: 'milk_tea', type: 'drink', desc: 'Sữa tươi thanh trùng béo ngậy quyện đường đen Okinawa và trân châu dẻo.', color: '#1e40af', bg: '#eff6ff', icon: '🧋' },
  { id: 'mt_02_m', name: 'Trà Sữa Lài Ngọc Trai (M)', price: 25000, cat: 'milk_tea', type: 'drink', desc: 'Trà lài thơm thanh mát hòa cùng cốt sữa béo ngậy và trân châu trắng dai.', color: '#1e40af', bg: '#eff6ff', icon: '🧋' },
  { id: 'mt_02_l', name: 'Trà Sữa Lài Ngọc Trai (L)', price: 30000, cat: 'milk_tea', type: 'drink', desc: 'Trà lài thơm thanh mát hòa cùng cốt sữa béo ngậy và trân châu trắng dai.', color: '#1e40af', bg: '#eff6ff', icon: '🧋' },
  { id: 'mt_03_m', name: 'Hồng Trà Sữa Ngọc Trai (M)', price: 25000, cat: 'milk_tea', type: 'drink', desc: 'Hồng trà cổ truyền đậm đà quyện cốt sữa béo và trân châu dai giòn.', color: '#be123c', bg: '#fff1f2', icon: '🧋' },
  { id: 'mt_03_l', name: 'Hồng Trà Sữa Ngọc Trai (L)', price: 30000, cat: 'milk_tea', type: 'drink', desc: 'Hồng trà cổ truyền đậm đà quyện cốt sữa béo và trân châu dai giòn.', color: '#be123c', bg: '#fff1f2', icon: '🧋' },
  { id: 'mt_04_m', name: 'Cốt Dừa Cacao (M)', price: 35000, cat: 'milk_tea', type: 'drink', desc: 'Cacao nguyên chất đậm đà xay cùng cốt dừa sữa đặc ngậy mát lạnh.', color: '#78350f', bg: '#fffbeb', icon: '🥥' },
  { id: 'mt_04_l', name: 'Cốt Dừa Cacao (L)', price: 40000, cat: 'milk_tea', type: 'drink', desc: 'Cacao nguyên chất đậm đà xay cùng cốt dừa sữa đặc ngậy mát lạnh.', color: '#78350f', bg: '#fffbeb', icon: '🥥' },
  { id: 'mt_05', name: 'Matcha Hương Xuân', price: 39000, cat: 'milk_tea', type: 'drink', desc: 'Bột Matcha Uji thượng hạng kết hợp sữa tươi nguyên kem dịu thơm ngọt.', color: '#15803d', bg: '#f0fdf4', icon: '🌱' },
  { id: 'mt_06', name: 'Freeze Matcha Dừa Non', price: 39000, cat: 'milk_tea', type: 'drink', desc: 'Matcha đá xay béo mịn ngập hương dừa non xiêm sợi bùi bùi.', color: '#15803d', bg: '#f0fdf4', icon: '🥥' },
  { id: 'mt_07', name: 'Freeze Matcha Dừa Xoài', price: 39000, cat: 'milk_tea', type: 'drink', desc: 'Sự giao thoa tuyệt hảo giữa matcha dừa non xay và sốt xoài chín ngọt mọng.', color: '#15803d', bg: '#fefce8', icon: '🥭' },
  // --- TEA ---
  { id: 'tea_01_m', name: 'Trà Tắc / Chanh (M)', price: 10000, cat: 'tea', type: 'drink', desc: 'Trà lài ủ lạnh pha tắc tươi hoặc chanh quả chua mát ngọt ngào.', color: '#166534', bg: '#fefce8', icon: '🍋' },
  { id: 'tea_01_l', name: 'Trà Tắc / Chanh (L)', price: 12000, cat: 'tea', type: 'drink', desc: 'Trà lài ủ lạnh pha tắc tươi hoặc chanh quả chua mát ngọt ngào.', color: '#166534', bg: '#fefce8', icon: '🍋' },
  { id: 'tea_02_m', name: 'Trà Mãng Cầu (M)', price: 35000, cat: 'tea', type: 'drink', desc: 'Trà lài kết hợp mứt mãng cầu xiêm chua ngọt thanh mát nhiều xơ quả giòn.', color: '#166534', bg: '#f0fdf4', icon: '🍈' },
  { id: 'tea_02_l', name: 'Trà Mãng Cầu (L)', price: 40000, cat: 'tea', type: 'drink', desc: 'Trà lài kết hợp mứt mãng cầu xiêm chua ngọt thanh mát nhiều xơ quả giòn.', color: '#166534', bg: '#f0fdf4', icon: '🍈' },
  { id: 'tea_03_m', name: 'Trà Mơ Xí Muội (M)', price: 35000, cat: 'tea', type: 'drink', desc: 'Trà mơ vàng thanh kết hợp xí muội mặn mặn ngọt ngọt đã khát ấm giọng.', color: '#a16207', bg: '#fefce8', icon: '🍑' },
  { id: 'tea_03_l', name: 'Trà Mơ Xí Muội (L)', price: 40000, cat: 'tea', type: 'drink', desc: 'Trà mơ vàng thanh kết hợp xí muội mặn mặn ngọt ngọt đã khát ấm giọng.', color: '#a16207', bg: '#fefce8', icon: '🍑' },
  { id: 'tea_04_m', name: 'Trà Ổi Hồng (M)', price: 35000, cat: 'tea', type: 'drink', desc: 'Trà hoa nhài thơm quyện ổi hồng tự nhiên mát rượi ngọt thơm đặc sắc.', color: '#be123c', bg: '#fff1f2', icon: '🍎' },
  { id: 'tea_04_l', name: 'Trà Ổi Hồng (L)', price: 40000, cat: 'tea', type: 'drink', desc: 'Trà hoa nhài thơm quyện ổi hồng tự nhiên mát rượi ngọt thơm đặc sắc.', color: '#be123c', bg: '#fff1f2', icon: '🍎' },
  { id: 'tea_mac_01_m', name: 'Trà Sen Phủ Kem Muối (M)', price: 35000, cat: 'tea', type: 'drink', desc: 'Trà hạt sen thanh mát ngọt dịu phủ kem phô mai muối sánh đặc mịn màng.', color: '#166534', bg: '#f0fdf4', icon: '🍵' },
  { id: 'tea_mac_01_l', name: 'Trà Sen Phủ Kem Muối (L)', price: 40000, cat: 'tea', type: 'drink', desc: 'Trà hạt sen thanh mát ngọt dịu phủ kem phô mai muối sánh đặc mịn màng.', color: '#166534', bg: '#f0fdf4', icon: '🍵' },
  { id: 'tea_mac_02_m', name: 'Trà Vải Hồng Phủ Kem Muối (M)', price: 35000, cat: 'tea', type: 'drink', desc: 'Trà vải tươi mát thơm ngọt hoa hồng quyện kem muối béo ngậy.', color: '#be123c', bg: '#fff1f2', icon: '🌹' },
  { id: 'tea_mac_02_l', name: 'Trà Vải Hồng Phủ Kem Muối (L)', price: 40000, cat: 'tea', type: 'drink', desc: 'Trà vải tươi mát thơm ngọt hoa hồng quyện kem muối béo ngậy.', color: '#be123c', bg: '#fff1f2', icon: '🌹' },
  { id: 'tea_mac_03_m', name: 'Trà Nho Nhã Phủ Kem Muối (M)', price: 35000, cat: 'tea', type: 'drink', desc: 'Hương nho tím căng mọng mát lành hòa quyện kem phô mai mặn béo ngậy.', color: '#1e40af', bg: '#eff6ff', icon: '🍇' },
  { id: 'tea_mac_03_l', name: 'Trà Nho Nhã Phủ Kem Muối (L)', price: 40000, cat: 'tea', type: 'drink', desc: 'Hương nho tím căng mọng mát lành hòa quyện kem phô mai mặn béo ngậy.', color: '#1e40af', bg: '#eff6ff', icon: '🍇' },
  { id: 'tea_mac_04_m', name: 'Trà Dâu Phủ Kem Muối (M)', price: 35000, cat: 'tea', type: 'drink', desc: 'Trà dâu tây Đà Lạt đỏ mọng tươi mát cân bằng kem béo ngậy sánh mịn.', color: '#be123c', bg: '#fff1f2', icon: '🍓' },
  { id: 'tea_mac_04_l', name: 'Trà Dâu Phủ Kem Muối (L)', price: 40000, cat: 'tea', type: 'drink', desc: 'Trà dâu tây Đà Lạt đỏ mọng tươi mát cân bằng kem béo ngậy sánh mịn.', color: '#be123c', bg: '#fff1f2', icon: '🍓' },
  // --- FRUIT JUICE ---
  { id: 'jc_01', name: 'Nước Ép Ổi / Xoài / Dưa Hấu', price: 20000, cat: 'juice', type: 'drink', desc: 'Nước ép tươi ép chậm giữ trọn vitamin từ trái cây chín mọng tự nhiên.', color: '#854d0e', bg: '#fefce8', icon: '🧃' },
  { id: 'jc_02', name: 'Nước Ép Thơm', price: 30000, cat: 'juice', type: 'drink', desc: 'Ép dứa chín mật nguyên chất 100% giàu dưỡng chất và tươi mát.', color: '#854d0e', bg: '#fefce8', icon: '🍍' },
  { id: 'jc_03', name: 'Nước Ép Cam / Bưởi / Táo / Quýt', price: 35000, cat: 'juice', type: 'drink', desc: 'Món nước ép giàu Vitamin C tăng cường hệ miễn dịch tuyệt vời.', color: '#854d0e', bg: '#fefce8', icon: '🍊' },
  // --- TOPPINGS ---
  { id: 'tp_01', name: 'Trân Châu Đường Đen', price: 5000, cat: 'topping', type: 'food', desc: 'Trân châu caramel dẻo ngọt ngào đẫm mật đường đen ngọt ngậy.', color: '#475569', bg: '#f1f5f9', icon: '🧆' },
  { id: 'tp_02', name: 'Trân Châu Trắng', price: 5000, cat: 'topping', type: 'food', desc: 'Trân châu trắng agar giòn sần sật, thanh mát dễ chịu.', color: '#475569', bg: '#f1f5f9', icon: '⚪' },
  { id: 'tp_03', name: 'Thạch Yogurt Thuỷ Tinh', price: 5000, cat: 'topping', type: 'food', desc: 'Hạt thủy tinh sữa chua cắn bùng nổ hương sữa chua thanh mát hấp dẫn.', color: '#475569', bg: '#f1f5f9', icon: '🔮' },
  { id: 'tp_04', name: 'Thạch Củ Năng', price: 5000, cat: 'topping', type: 'food', desc: 'Thạch dai mềm bao bọc nhân củ năng giòn sần sật mát lạnh.', color: '#475569', bg: '#f1f5f9', icon: '🍮' },
  { id: 'tp_05', name: 'Trân Châu Phô Mai', price: 5000, cat: 'topping', type: 'food', desc: 'Viên trân châu nhân phô mai béo ngậy ngọt ngào tan chảy cực đã.', color: '#475569', bg: '#f1f5f9', icon: '🧀' },
  // --- KHÁC (Tạp hóa mini) ---
  { id: 'oth_01', name: 'Nước Suối Lavie/Aquafina', price: 7000, cat: 'other', type: 'food', desc: 'Nước uống tinh khiết đóng chai, mát lạnh giải khát tức thì.', color: '#0369a1', bg: '#f0f9ff', icon: '💧' },
  { id: 'oth_02', name: 'Coca Cola Lon 330ml', price: 15000, cat: 'other', type: 'food', desc: 'Nước ngọt có ga Coca Cola lon 330ml mát lạnh sảng khoái.', color: '#991b1b', bg: '#fff1f2', icon: '🥤' },
  { id: 'oth_03', name: 'Pepsi Lon 330ml', price: 15000, cat: 'other', type: 'food', desc: 'Nước ngọt có ga Pepsi lon 330ml thơm ngọt sảng khoái.', color: '#1e3a8a', bg: '#eff6ff', icon: '🥤' },
  { id: 'oth_04', name: 'Sting Đỏ Lon 330ml', price: 15000, cat: 'other', type: 'food', desc: 'Nước tăng lực Sting đỏ lon 330ml cung cấp năng lượng tức thì.', color: '#b91c1c', bg: '#fff1f2', icon: '⚡' },
  { id: 'oth_05', name: '7Up Lon 330ml', price: 15000, cat: 'other', type: 'food', desc: 'Nước ngọt có ga 7Up lon 330ml thanh mát tươi sảng khoái.', color: '#15803d', bg: '#f0fdf4', icon: '🟢' },
  { id: 'oth_06', name: 'Milo Hộp 180ml', price: 12000, cat: 'other', type: 'food', desc: 'Thức uống lúa mạch Milo hộp 180ml bổ dưỡng cho trẻ em.', color: '#166534', bg: '#fef3c7', icon: '🧃' },
  { id: 'oth_07', name: 'Sữa Vinamilk Hộp', price: 10000, cat: 'other', type: 'food', desc: 'Sữa tươi tiệt trùng Vinamilk hộp đóng gói tiện lợi mang đi.', color: '#1e40af', bg: '#eff6ff', icon: '🥛' },
  { id: 'oth_08', name: 'Bánh Oreo Gói', price: 15000, cat: 'other', type: 'food', desc: 'Bánh quy Oreo nhân kem vani giòn tan thơm ngon hấp dẫn.', color: '#292524', bg: '#f5f5f4', icon: '🍪' },
  { id: 'oth_09', name: 'Bánh Cosy Marie', price: 10000, cat: 'other', type: 'food', desc: 'Bánh quy bơ Cosy Marie giòn thơm nhẹ nhàng dùng kèm trà cà phê.', color: '#b45309', bg: '#fffbeb', icon: '🍘' },
  { id: 'oth_10', name: 'Snack Oishi Gói Nhỏ', price: 10000, cat: 'other', type: 'food', desc: 'Snack bắp Oishi giòn rụm vị phô mai thơm ngon khó cưỡng.', color: '#d97706', bg: '#fefce8', icon: '🍟' },
  { id: 'oth_11', name: 'Kẹo Cao Su Orbit', price: 12000, cat: 'other', type: 'food', desc: 'Kẹo cao su Orbit hương bạc hà thanh mát làm sạch răng miệng.', color: '#0891b2', bg: '#ecfeff', icon: '🍬' },
  { id: 'oth_12', name: 'Kẹo Mentos Cuộn', price: 12000, cat: 'other', type: 'food', desc: 'Kẹo Mentos hương trái cây thơm ngọt dai mềm sảng khoái.', color: '#7c3aed', bg: '#f5f3ff', icon: '🍬' },
  { id: 'oth_13', name: 'Khăn Giấy Bỏ Túi', price: 5000, cat: 'other', type: 'food', desc: 'Khăn giấy mềm mịn đa năng tiện lợi bỏ túi mang theo mọi lúc.', color: '#475569', bg: '#f8fafc', icon: '🧻' },
  { id: 'oth_14', name: 'Mì Tôm Hảo Hảo Gói', price: 8000, cat: 'other', type: 'food', desc: 'Mì tôm Hảo Hảo vị tôm chua cay thơm ngon tiện lợi.', color: '#c2410c', bg: '#fff7ed', icon: '🍜' },
  { id: 'oth_15', name: 'Pin AA / AAA (2 cục)', price: 20000, cat: 'other', type: 'food', desc: 'Pin tiểu AA hoặc AAA dùng cho đồ điện tử điều khiển từ xa.', color: '#166534', bg: '#f0fdf4', icon: '🔋' },
  { id: 'oth_16', name: 'Bút Bi Thiên Long', price: 5000, cat: 'other', type: 'food', desc: 'Bút bi Thiên Long viết trơn mực đều đẹp tiện dụng hàng ngày.', color: '#1e40af', bg: '#eff6ff', icon: '🖊️' },
  // --- FOOD ---
  { id: 'food_01', name: 'Cơm Tấm Sườn Thường', price: 39000, cat: 'food', type: 'food', desc: 'Cơm tấm dẻo thơm kết hợp sườn cốt lết nướng tẩm vị đậm đà và nước mắm chua ngọt.', color: '#b45309', bg: '#fffbeb', icon: '🍛' },
  { id: 'food_02', name: 'Cơm Tấm Sườn Đặc Biệt', price: 49000, cat: 'food', type: 'food', desc: 'Phần sườn tảng nướng mật ong kèm chả trứng béo ngậy, bì thính heo thơm giòn.', color: '#b45309', bg: '#fffbeb', icon: '🍛' },
  { id: 'food_03', name: 'Cơm Chiên Hải Sản', price: 45000, cat: 'food', type: 'food', desc: 'Cơm chiên hạt tơi vàng ruộm cùng mực tươi, tôm sú bóc vỏ và rau củ.', color: '#d97706', bg: '#fffbeb', icon: '🍚' },
  { id: 'food_04', name: 'Cơm Bò Xào Đậu Que', price: 45000, cat: 'food', type: 'food', desc: 'Thịt bò thăn thái mỏng xào nhanh cùng đậu que ngọt giòn đậm vị.', color: '#78350f', bg: '#fffbeb', icon: '🥩' },
  { id: 'food_05', name: 'Cơm Gà Kho Sả Ớt', price: 35000, cat: 'food', type: 'food', desc: 'Gà ta kho săn chắc ngập sả tươi băm nhuyễn và chút cay nồng của ớt hiểm.', color: '#b45309', bg: '#fffbeb', icon: '🍗' },
  { id: 'food_06', name: 'Cơm Cá Nục Kho Rau Răm', price: 35000, cat: 'food', type: 'food', desc: 'Cá nục kho nhừ đậm vị tiêu kết hợp rau răm cay nồng đưa cơm dân dã.', color: '#1e3a8a', bg: '#eff6ff', icon: '🐟' },
  { id: 'food_07', name: 'Chim Cút Chiên Mắm Tỏi', price: 45000, cat: 'food', type: 'food', desc: 'Chim cút chiên giòn tan áo lớp sốt mắm keo tỏi ớt thơm lừng ngây ngất.', color: '#be123c', bg: '#fff1f2', icon: '🍖' },
  { id: 'food_08', name: 'Cơm Thịt Luộc Cà Pháo', price: 35000, cat: 'food', type: 'food', desc: 'Thịt ba chỉ luộc chín tới ngọt béo ăn kèm cà pháo giòn tan mặn mặn.', color: '#475569', bg: '#f1f5f9', icon: '🥓' },
  { id: 'food_09', name: 'Bún Thái Hải Sản', price: 45000, cat: 'food', type: 'food', desc: 'Bún tươi ngập trong nước dùng Tomyum chua cay, mực tôm và rau thơm ngát.', color: '#be123c', bg: '#fff1f2', icon: '🍜' },
];

const INGREDIENT_RECIPES = {
  cf_sig_01_m: { 'Hạt Cà Phê': 15, 'Sữa Đặc': 30 }, cf_sig_02_m: { 'Hạt Cà Phê': 20, 'Sữa Đặc': 30 },
  cf_sig_03_m: { 'Hạt Cà Phê': 15 }, cf_sig_04_m: { 'Hạt Cà Phê': 20 },
  cf_sig_05_m: { 'Hạt Cà Phê': 12, 'Sữa Đặc': 20, 'Sữa Tươi': 100 },
  cf_sig_06_m: { 'Hạt Cà Phê': 15, 'Kem Béo': 30 }, cf_sig_07_m: { 'Hạt Cà Phê': 15, 'Cốt Dừa': 40 },
  cf_esp_01_m: { 'Hạt Cà Phê': 15 }, cf_esp_02_m: { 'Hạt Cà Phê': 15, 'Sữa Tươi': 120 },
  cf_esp_03_m: { 'Hạt Cà Phê': 15, 'Sữa Tươi': 100, 'Kem Béo': 20 }, cf_esp_04_m: { 'Hạt Cà Phê': 15 },
  cf_sig_01_l: { 'Hạt Cà Phê': 20, 'Sữa Đặc': 40 }, cf_sig_02_l: { 'Hạt Cà Phê': 25, 'Sữa Đặc': 40 },
  cf_sig_03_l: { 'Hạt Cà Phê': 20 }, cf_sig_04_l: { 'Hạt Cà Phê': 25 },
  cf_sig_05_l: { 'Hạt Cà Phê': 15, 'Sữa Đặc': 30, 'Sữa Tươi': 150 },
  cf_sig_06_l: { 'Hạt Cà Phê': 20, 'Kem Béo': 40 }, cf_sig_07_l: { 'Hạt Cà Phê': 20, 'Cốt Dừa': 60 },
  cf_esp_01_l: { 'Hạt Cà Phê': 20 }, cf_esp_02_l: { 'Hạt Cà Phê': 20, 'Sữa Tươi': 180 },
  cf_esp_03_l: { 'Hạt Cà Phê': 20, 'Sữa Tươi': 150, 'Kem Béo': 30 }, cf_esp_04_l: { 'Hạt Cà Phê': 20 },
  cf_bot_01: { 'Hạt Cà Phê': 60, 'Sữa Đặc': 120 }, cf_bot_02: { 'Hạt Cà Phê': 60, 'Sữa Đặc': 120, 'Siro Vanilla': 20 }, cf_bot_03: { 'Hạt Cà Phê': 90, 'Sữa Đặc': 120 },
  sc_01_m: { 'Mía Cây': 200 }, sc_02_m: { 'Mía Cây': 200, 'Quả Tắc': 2 }, sc_03_m: { 'Mía Cây': 180, 'Cốt Dừa': 30 },
  sc_04_m: { 'Mía Cây': 180, 'Cơm Sầu Riêng': 25 }, sc_05_m: { 'Mía Cây': 180, 'Kem Béo': 30 },
  sc_01_l: { 'Mía Cây': 300 }, sc_02_l: { 'Mía Cây': 300, 'Quả Tắc': 3 }, sc_03_l: { 'Mía Cây': 250, 'Cốt Dừa': 45 },
  sc_04_l: { 'Mía Cây': 250, 'Cơm Sầu Riêng': 40 }, sc_05_l: { 'Mía Cây': 250, 'Kem Béo': 45 },
  mt_01_m: { 'Sữa Tươi': 150, 'Đường Đen': 30, 'Trân Châu': 40 }, mt_02_m: { 'Lá Trà Lài': 10, 'Bột Sữa': 20, 'Trân Châu': 40 },
  mt_03_m: { 'Lá Hồng Trà': 10, 'Bột Sữa': 20, 'Trân Châu': 40 }, mt_04_m: { 'Cốt Dừa': 40, 'Bột Cacao': 15 },
  mt_01_l: { 'Sữa Tươi': 200, 'Đường Đen': 45, 'Trân Châu': 60 }, mt_02_l: { 'Lá Trà Lài': 15, 'Bột Sữa': 30, 'Trân Châu': 60 },
  mt_03_l: { 'Lá Hồng Trà': 15, 'Bột Sữa': 30, 'Trân Châu': 60 }, mt_04_l: { 'Cốt Dừa': 60, 'Bột Cacao': 20 },
  mt_05: { 'Bột Matcha': 10, 'Sữa Tươi': 150 }, mt_06: { 'Bột Matcha': 10, 'Cốt Dừa': 40, 'Dừa Sợi': 15 }, mt_07: { 'Bột Matcha': 10, 'Cốt Dừa': 40, 'Mứt Xoài': 25 },
  tea_01_m: { 'Lá Trà': 10, 'Quả Tắc': 2 }, tea_02_m: { 'Lá Trà': 10, 'Mứt Mãng Cầu': 25 },
  tea_03_m: { 'Lá Trà': 10, 'Mơ Quả': 30 }, tea_04_m: { 'Lá Trà': 10, 'Siro Ổi': 25 },
  tea_mac_01_m: { 'Lá Trà Sen': 10, 'Kem Béo': 30 }, tea_mac_02_m: { 'Lá Trà': 10, 'Siro Vải': 20, 'Kem Béo': 30 },
  tea_mac_03_m: { 'Lá Trà': 10, 'Siro Nho': 20, 'Kem Béo': 30 }, tea_mac_04_m: { 'Lá Trà': 10, 'Siro Dâu': 20, 'Kem Béo': 30 },
  tea_01_l: { 'Lá Trà': 15, 'Quả Tắc': 3 }, tea_02_l: { 'Lá Trà': 15, 'Mứt Mãng Cầu': 40 },
  tea_03_l: { 'Lá Trà': 15, 'Mơ Quả': 40 }, tea_04_l: { 'Lá Trà': 15, 'Siro Ổi': 40 },
  tea_mac_01_l: { 'Lá Trà Sen': 15, 'Kem Béo': 40 }, tea_mac_02_l: { 'Lá Trà': 15, 'Siro Vải': 30, 'Kem Béo': 40 },
  tea_mac_03_l: { 'Lá Trà': 15, 'Siro Nho': 30, 'Kem Béo': 40 }, tea_mac_04_l: { 'Lá Trà': 15, 'Siro Dâu': 30, 'Kem Béo': 40 },
  jc_01: { 'Trái Cây Ép': 150 }, jc_02: { 'Thơm Quả': 200 }, jc_03: { 'Trái Cây Ép': 200 },
  tp_01: { 'Trân Châu': 20 }, tp_02: { 'Trân Châu': 20 }, tp_03: { 'Thạch Yogurt': 20 },
  tp_04: { 'Thạch Củ Năng': 20 }, tp_05: { 'Trân Châu Phô Mai': 20 },
  food_01: { 'Sườn Heo': 1, 'Gạo Tấm': 120 }, food_02: { 'Sườn Heo': 1, 'Gạo Tấm': 120, 'Trứng': 0.5 },
  food_03: { 'Gạo': 120, 'Tôm Sú': 30, 'Mực': 30 }, food_04: { 'Thịt Bò': 50, 'Đậu Que': 80 },
  food_05: { 'Thịt Gà': 80, 'Sả': 15 }, food_06: { 'Cá Nục': 100, 'Rau Răm': 10 },
  food_07: { 'Chim Cút': 2 }, food_08: { 'Thịt Ba Chỉ': 80, 'Cà Pháo': 30 },
  food_09: { 'Bún': 150, 'Tôm Sú': 30, 'Mực': 30 },
};

const CAT_LABELS = {
  all: 'Tất Cả',
  coffee: 'Cà Phê',
  sugarcane: 'Nước Mía',
  milk_tea: 'Trà Sữa',
  tea: 'Trà & Macchiato',
  juice: 'Nước Ép',
  topping: 'Topping',
  food: 'Món Ăn',
  other: '...',
};

const fmt = n => new Intl.NumberFormat('vi-VN').format(n || 0) + ' ₫';
const fmtDate = d => {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const STAFF_LIST = ['Panda', 'Bé Na', 'Duy', 'Thanh', 'Phương', 'Hân', 'Ngọc', 'Phúc'];

export const OrderStep1 = ({ user, setPage }) => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  const [activePromo, setActivePromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString('vi-VN')), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
      else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
      else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen();
      else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  };

  const filteredItems = useMemo(() => {
    return SAMPLE_ITEMS.filter(item => {
      const matchesCat = activeCat === 'all' || item.cat === activeCat;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                            item.desc.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [search, activeCat]);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const decreaseQty = (id) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === id);
      if (exists.qty === 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);

  const staffDiscount = useMemo(() => {
    if (!isStaff) return 0;
    return cart.reduce((sum, item) => {
      if (item.type === 'drink') return sum + Math.round(item.price * item.qty * 0.05);
      return sum;
    }, 0);
  }, [cart, isStaff]);

  const promoDiscount = useMemo(() => {
    if (!activePromo) return 0;
    const baseAmount = subtotal - staffDiscount;
    if (baseAmount <= 0) return 0;
    if (activePromo.type === 'flat') return Math.min(activePromo.value, baseAmount);
    if (activePromo.type === 'percent') return Math.round(baseAmount * (activePromo.value / 100));
    return 0;
  }, [subtotal, staffDiscount, activePromo]);

  const discountedSubtotal = useMemo(() => Math.max(0, subtotal - staffDiscount - promoDiscount), [subtotal, staffDiscount, promoDiscount]);
  const tax = useMemo(() => Math.round(discountedSubtotal * 0.1), [discountedSubtotal]);
  const total = discountedSubtotal + tax;

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (code === 'LEES50') { setActivePromo({ code, type: 'flat', value: 50000, label: 'Giảm 50.000 ₫' }); setPromoInput(''); }
    else if (code === 'HEHE10') { setActivePromo({ code, type: 'percent', value: 10, label: 'Giảm 10%' }); setPromoInput(''); }
    else setPromoError('Mã giảm giá không tồn tại hoặc đã hết hạn.');
  };

  const handleRemovePromo = () => { setActivePromo(null); setPromoError(''); };

  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [isHandoverSuccess, setIsHandoverSuccess] = useState(false);
  const [actualCash, setActualCash] = useState('');
  const [handoverNote, setHandoverNote] = useState('');
  const [handoverTab, setHandoverTab] = useState('cashier'); // 'cashier' | 'barista' | 'history'
  const [historyType, setHistoryType] = useState('cashier'); // 'cashier' | 'barista'

  const [selectedCashierStaff, setSelectedCashierStaff] = useState(user.name);
  const [showCashierStaffDropdown, setShowCashierStaffDropdown] = useState(false);
  const [selectedBaristaStaff, setSelectedBaristaStaff] = useState(user.name);
  const [showBaristaStaffDropdown, setShowBaristaStaffDropdown] = useState(false);
  const [baristaDate, setBaristaDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [baristaShift, setBaristaShift] = useState('morning');
  const [baristaNote, setBaristaNote] = useState('');
  const [baristaStaffCount, setBaristaStaffCount] = useState('');
  const [baristaIngredients, setBaristaIngredients] = useState(() => LS.get('lc_pos_ingredients', [
    { id: 'i1', name: 'Sữa đặc', unit: 'hộp', start: 5, in: 4, out: 3 },
    { id: 'i2', name: 'Sữa tươi', unit: 'g', start: 0, in: 0, out: 0 },
    { id: 'i3', name: 'Đường nước', unit: 'ml', start: 250, in: 0, out: 159 },
    { id: 'i4', name: 'Trân châu đen', unit: 'g', start: 0, in: 0, out: 0 },
    { id: 'i5', name: 'Ly nhựa M', unit: 'cái', start: 50, in: 0, out: 40 },
    { id: 'i6', name: 'Ly nhựa L', unit: 'cái', start: 50, in: 0, out: 30 },
    { id: 'i7', name: 'Ori', unit: 'ml', start: 15000, in: 0, out: 2345 },
  ]));

  const baristaHistory = useMemo(() => {
    const all = LS.get('lc_shifts', []);
    const safeAll = Array.isArray(all) ? all.filter(Boolean) : [];
    return safeAll.filter(s => s && s.roleType === 'barista').sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [showHandoverModal]);

  const cashierHistory = useMemo(() => {
    const all = LS.get('lc_shifts', []);
    const safeAll = Array.isArray(all) ? all.filter(Boolean) : [];
    return safeAll.filter(s => s && (s.roleType === 'cashier' || s.roleType === 'order')).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [showHandoverModal]);

  const updBaristaIng = (id, field, val) => {
    setBaristaIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));
  };
  const addBaristaIng = () => {
    setBaristaIngredients(prev => [...prev, { id: 'pos-i-' + Math.random().toString(36).slice(2, 9), name: '', unit: 'g', start: '', in: '', out: '' }]);
  };
  const delBaristaIng = (id) => {
    setBaristaIngredients(prev => prev.filter(i => i.id !== id));
  };

  const handleConfirmBaristaHandover = () => {
    const today = baristaDate;
    let s = {
      id: 'S-' + Math.random().toString(36).slice(2, 9),
      date: today,
      shift: baristaShift,
      shiftLabel: baristaShift === 'morning' ? 'Ca Sáng (06:00 - 14:00)' : 'Ca Chiều (14:00 - 22:00)',
      staffName: selectedBaristaStaff,
      roleType: 'barista',
      note: baristaNote.trim(),
      staffCount: Number(baristaStaffCount) || 0,
      submittedAt: new Date().toISOString(),
      ingredients: baristaIngredients.filter(i => i.name.trim() !== '')
    };

    let rawInventory = LS.get('lc_inventory', []);
    let inventory = Array.isArray(rawInventory) ? rawInventory.filter(Boolean) : [];
    s.ingredients.forEach(ing => {
      const ending = (Number(ing.start) || 0) + (Number(ing.in) || 0) - (Number(ing.out) || 0);
      const matched = inventory.find(i => i && typeof i.name === 'string' && i.name.toLowerCase().includes(ing.name.toLowerCase()));
      if (matched) {
        matched.quantity = ending;
      }
    });
    LS.set('lc_inventory', inventory);

    let rawShifts = LS.get('lc_shifts', []);
    let shifts = Array.isArray(rawShifts) ? rawShifts.filter(Boolean) : [];
    shifts.unshift(s);
    LS.set('lc_shifts', shifts);
    LS.set('lc_pos_ingredients', baristaIngredients);

    // ── AUTOMATICALLY AGGREGATE INTO MANAGER'S REPORT ──
    try {
      let rawReports = LS.get('lc_reports', []);
      let reports = Array.isArray(rawReports) ? rawReports.filter(Boolean) : [];
      let todayReportIndex = reports.findIndex(r => r && r.date === today);

      const noteMsg = `[Giao ca Pha Chế ${selectedBaristaStaff}: ${baristaNote.trim() || 'Không có sự cố'}]`;

      if (todayReportIndex !== -1) {
        let existingNote = reports[todayReportIndex].note || '';
        if (!existingNote.includes(noteMsg)) {
          existingNote = existingNote.trim() ? existingNote + ' | ' + noteMsg : noteMsg;
        }
        reports[todayReportIndex] = {
          ...reports[todayReportIndex],
          note: existingNote
        };
      } else {
        reports.unshift({
          id: 'R-' + Math.random().toString(36).slice(2, 9),
          date: today,
          createdBy: 'Hệ thống POS',
          createdByRole: 'system',
          cashRevenue: 0,
          transferRevenue: 0,
          cardRevenue: 0,
          grabRevenue: 0,
          shopeeRevenue: 0,
          goodsCost: 0,
          fixedExpenses: [
            { id: 'f1', category: 'Lương nhân viên', amount: 450000 },
            { id: 'f2', category: 'Điện nước', amount: 180000 },
            { id: 'f3', category: 'Thuê mặt bằng', amount: 500000 },
          ],
          otherExpenses: [],
          note: `Báo cáo tự động từ POS: ${noteMsg}`,
          status: 'pending',
          submittedAt: new Date().toISOString()
        });
      }
      LS.set('lc_reports', reports);
    } catch (e) {
      console.warn("Failed to auto-update manager reports for barista", e);
    }

    setIsHandoverSuccess(true);
  };

  const loginHistory = useMemo(() => {
    return LS.get('lc_login_history', []);
  }, [showLoginHistoryModal]);

  const activeShift = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const shifts = LS.get('lc_shifts', []);
    const safeShifts = Array.isArray(shifts) ? shifts.filter(Boolean) : [];
    return safeShifts.find(s => s && s.date === today && (s.staffName === selectedCashierStaff || s.staffName === user.name)) || {
      cashRevenue: 0, transferRevenue: 0, cardRevenue: 0, grabRevenue: 0, shopeeRevenue: 0, totalRevenue: 0, orders: 0
    };
  }, [showHandoverModal, lastOrderDetails, selectedCashierStaff]);

  const shiftOrders = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const orders = LS.get('lc_billing_orders', []);
    const safeOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];
    return safeOrders.filter(o => o && o.date === today && (o.cashierName === selectedCashierStaff || o.cashierName === user.name));
  }, [showHandoverModal, lastOrderDetails, selectedCashierStaff]);

  const handleConfirmHandover = () => {
    const today = new Date().toISOString().split('T')[0];
    let rawShifts = LS.get('lc_shifts', []);
    let shifts = Array.isArray(rawShifts) ? rawShifts.filter(Boolean) : [];
    
    let activeIndex = shifts.findIndex(s => s && s.date === today && (s.staffName === selectedCashierStaff || s.staffName === user.name));
    const counted = parseFloat(actualCash.replace(/\./g, '')) || 0;
    const sysCash = activeShift.cashRevenue || 0;
    const diff = counted - sysCash;

    const updateData = {
      actualCashCounted: counted,
      actualCashRevenue: counted,
      cashVariance: diff,
      cashDiscrepancy: diff,
      handoverTime: new Date().toLocaleString('vi-VN'),
      status: 'closed',
      note: (handoverNote.trim() ? handoverNote.trim() + ' | ' : '') + (diff === 0 ? 'Khớp két.' : diff > 0 ? `Thừa két: ${fmt(diff)}` : `Thiếu két: ${fmt(diff)}`)
    };

    if (activeIndex !== -1) {
      shifts[activeIndex] = {
        ...shifts[activeIndex],
        ...updateData,
        staffName: selectedCashierStaff
      };
    } else {
      shifts.unshift({
        id: 'S-' + Math.random().toString(36).slice(2, 9),
        date: today,
        shift: new Date().getHours() < 14 ? 'morning' : 'afternoon',
        staffName: selectedCashierStaff,
        roleType: (user.role === 'order' || user.role === 'cashier') ? 'cashier' : user.role,
        cashRevenue: 0,
        transferRevenue: 0,
        cardRevenue: 0,
        grabRevenue: 0,
        shopeeRevenue: 0,
        totalRevenue: 0,
        orders: 0,
        staffCount: 1,
        submittedAt: new Date().toISOString(),
        ...updateData
      });
    }
    
    LS.set('lc_shifts', shifts);

    // ── AUTOMATICALLY AGGREGATE INTO MANAGER'S REPORT ──
    try {
      const allCashierShifts = shifts.filter(s => s && s.date === today && (s.roleType === 'cashier' || s.roleType === 'order'));
      let rawReports = LS.get('lc_reports', []);
      let reports = Array.isArray(rawReports) ? rawReports.filter(Boolean) : [];
      let todayReportIndex = reports.findIndex(r => r && r.date === today);

      const aggregatedRevenues = {
        cashRevenue: allCashierShifts.reduce((sum, s) => sum + (s.cashRevenue || 0), 0),
        transferRevenue: allCashierShifts.reduce((sum, s) => sum + (s.transferRevenue || 0), 0),
        cardRevenue: allCashierShifts.reduce((sum, s) => sum + (s.cardRevenue || 0), 0),
        grabRevenue: allCashierShifts.reduce((sum, s) => sum + (s.grabRevenue || 0), 0),
        shopeeRevenue: allCashierShifts.reduce((sum, s) => sum + (s.shopeeRevenue || 0), 0),
      };

      const noteMsg = `[Giao ca Thu Ngân ${selectedCashierStaff}: đếm thực tế ${fmt(counted)}, chênh lệch ${fmt(diff)}]`;

      if (todayReportIndex !== -1) {
        let existingNote = reports[todayReportIndex].note || '';
        if (!existingNote.includes(noteMsg)) {
          existingNote = existingNote.trim() ? existingNote + ' | ' + noteMsg : noteMsg;
        }
        reports[todayReportIndex] = {
          ...reports[todayReportIndex],
          ...aggregatedRevenues,
          note: existingNote
        };
      } else {
        reports.unshift({
          id: 'R-' + Math.random().toString(36).slice(2, 9),
          date: today,
          createdBy: 'Hệ thống POS',
          createdByRole: 'system',
          ...aggregatedRevenues,
          goodsCost: 0,
          fixedExpenses: [
            { id: 'f1', category: 'Lương nhân viên', amount: 450000 },
            { id: 'f2', category: 'Điện nước', amount: 180000 },
            { id: 'f3', category: 'Thuê mặt bằng', amount: 500000 },
          ],
          otherExpenses: [],
          note: `Báo cáo tự động từ POS: ${noteMsg}`,
          status: 'pending',
          submittedAt: new Date().toISOString()
        });
      }
      LS.set('lc_reports', reports);
    } catch (e) {
      console.warn("Failed to auto-update manager reports", e);
    }

    setIsHandoverSuccess(true);
  };

  const handleBackToAdmin = () => {
    setPage('module');
  };

  const handleLogout = () => { LS.set('lc_user', null); window.location.reload(); };

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;
    const today = new Date().toISOString().split('T')[0];
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const queueKey = `lc_pos_queue_counter_${today}`;
    const nextQueue = Number(localStorage.getItem(queueKey) || '0') + 1;

    const orderDetails = {
      orderId, queueNo: nextQueue,
      customerName: 'Khách vãng lai',
      timestamp: new Date().toLocaleString('vi-VN'),
      date: today,
      shift: new Date().getHours() < 14 ? 'morning' : 'afternoon',
      items: [...cart], subtotal, staffDiscount, promoDiscount, discountedSubtotal, tax, total,
      paymentMethod, isStaff, appliedPromo: activePromo ? activePromo.code : null, cashierName: user.name
    };

    setLastOrderDetails(orderDetails);
    setShowSuccessModal(true);
  };

  const resetOrder = () => {
    if (lastOrderDetails) {
      const today = lastOrderDetails.date;
      const queueKey = `lc_pos_queue_counter_${today}`;
      localStorage.setItem(queueKey, lastOrderDetails.queueNo.toString());

      // ── LINKAGE 1: Thu Ngân ──
      let rawShifts = LS.get('lc_shifts', []);
      let shifts = Array.isArray(rawShifts) ? rawShifts.filter(Boolean) : [];
      let activeShift = shifts.find(s => s && s.date === today && s.staffName === user.name);
      const discountedSubtotal = lastOrderDetails.discountedSubtotal;
      const paymentMethod = lastOrderDetails.paymentMethod;
      if (activeShift) {
        if (paymentMethod === 'cash') activeShift.cashRevenue = (activeShift.cashRevenue || 0) + discountedSubtotal;
        else if (paymentMethod === 'transfer') activeShift.transferRevenue = (activeShift.transferRevenue || 0) + discountedSubtotal;
        else if (paymentMethod === 'card') activeShift.cardRevenue = (activeShift.cardRevenue || 0) + discountedSubtotal;
        else if (paymentMethod === 'grab') activeShift.grabRevenue = (activeShift.grabRevenue || 0) + discountedSubtotal;
        else if (paymentMethod === 'shopee') activeShift.shopeeRevenue = (activeShift.shopeeRevenue || 0) + discountedSubtotal;
        activeShift.totalRevenue = (activeShift.totalRevenue || 0) + discountedSubtotal;
        activeShift.orders = (activeShift.orders || 0) + 1;
      } else {
        shifts.unshift({
          id: 'S-' + Math.random().toString(36).slice(2, 9), date: today,
          shift: lastOrderDetails.shift,
          staffName: user.name, roleType: user.role,
          cashRevenue: paymentMethod === 'cash' ? discountedSubtotal : 0,
          transferRevenue: paymentMethod === 'transfer' ? discountedSubtotal : 0,
          cardRevenue: paymentMethod === 'card' ? discountedSubtotal : 0,
          grabRevenue: paymentMethod === 'grab' ? discountedSubtotal : 0,
          shopeeRevenue: paymentMethod === 'shopee' ? discountedSubtotal : 0,
          totalRevenue: discountedSubtotal, orders: 1, staffCount: 1,
          note: 'Tạo tự động từ Quầy Gọi Món POS.', submittedAt: new Date().toISOString()
        });
      }
      LS.set('lc_shifts', shifts);

      // ── LINKAGE 2: Pha Chế ──
      let rawInventory = LS.get('lc_inventory', []);
      let inventory = Array.isArray(rawInventory) ? rawInventory.filter(Boolean) : [];
      let rawInvLogs = LS.get('lc_inventory_logs', []);
      let invLogs = Array.isArray(rawInvLogs) ? rawInvLogs.filter(Boolean) : [];
      const oItems = Array.isArray(lastOrderDetails.items) ? lastOrderDetails.items.filter(Boolean) : [];
      oItems.forEach(cartItem => {
        if (!cartItem) return;
        const recipe = INGREDIENT_RECIPES[cartItem.id];
        if (!recipe) return;
        Object.entries(recipe).forEach(([ingredientName, usageAmt]) => {
          const totalUsed = usageAmt * cartItem.qty;
          const matchedItem = inventory.find(i => i && typeof i.name === 'string' && i.name.toLowerCase().includes(ingredientName.toLowerCase()));
          if (matchedItem) {
            matchedItem.current = Math.max(0, (matchedItem.current || 0) - totalUsed);
            invLogs.unshift({ id: 'L-' + Math.random().toString(36).slice(2, 9), itemId: matchedItem.id, itemName: matchedItem.name, category: 'export', qty: totalUsed, date: today, operator: user.name, note: `Tự động xuất tiêu hao cho đơn hàng ${lastOrderDetails.orderId}` });
          }
        });
      });
      LS.set('lc_inventory', inventory);
      LS.set('lc_inventory_logs', invLogs);

      // ── LINKAGE 3: Quản Lý ──
      let rawReports = LS.get('lc_reports', []);
      let reports = Array.isArray(rawReports) ? rawReports.filter(Boolean) : [];
      let todayReport = reports.find(r => r && r.date === today);
      if (todayReport) {
        if (paymentMethod === 'cash') todayReport.cashRevenue = (todayReport.cashRevenue || 0) + discountedSubtotal;
        else if (paymentMethod === 'transfer') todayReport.transferRevenue = (todayReport.transferRevenue || 0) + discountedSubtotal;
        else if (paymentMethod === 'card') todayReport.cardRevenue = (todayReport.cardRevenue || 0) + discountedSubtotal;
        else if (paymentMethod === 'grab') todayReport.grabRevenue = (todayReport.grabRevenue || 0) + discountedSubtotal;
        else if (paymentMethod === 'shopee') todayReport.shopeeRevenue = (todayReport.shopeeRevenue || 0) + discountedSubtotal;
      } else {
        reports.unshift({
          id: Math.random().toString(36).slice(2, 9), date: today,
          createdBy: user.name, createdByRole: user.role,
          cashRevenue: paymentMethod === 'cash' ? discountedSubtotal : 0,
          transferRevenue: paymentMethod === 'transfer' ? discountedSubtotal : 0,
          cardRevenue: paymentMethod === 'card' ? discountedSubtotal : 0,
          grabRevenue: paymentMethod === 'grab' ? discountedSubtotal : 0,
          shopeeRevenue: paymentMethod === 'shopee' ? discountedSubtotal : 0,
          goodsCost: 0, fixedExpenses: [], otherExpenses: [],
          note: 'Báo cáo doanh thu tích luỹ từ POS.', status: 'approved', submittedAt: new Date().toISOString()
        });
      }
      LS.set('lc_reports', reports);

      const rawExistingOrders = LS.get('lc_billing_orders', []);
      const existingOrders = Array.isArray(rawExistingOrders) ? rawExistingOrders.filter(Boolean) : [];
      existingOrders.unshift(lastOrderDetails);
      LS.set('lc_billing_orders', existingOrders);
    }

    clearCart(); setPaymentMethod('cash'); setShowSuccessModal(false);
    setLastOrderDetails(null); setIsStaff(false); setActivePromo(null);
    setPromoInput(''); setPromoError('');
  };

  const renderItemSVG = (item) => (
    <div style={{ width: '64px', height: '64px', borderRadius: '2px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: `1px solid ${item.color}20`, flexShrink: 0 }}>
      {item.icon}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOP BAR ── */}
      <div style={{ height: '60px', background: '#0f172a', color: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2.5px solid #1e40af', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Porder tablet icon */}
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0A7EA4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="2" width="16" height="20" rx="2" fill="white" opacity="0.95"/>
              <rect x="6" y="4" width="12" height="13" rx="1" fill="#0A7EA4"/>
              <line x1="8" y1="7" x2="16" y2="7" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="8" y1="10" x2="16" y2="10" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="8" y1="13" x2="13" y2="13" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="12" cy="20" r="1.2" fill="#10B981"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '0.02em' }}>
              <span style={{ color: 'white' }}>P</span>
              <span style={{ color: '#0A7EA4' }}>order</span>
            </h1>
            <p style={{ fontSize: '9px', color: '#94a3b8', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Table Ordering Device</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: 'monospace', background: '#1e293b', padding: '4px 10px', borderRadius: '2px', color: '#38bdf8', border: '1px solid #334155' }}>
            ⏰ {time}
          </div>
          <button onClick={toggleFullscreen} style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', padding: '4px 10px', borderRadius: '2px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '28px' }} title={isFullscreen ? 'Thoát toàn màn hình' : 'Bật toàn màn hình'}>
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreen ? 'Thu Nhỏ' : 'Toàn Màn'}</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1.5px solid #334155', paddingLeft: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9' }}>{user.name}</div>
              <div style={{ fontSize: '9.5px', color: '#94a3b8', textTransform: 'capitalize', fontWeight: 600 }}>{CAT_LABELS[user.role] || user.role}</div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', color: '#38bdf8', border: '1.5px solid #475569' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', borderLeft: '1.5px solid #334155', paddingLeft: '16px' }}>
            {user.role === 'manager' && (
              <button onClick={() => setShowLoginHistoryModal(true)} style={{ background: '#1e3a8a', color: '#f8fafc', border: '1px solid #3b82f6', padding: '6px 14px', borderRadius: '2px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={13} /> Lịch Sử Đăng Nhập
              </button>
            )}
            <button onClick={handleBackToAdmin} style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #475569', padding: '6px 14px', borderRadius: '2px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={13} /> Quay Lại
            </button>
            <button onClick={() => setShowHandoverModal(true)} style={{ background: '#be123c', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '2px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={13} /> Giao Ca
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div style={{ height: 'calc(100vh - 60px)', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '20px 24px 40px', overflow: 'hidden' }}>

        {/* ── LEFT: PRODUCT LISTING ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>

          <div style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '2px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            {/* Row 1: Categories */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {Object.entries(CAT_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => setActiveCat(key)} style={{ padding: '0 12px', height: '36px', borderRadius: '2px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flex: '1 1 auto', textAlign: 'center', background: activeCat === key ? '#1e40af' : '#fafafa', color: activeCat === key ? 'white' : '#4b5563', border: activeCat === key ? '1.5px solid #1e40af' : '1.5px solid #cbd5e1', transition: 'all 0.1s' }}>
                  {label}
                </button>
              ))}
            </div>
            {/* Row 2: Search */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                className="input-field"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm đồ uống, nước mía, cà phê, trà sữa, topping, tạp hóa..."
                style={{ paddingLeft: '36px', borderRadius: '2px', fontSize: '13px', height: '40px', border: '1.5px solid #cbd5e1', width: '100%' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            </div>
          </div>

          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 8px 8px' }}>
            {filteredItems.length === 0 ? (
              <div style={{ background: 'white', border: '1.5px dashed #cbd5e1', borderRadius: '2px', padding: '80px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <HelpCircle size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Không tìm thấy sản phẩm phù hợp</div>
                <div style={{ fontSize: '11.5px', marginTop: '4px' }}>Vui lòng thay đổi từ khoá hoặc chọn bộ lọc nhóm sản phẩm khác.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {filteredItems.map(item => {
                  const cartItem = cart.find(i => i.id === item.id);
                  const qty = cartItem ? cartItem.qty : 0;
                  return (
                    <div
                      key={item.id}
                      onClick={() => addToCart(item)}
                      style={{ background: 'white', border: qty > 0 ? '2px solid #1e40af' : '1.5px solid #e2e8f0', borderRadius: '6px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', transition: 'all 0.12s ease', boxShadow: qty > 0 ? '0 0 0 3px rgba(30,64,175,0.08)' : '0 1px 3px rgba(0,0,0,0.04)', position: 'relative', userSelect: 'none' }}
                    >
                      {qty > 0 && (
                        <div style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', background: '#1e40af', color: 'white', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, boxShadow: '0 2px 6px rgba(30,64,175,0.2)' }}>
                          {qty}
                        </div>
                      )}

                      {/* Icon */}
                      <div style={{ width: '52px', height: '52px', borderRadius: '4px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                        {item.icon}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', lineHeight: 1.3, marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af' }} className="mono">{fmt(item.price)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: RECEIPT & CHECKOUT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
          <div className="custom-scrollbar" style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '2px', padding: '18px', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f0f0e', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingCart size={14} style={{ color: '#1e40af' }} /> ĐƠN HÀNG CHI TIẾT
              </h3>
              {cart.length > 0 && (
                <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#be123c', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Trash2 size={11} /> Xoá Hết
                </button>
              )}
            </div>

            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', marginBottom: '14px', minHeight: '100px' }}>
              {cart.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 10px', color: '#9ca3af', textAlign: 'center' }}>
                  <ShoppingCart size={28} style={{ opacity: 0.3, marginBottom: '10px' }} />
                  <span style={{ fontSize: '11.5px', fontStyle: 'italic' }}>Chưa chọn đồ uống, đồ ăn.</span>
                </div>
              ) : (
                <div style={{ width: '100%', overflowX: 'hidden' }}>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 72px 24px', gap: '4px', padding: '4px 6px 6px', borderBottom: '2px solid #e5e7eb', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 0 }}>Tên món</span>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.05em' }}>SL</span>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right', letterSpacing: '0.05em' }}>Thành tiền</span>
                    <span></span>
                  </div>
                  {/* Table rows */}
                  {cart.map((item, idx) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 72px 24px', gap: '4px', alignItems: 'center', padding: '6px 6px', borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafbfc' }}>
                      {/* Name */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{fmt(item.price)}{isStaff && item.type === 'drink' && <span style={{ marginLeft: '4px', color: '#047857', fontWeight: 600 }}>-5%</span>}</div>
                      </div>
                      {/* Qty controls */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <button onClick={() => decreaseQty(item.id)} style={{ width: '20px', height: '20px', borderRadius: '3px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={10} /></button>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af', minWidth: '22px', textAlign: 'center' }} className="mono">{item.qty}</span>
                        <button onClick={() => addToCart(item)} style={{ width: '20px', height: '20px', borderRadius: '3px', border: '1px solid #1e40af', background: '#1e40af', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={10} /></button>
                      </div>
                      {/* Total */}
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e40af', textAlign: 'right' }} className="mono">{fmt(item.price * item.qty)}</div>
                      {/* Delete */}
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#be123c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}><Trash2 size={11} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Staff Toggle */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '2px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={14} style={{ color: '#047857' }} />
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Nhân Viên Nội Bộ</span>
                  <div style={{ fontSize: '9.5px', color: '#6b7280' }}>Được giảm 5% cho tất cả đồ uống</div>
                </div>
              </div>
              <input type="checkbox" checked={isStaff} onChange={e => setIsStaff(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#1e40af', cursor: 'pointer' }} />
            </div>

            {/* Promo Code */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '9.5px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>MÃ GIẢM GIÁ / ƯU ĐÃI</div>
              {activePromo ? (
                <div className="fade" style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '2px', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#166534', fontWeight: 700 }}>
                    <Tag size={12} /> <span>Mã {activePromo.code} ({activePromo.label})</span>
                  </div>
                  <button onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: '#be123c', fontWeight: 800, fontSize: '14px', cursor: 'pointer', padding: '0 4px' }}>×</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input className="input-field" value={promoInput} onChange={e => { setPromoInput(e.target.value); setPromoError(''); }} placeholder="Nhập mã LEES50, HEHE10..." style={{ height: '34px', fontSize: '11.5px', borderRadius: '2px', flex: 1, textTransform: 'uppercase' }} />
                  <button onClick={handleApplyPromo} style={{ padding: '0 12px', height: '34px', borderRadius: '2px', background: '#0f0f0e', color: 'white', border: 'none', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}>Áp Dụng</button>
                </div>
              )}
              {promoError && <p style={{ color: '#be123c', fontSize: '10.5px', marginTop: '4px', fontWeight: 500, margin: '4px 0 0' }}>{promoError}</p>}
            </div>

            {/* Price Summary */}
            <div style={{ background: '#f8fafc', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '2px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#4b5563', marginBottom: '6px' }}>
                <span>Tạm tính (chưa thuế):</span><span className="mono" style={{ fontWeight: 600 }}>{fmt(subtotal)}</span>
              </div>
              {isStaff && staffDiscount > 0 && (
                <div className="fade" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#047857', marginBottom: '6px', fontWeight: 600 }}>
                  <span>Nhân viên giảm 5% đồ uống:</span><span className="mono">-{fmt(staffDiscount)}</span>
                </div>
              )}
              {activePromo && promoDiscount > 0 && (
                <div className="fade" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#047857', marginBottom: '6px', fontWeight: 600 }}>
                  <span>Mã giảm giá ({activePromo.code}):</span><span className="mono">-{fmt(promoDiscount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#4b5563', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px dashed #cbd5e1' }}>
                <span>Thuế GTGT (10%):</span><span className="mono" style={{ fontWeight: 600 }}>{fmt(tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#0f0f0e', fontWeight: 800 }}>
                <span>TỔNG THANH TOÁN:</span><span className="mono" style={{ fontSize: '14px', color: '#1e40af' }}>{fmt(total)}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '9.5px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>PHƯƠNG THỨC THANH TOÁN</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {[
                  { key: 'cash', label: 'T.Mặt', icon: <Banknote size={13} /> },
                  { key: 'transfer', label: 'C.Khoản', icon: <Smartphone size={13} /> },
                  { key: 'card', label: 'Thẻ', icon: <CreditCard size={13} /> },
                  { key: 'grab', label: 'Grab', icon: <Wallet size={13} /> },
                  { key: 'shopee', label: 'Shopee', icon: <Wallet size={13} /> },
                ].map(opt => (
                  <button key={opt.key} onClick={() => setPaymentMethod(opt.key)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '48px', borderRadius: '2px', cursor: 'pointer', background: paymentMethod === opt.key ? '#eff6ff' : 'white', color: paymentMethod === opt.key ? '#1e40af' : '#4b5563', border: paymentMethod === opt.key ? '1.5px solid #1e40af' : '1.5px solid #cbd5e1', fontSize: '9.5px', fontWeight: 700, transition: 'all 0.1s' }}>
                    {opt.icon}<span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'transfer' && (
              <div className="fade" style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '2px', padding: '10px 12px', fontSize: '11.5px', color: '#0369a1', lineHeight: 1.4, marginBottom: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img 
                  src={`https://img.vietqr.io/image/TCB-1903456789101-qr_only.png?amount=${total}&addInfo=POCS%20LEE%20THANH%20TOAN&accountName=LEES%20COFFEE%20COMPANY%20LTD`}
                  alt="VietQR Techcombank"
                  style={{ width: '80px', height: '80px', objectFit: 'contain', background: 'white', border: '1px solid #bae6fd', padding: '3px', borderRadius: '2px', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 800 }}>NGÂN HÀNG: TECHCOMBANK</div>
                  <div>STK: <strong>1903 4567 891 01</strong></div>
                  <div style={{ fontSize: '10px', opacity: 0.9 }}>CTK: LEES COFFEE COMPANY LTD</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', marginTop: '3px' }}>
                    Số tiền: <span className="mono" style={{ fontSize: '12px', fontWeight: 800 }}>{fmt(total)}</span>
                  </div>
                </div>
              </div>
            )}

            {(paymentMethod === 'grab' || paymentMethod === 'shopee') && (
              <div className="fade" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '2px', padding: '8px 10px', fontSize: '10.5px', color: '#b45309', marginBottom: '14px', fontWeight: 500, lineHeight: 1.3 }}>
                💡 Đơn hàng qua ứng dụng bên thứ 3 sẽ được đồng bộ doanh thu tự động dựa trên mã đơn đối tác.
              </div>
            )}

            <button onClick={handleConfirmOrder} disabled={cart.length === 0} style={{ width: '100%', height: '42px', borderRadius: '2px', border: 'none', background: cart.length === 0 ? '#cbd5e1' : '#1e40af', color: 'white', fontSize: '13px', fontWeight: 800, cursor: cart.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: 'auto', boxShadow: cart.length > 0 ? '0 4px 10px rgba(30,64,175,0.2)' : 'none', transition: 'background 0.15s ease' }}>
              <CheckCircle2 size={15} /> XÁC NHẬN ĐƠN HÀNG <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ── SUCCESS MODAL ── */}
        {showSuccessModal && lastOrderDetails && (
          <div className="custom-scrollbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', padding: '24px 16px', zIndex: 1000, overflowY: 'auto', maxHeight: '100vh' }}>
            <div className="fade" style={{ margin: 'auto', background: 'white', padding: '24px', borderRadius: '2px', width: '100%', maxWidth: lastOrderDetails.paymentMethod === 'transfer' ? '700px' : '440px', border: '1.5px solid #0f0f0e', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <CheckCircle2 size={28} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#065f46', margin: 0, textTransform: 'uppercase' }}>ĐƠN HÀNG ĐÃ ĐƯỢC GHI NHẬN</h3>
                <p style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '4px' }}>Dữ liệu đã liên kết đồng bộ sang hệ thống Thu Ngân, Pha Chế và Quản Lý thành công!</p>
              </div>

              <div style={{
                display: lastOrderDetails.paymentMethod === 'transfer' ? 'grid' : 'block',
                gridTemplateColumns: lastOrderDetails.paymentMethod === 'transfer' ? '1.2fr 1fr' : 'none',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div id="pos-print-area" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '2px', padding: '14px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.4 }}>
                {/* Queue Number */}
                <div style={{ textAlign: 'center', border: '1.5px solid #1e40af', background: '#eff6ff', padding: '10px 8px', borderRadius: '2px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>SỐ THỨ TỰ LẤY ĐỒ</span>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e40af', fontFamily: 'monospace', margin: '2px 0' }}>#{String(lastOrderDetails.queueNo || 1).padStart(2, '0')}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span>Mã hoá đơn:</span><strong>{lastOrderDetails.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span>Ngày giờ lập:</span><strong>{lastOrderDetails.timestamp}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span>Phương thức:</span>
                  <strong style={{ textTransform: 'uppercase' }}>
                    {lastOrderDetails.paymentMethod === 'cash' ? 'Tiền mặt' : lastOrderDetails.paymentMethod === 'transfer' ? 'Chuyển khoản' : lastOrderDetails.paymentMethod === 'card' ? 'Thẻ ATM' : lastOrderDetails.paymentMethod}
                  </strong>
                </div>

                <div style={{ fontSize: '10.5px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px', marginBottom: '6px' }}>Danh sách sản phẩm:</div>
                <div className="custom-scrollbar" style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '8px' }}>
                  {lastOrderDetails.items.map(item => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 76px', gap: '4px', alignItems: 'flex-start', fontSize: '11.5px', padding: '3px 0', borderBottom: '1px dashed #f8fafc' }}>
                      <span style={{ minWidth: 0, wordBreak: 'break-word', color: '#334155' }}>
                        {item.name}
                        {isStaff && item.type === 'drink' && <span style={{ color: '#047857', fontSize: '9.5px', marginLeft: '4px' }}>(Giảm 5%)</span>}
                      </span>
                      <span style={{ fontWeight: 700, color: '#1e40af', textAlign: 'center' }}>
                        ×{item.qty}
                      </span>
                      <span className="mono" style={{ textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                        {fmt(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                {lastOrderDetails.staffDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', color: '#047857' }}>
                    <span>Giảm giá nhân viên:</span><strong>-{fmt(lastOrderDetails.staffDiscount)}</strong>
                  </div>
                )}
                {lastOrderDetails.promoDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', color: '#047857' }}>
                    <span>Giảm giá mã ({lastOrderDetails.appliedPromo}):</span><strong>-{fmt(lastOrderDetails.promoDiscount)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span>Thuế GTGT (10%):</span><strong>{fmt(lastOrderDetails.tax)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#0f0f0e', fontWeight: 800, paddingTop: '4px' }}>
                  <span>TỔNG THANH TOÁN:</span><span className="mono" style={{ color: '#1e40af' }}>{fmt(lastOrderDetails.total)}</span>
                </div>
              </div>

              {/* Column 2: VietQR Code */}
              {lastOrderDetails.paymentMethod === 'transfer' && (
                <div className="fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #bae6fd', borderRadius: '2px', padding: '16px', background: '#f0f9ff', textAlign: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>QUÉT MÃ THANH TOÁN</div>
                  <img 
                    src={`https://img.vietqr.io/image/TCB-1903456789101-compact2.png?amount=${lastOrderDetails.total}&addInfo=${lastOrderDetails.orderId}&accountName=LEES%20COFFEE%20COMPANY%20LTD`}
                    alt="VietQR Techcombank"
                    style={{ width: '100%', maxWidth: '220px', height: 'auto', objectFit: 'contain', background: 'white', border: '1px solid #bae6fd', padding: '6px', borderRadius: '2px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}
                  />
                  <div style={{ fontSize: '11.5px', color: '#0369a1', lineHeight: 1.4 }}>
                    <div style={{ fontWeight: 800 }}>TECHCOMBANK</div>
                    <div>STK: <strong>1903 4567 891 01</strong></div>
                    <div style={{ fontSize: '9.5px', opacity: 0.9 }}>CTK: LEES COFFEE COMPANY LTD</div>
                    <div style={{ marginTop: '4px', fontSize: '14px', fontWeight: 900, color: '#1e40af' }} className="mono">
                      {fmt(lastOrderDetails.total)}
                    </div>
                  </div>
                </div>
              )}
            </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={resetOrder} className="btn btn-gray" style={{ flex: 1, borderRadius: '2px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <RefreshCw size={13} /> Đơn Mới
                </button>
                <button onClick={() => window.print()} className="btn btn-green" style={{ flex: 1.5, borderRadius: '2px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Printer size={13} /> In Hoá Đơn
                </button>
                <button onClick={() => setShowSuccessModal(false)} className="btn btn-blue" style={{ flex: 2, borderRadius: '2px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Check size={13} /> Đóng thông báo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LOGIN HISTORY MODAL ── */}
        {showLoginHistoryModal && (
          <div className="custom-scrollbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', padding: '24px 16px', zIndex: 1000, overflowY: 'auto', maxHeight: '100vh' }}>
            <div className="fade" style={{ margin: 'auto', background: 'white', padding: '24px', borderRadius: '2px', width: '100%', maxWidth: '600px', border: '1.5px solid #0f0f0e', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#1e40af', margin: 0, textTransform: 'uppercase' }}>LỊCH SỬ ĐĂNG NHẬP NHÂN VIÊN</h3>
                <button onClick={() => setShowLoginHistoryModal(false)} style={{ background: 'none', border: 'none', color: '#be123c', fontWeight: 800, fontSize: '20px', cursor: 'pointer', padding: '0 4px' }}>×</button>
              </div>

              <div className="custom-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
                {loginHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>
                    Chưa ghi nhận lịch sử đăng nhập nào.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '10px 8px', fontWeight: 800, color: '#475569' }}>Nhân viên</th>
                        <th style={{ padding: '10px 8px', fontWeight: 800, color: '#475569' }}>Vị trí / Vai trò</th>
                        <th style={{ padding: '10px 8px', fontWeight: 800, color: '#475569' }}>Thời gian máy chủ (Server Time)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginHistory.map((item) => {
                        const roleLabels = { manager: 'Quản Lý Quán', cashier: 'Thu Ngân', barista: 'Pha Chế', order: 'Order / Gọi món', accountant: 'Kế Toán' };
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 700, color: '#1e293b' }}>{item.username}</td>
                            <td style={{ padding: '10px 8px' }}>
                              <span style={{
                                background: item.role === 'manager' ? '#fef3c7' : '#eff6ff',
                                color: item.role === 'manager' ? '#b45309' : '#1e40af',
                                padding: '2px 6px',
                                borderRadius: '2px',
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}>
                                {roleLabels[item.role] || item.role}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px', fontWeight: 600, color: '#475569' }} className="mono">{item.loginTime}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowLoginHistoryModal(false)} className="btn btn-blue" style={{ borderRadius: '2px', height: '36px', padding: '0 20px', fontSize: '12px', fontWeight: 700 }}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── HANDOVER MODAL ── */}
        {showHandoverModal && (
          <div className="custom-scrollbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 16px', zIndex: 1000, overflow: 'hidden' }}>
            <div className="fade" style={{ background: 'white', borderRadius: '4px', width: '95vw', maxWidth: '1200px', height: '90vh', display: 'flex', flexDirection: 'column', border: '1.5px solid #0f0f0e', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)', overflow: 'hidden' }}>
              
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', padding: '16px 24px', flexShrink: 0, background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#be123c', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    BÀN GIAO CA & KẾT CA TRỰC
                  </h3>
                  
                  {/* Tab Selector Buttons */}
                  {!isHandoverSuccess && (
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}>
                      <button 
                        onClick={() => setHandoverTab('cashier')}
                        style={{
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          borderRadius: '2px',
                          background: handoverTab === 'cashier' ? '#be123c' : 'white',
                          color: handoverTab === 'cashier' ? 'white' : '#475569',
                          border: handoverTab === 'cashier' ? '1.5px solid #be123c' : '1.5px solid #cbd5e1',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Kết ca Thu Ngân
                      </button>
                      <button 
                        onClick={() => setHandoverTab('barista')}
                        style={{
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          borderRadius: '2px',
                          background: handoverTab === 'barista' ? '#be123c' : 'white',
                          color: handoverTab === 'barista' ? 'white' : '#475569',
                          border: handoverTab === 'barista' ? '1.5px solid #be123c' : '1.5px solid #cbd5e1',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Kết ca Pha Chế
                      </button>
                      <button 
                        onClick={() => setHandoverTab('history')}
                        style={{
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          borderRadius: '2px',
                          background: handoverTab === 'history' ? '#be123c' : 'white',
                          color: handoverTab === 'history' ? 'white' : '#475569',
                          border: handoverTab === 'history' ? '1.5px solid #be123c' : '1.5px solid #cbd5e1',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Lịch Sử Kết Ca
                      </button>
                    </div>
                  )}
                </div>
                
                <button onClick={() => { setShowHandoverModal(false); setIsHandoverSuccess(false); }} style={{ background: 'none', border: 'none', color: '#be123c', fontWeight: 800, fontSize: '22px', cursor: 'pointer', padding: '0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>

              {/* Modal Body */}
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {isHandoverSuccess ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '40px' }}>
                    <div className="fade" style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#d1fae5', border: '2px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Check size={32} style={{ color: '#059669' }} />
                      </div>
                      
                      <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#111827', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        GIAO CA THÀNH CÔNG!
                      </h3>
                      
                      <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.5, margin: '0 0 30px 0' }}>
                        Báo cáo bàn giao ca làm việc của bạn đã được ghi nhận trên hệ thống nội bộ thành công. Vui lòng bàn giao ca trực và đăng xuất để nhân viên ca tiếp theo đăng nhập vào thiết bị.
                      </p>
                      
                      <button 
                        onClick={handleLogout} 
                        className="btn btn-red" 
                        style={{ width: '100%', height: '48px', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '4px', border: 'none', background: '#be123c', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(190,18,60,0.25)' }}
                      >
                        <LogOut size={16} /> ĐĂNG XUẤT TÀI KHOẢN
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ── 1. CASHIER HANDOVER VIEW ── */}
                    {handoverTab === 'cashier' && (
                      <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', background: '#ffffff' }}>
                    
                    {/* Left Column: System revenues & Order list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                          DOANH THU HỆ THỐNG GHI NHẬN (CA HÔM NAY)
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '16px', border: '1.5px solid #e2e8f0', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#475569', fontWeight: 600 }}>Tiền mặt:</span>
                            <strong className="mono" style={{ fontSize: '14px', color: '#1e293b' }}>{fmt(activeShift.cashRevenue)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#475569', fontWeight: 600 }}>Chuyển khoản:</span>
                            <strong className="mono" style={{ fontSize: '14px', color: '#1e293b' }}>{fmt(activeShift.transferRevenue)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#475569', fontWeight: 600 }}>Thẻ ATM:</span>
                            <strong className="mono" style={{ fontSize: '14px', color: '#1e293b' }}>{fmt(activeShift.cardRevenue)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#475569', fontWeight: 600 }}>Grab Food:</span>
                            <strong className="mono" style={{ fontSize: '14px', color: '#1e293b' }}>{fmt(activeShift.grabRevenue)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: '#475569', fontWeight: 600 }}>Shopee Food:</span>
                            <strong className="mono" style={{ fontSize: '14px', color: '#1e293b' }}>{fmt(activeShift.shopeeRevenue)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderTop: '2px dashed #cbd5e1', paddingTop: '10px', marginTop: '6px', fontWeight: 800 }}>
                            <span style={{ color: '#0f0f0e' }}>TỔNG DOANH THU HỆ THỐNG:</span>
                            <span className="mono" style={{ color: '#1e40af', fontSize: '16px' }}>{fmt(activeShift.totalRevenue)}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '200px' }}>
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                          DANH SÁCH ĐƠN HÀNG TRONG CA ({shiftOrders.length})
                        </div>
                        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', border: '1.5px solid #e2e8f0', borderRadius: '4px' }}>
                          {shiftOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>
                              Chưa có giao dịch phát sinh trong ca trực.
                            </div>
                          ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1, boxShadow: '0 1px 0 #e2e8f0' }}>
                                <tr style={{ background: '#f8fafc' }}>
                                  <th style={{ padding: '8px 12px', fontWeight: 800, color: '#475569' }}>Mã đơn</th>
                                  <th style={{ padding: '8px 12px', fontWeight: 800, color: '#475569' }}>PTTT</th>
                                  <th style={{ padding: '8px 12px', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Thành tiền</th>
                                </tr>
                              </thead>
                              <tbody>
                                {shiftOrders.map(o => (
                                  <tr key={o.orderId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '8px 12px', fontWeight: 600 }} className="mono">{o.orderId}</td>
                                    <td style={{ padding: '8px 12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                                      {o.paymentMethod === 'cash' ? 'T.Mặt' : o.paymentMethod === 'transfer' ? 'C.Khoản' : o.paymentMethod === 'card' ? 'Thẻ' : o.paymentMethod}
                                    </td>
                                    <td style={{ padding: '8px 12px', fontWeight: 700, textAlign: 'right' }} className="mono">{fmt(o.total)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Counting & note */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '1.5px solid #f1f5f9', paddingLeft: '32px' }}>
                      <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '8px' }}>
                          NHÂN VIÊN KẾT CA
                        </label>
                        <div 
                          onClick={() => setShowCashierStaffDropdown(!showCashierStaffDropdown)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'white',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            height: '44px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#1e293b'
                          }}
                        >
                          <span>{selectedCashierStaff || 'Chọn nhân viên...'}</span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>▼</span>
                        </div>

                        {showCashierStaffDropdown && (
                          <>
                            <div 
                              onClick={() => setShowCashierStaffDropdown(false)} 
                              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'transparent' }} 
                            />
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              background: 'white',
                              border: '1.5px solid #cbd5e1',
                              borderRadius: '4px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                              zIndex: 50,
                              marginTop: '4px',
                              maxHeight: '180px',
                              overflowY: 'auto'
                            }} className="custom-scrollbar">
                              {STAFF_LIST.map(name => (
                                <div
                                  key={name}
                                  onClick={() => {
                                    setSelectedCashierStaff(name);
                                    setShowCashierStaffDropdown(false);
                                  }}
                                  style={{
                                    padding: '10px 12px',
                                    fontSize: '13.5px',
                                    fontWeight: selectedCashierStaff === name ? '700' : '500',
                                    color: selectedCashierStaff === name ? 'white' : '#1e293b',
                                    background: selectedCashierStaff === name ? '#be123c' : 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s ease',
                                  }}
                                  onMouseEnter={e => {
                                    if (selectedCashierStaff !== name) {
                                      e.target.style.background = '#f1f5f9';
                                    }
                                  }}
                                  onMouseLeave={e => {
                                    if (selectedCashierStaff !== name) {
                                      e.target.style.background = 'white';
                                    }
                                  }}
                                >
                                  {name}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '8px' }}>
                          TIỀN MẶT THỰC TẾ ĐẾM ĐƯỢC (KÉT TIỀN)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            className="input-field mono"
                            value={actualCash}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, '');
                              const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                              setActualCash(formatted);
                            }}
                            placeholder="Nhập số tiền mặt đếm thực tế..."
                            style={{ paddingRight: '30px', fontSize: '15px', fontWeight: 800, height: '44px', border: '1.5px solid #cbd5e1', borderRadius: '4px', width: '100%', textIndent: '10px' }}
                          />
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#64748b', fontSize: '14px' }}>₫</span>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '8px' }}>
                          GHI CHÚ BÀN GIAO CA TRỰC
                        </label>
                        <textarea
                          className="input-field"
                          value={handoverNote}
                          onChange={e => setHandoverNote(e.target.value)}
                          placeholder="Nhập lý do chênh lệch hoặc thông tin bàn giao két..."
                          rows={4}
                          style={{ fontSize: '12.5px', borderRadius: '4px', border: '1.5px solid #cbd5e1', width: '100%', resize: 'none', padding: '12px' }}
                        />
                      </div>

                      {actualCash.trim() !== '' && (
                        <div className="fade" style={{
                          background: (() => {
                            const diff = (parseFloat(actualCash.replace(/\./g, '')) || 0) - (activeShift.cashRevenue || 0);
                            if (diff === 0) return '#f0fdf4';
                            if (diff > 0) return '#fffbeb';
                            return '#fff1f2';
                          })(),
                          border: (() => {
                            const diff = (parseFloat(actualCash.replace(/\./g, '')) || 0) - (activeShift.cashRevenue || 0);
                            if (diff === 0) return '1.5px solid #bbf7d0';
                            if (diff > 0) return '1.5px solid #fde68a';
                            return '1.5px solid #fca5a5';
                          })(),
                          padding: '16px',
                          borderRadius: '4px',
                          textAlign: 'center'
                        }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>KẾT QUẢ ĐỐI CHIẾU DÒNG TIỀN MẶT</span>
                          
                          {(() => {
                            const diff = (parseFloat(actualCash.replace(/\./g, '')) || 0) - (activeShift.cashRevenue || 0);
                            if (diff === 0) {
                              return <div style={{ color: '#166534', fontWeight: 900, fontSize: '15px', marginTop: '6px' }}>Khớp két dòng tiền (0 ₫)</div>;
                            }
                            if (diff > 0) {
                              return <div style={{ color: '#b45309', fontWeight: 900, fontSize: '15px', marginTop: '6px' }}>Thừa két: +{fmt(diff)}</div>;
                            }
                            return <div style={{ color: '#be123c', fontWeight: 900, fontSize: '15px', marginTop: '6px' }}>Thiếu hụt két: {fmt(diff)}</div>;
                          })()}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'auto', borderTop: '1.5px solid #f1f5f9', paddingTop: '16px' }}>
                        <button onClick={() => setShowHandoverModal(false)} className="btn btn-gray" style={{ borderRadius: '2px', height: '40px', padding: '0 24px', fontSize: '13px', fontWeight: 700 }}>
                          Huỷ bỏ
                        </button>
                        <button
                          onClick={handleConfirmHandover}
                          disabled={actualCash.trim() === ''}
                          className="btn btn-red"
                          style={{
                            borderRadius: '2px',
                            height: '40px',
                            padding: '0 28px',
                            fontSize: '13px',
                            fontWeight: 800,
                            background: actualCash.trim() === '' ? '#cbd5e1' : '#be123c',
                            color: 'white',
                            border: 'none',
                            cursor: actualCash.trim() === '' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Xác nhận bàn giao & Giao ca
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 2. BARISTA HANDOVER VIEW ── */}
                {handoverTab === 'barista' && (
                  <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f8fafc' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
                      
                      {/* Form fields */}
                      <div style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '4px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                          THÔNG TIN CA BÀN GIAO (PHA CHẾ)
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#4b5563' }}>Ngày giao nhận ca</label>
                          <input type="date" className="input-field" value={baristaDate} onChange={e => setBaristaDate(e.target.value)} style={{ borderRadius: '2px', border: '1px solid #cbd5e1', padding: '6px 10px' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center', position: 'relative' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#4b5563' }}>Nhân viên kết ca</label>
                          <div style={{ position: 'relative', width: '100%' }}>
                            <div 
                              onClick={() => setShowBaristaStaffDropdown(!showBaristaStaffDropdown)}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'white',
                                border: '1.5px solid #cbd5e1',
                                borderRadius: '4px',
                                padding: '8px 12px',
                                height: '38px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#1e293b'
                              }}
                            >
                              <span>{selectedBaristaStaff || 'Chọn nhân viên...'}</span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>▼</span>
                            </div>

                            {showBaristaStaffDropdown && (
                              <>
                                <div 
                                  onClick={() => setShowBaristaStaffDropdown(false)} 
                                  style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'transparent' }} 
                                />
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  right: 0,
                                  background: 'white',
                                  border: '1.5px solid #cbd5e1',
                                  borderRadius: '4px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                  zIndex: 50,
                                  marginTop: '4px',
                                  maxHeight: '180px',
                                  overflowY: 'auto'
                                }} className="custom-scrollbar">
                                  {STAFF_LIST.map(name => (
                                    <div
                                      key={name}
                                      onClick={() => {
                                        setSelectedBaristaStaff(name);
                                        setShowBaristaStaffDropdown(false);
                                      }}
                                      style={{
                                        padding: '8px 12px',
                                        fontSize: '12.5px',
                                        fontWeight: selectedBaristaStaff === name ? '700' : '500',
                                        color: selectedBaristaStaff === name ? 'white' : '#1e293b',
                                        background: selectedBaristaStaff === name ? '#be123c' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.1s ease',
                                      }}
                                      onMouseEnter={e => {
                                        if (selectedBaristaStaff !== name) {
                                          e.target.style.background = '#f1f5f9';
                                        }
                                      }}
                                      onMouseLeave={e => {
                                        if (selectedBaristaStaff !== name) {
                                          e.target.style.background = 'white';
                                        }
                                      }}
                                    >
                                      {name}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'start' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#4b5563', paddingTop: '6px' }}>Phiên trực ca</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {[
                              { key: 'morning', label: 'Ca Sáng (06:00 - 14:00)' },
                              { key: 'afternoon', label: 'Ca Chiều (14:00 - 22:00)' }
                            ].map(opt => (
                              <div 
                                key={opt.key} 
                                onClick={() => setBaristaShift(opt.key)} 
                                style={{ 
                                  border: `1.5px solid ${baristaShift === opt.key ? '#1e40af' : '#e5e7eb'}`, 
                                  borderRadius: '2px', 
                                  padding: '8px 12px', 
                                  cursor: 'pointer', 
                                  background: baristaShift === opt.key ? '#eff6ff' : '#ffffff', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  transition: 'all 0.1s ease' 
                                }}
                              >
                                <span style={{ fontSize: '12.5px', fontWeight: 700, color: baristaShift === opt.key ? '#1e40af' : '#4b5563' }}>{opt.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ borderTop: '1.5px solid #e2e8f0', paddingTop: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>BÁO CÁO TỒN KHO KIỂM KÊ CUỐI CA</span>
                            <button 
                              className="btn btn-gray" 
                              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '4px' }} 
                              onClick={addBaristaIng}
                            >
                              + Thêm Nguyên Vật Liệu
                            </button>
                          </div>

                          {/* Headers row */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 60px 60px 60px 60px 24px', gap: '6px', padding: '8px', fontSize: '9px', fontWeight: 800, color: '#9ca3af', borderBottom: '2px solid #e5e7eb', marginBottom: '6px', textAlign: 'right', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            <span style={{ textAlign: 'left' }}>Tên Nguyên Liệu</span>
                            <span>Đơn Vị</span>
                            <span>Đầu Ca</span>
                            <span>Nhập Ca</span>
                            <span style={{ color: '#be123c' }}>Hao Phí</span>
                            <span>Cuối Ca</span>
                            <span/>
                          </div>

                          {/* Ingredients list */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {baristaIngredients.map(ing => (
                              <div key={ing.id} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 60px 60px 60px 60px 24px', gap: '6px', alignItems: 'center', padding: '4px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                                <input 
                                  value={ing.name} 
                                  onChange={e => updBaristaIng(ing.id, 'name', e.target.value)} 
                                  placeholder="Tên NVL..." 
                                  style={{ width: '100%', border: 'none', borderBottom: '1.5px solid transparent', padding: '4px 0', fontSize: '12px', background: 'transparent' }} 
                                  onFocus={e => e.target.style.borderBottom = '1.5px solid #1e40af'} 
                                  onBlur={e => e.target.style.borderBottom = '1.5px solid transparent'} 
                                />
                                
                                <select 
                                  value={ing.unit} 
                                  onChange={e => updBaristaIng(ing.id, 'unit', e.target.value)} 
                                  style={{ width: '100%', border: 'none', borderBottom: '1.5px solid transparent', fontSize: '11.5px', background: 'transparent', color: '#4b5563', cursor: 'pointer', fontWeight: 600 }}
                                >
                                  {['g', 'kg', 'ml', 'l', 'cái', 'hộp', 'túi'].map(u => <option key={u} value={u}>{u}</option>)}
                                </select>

                                <input 
                                  type="number" 
                                  className="mono" 
                                  value={ing.start} 
                                  onChange={e => updBaristaIng(ing.id, 'start', e.target.value)} 
                                  style={{ width: '100%', border: 'none', borderBottom: '1.5px solid transparent', textAlign: 'right', padding: '4px 0', fontSize: '11.5px', background: 'transparent', fontWeight: 500 }} 
                                  placeholder="0" 
                                  onFocus={e => e.target.style.borderBottom = '1.5px solid #1e40af'} 
                                  onBlur={e => e.target.style.borderBottom = '1.5px solid transparent'} 
                                />
                                
                                <input 
                                  type="number" 
                                  className="mono" 
                                  value={ing.in} 
                                  onChange={e => updBaristaIng(ing.id, 'in', e.target.value)} 
                                  style={{ width: '100%', border: 'none', borderBottom: '1.5px solid transparent', textAlign: 'right', padding: '4px 0', fontSize: '11.5px', background: 'transparent', color: '#15803d', fontWeight: 500 }} 
                                  placeholder="0" 
                                  onFocus={e => e.target.style.borderBottom = '1.5px solid #15803d'} 
                                  onBlur={e => e.target.style.borderBottom = '1.5px solid transparent'} 
                                />
                                
                                <input 
                                  type="number" 
                                  className="mono" 
                                  value={ing.out} 
                                  onChange={e => updBaristaIng(ing.id, 'out', e.target.value)} 
                                  style={{ width: '100%', border: 'none', borderBottom: '1.5px solid transparent', textAlign: 'right', padding: '4px 0', fontSize: '11.5px', background: 'transparent', color: '#be123c', fontWeight: 500 }} 
                                  placeholder="0" 
                                  onFocus={e => e.target.style.borderBottom = '1.5px solid #be123c'} 
                                  onBlur={e => e.target.style.borderBottom = '1.5px solid transparent'} 
                                />
                                
                                <div className="mono" style={{ textAlign: 'right', fontWeight: 700, fontSize: '12px', color: '#0f0f0e', padding: '4px 0' }}>
                                  {(Number(ing.start) || 0) + (Number(ing.in) || 0) - (Number(ing.out) || 0)}
                                </div>
                                
                                <button 
                                  onClick={() => delBaristaIng(ing.id)} 
                                  style={{ width: '20px', height: '20px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                                  onMouseOver={e => e.target.style.color = '#ef4444'}
                                  onMouseOut={e => e.target.style.color = '#cbd5e1'}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', marginTop: '10px' }}>
                            * Số liệu tồn cuối ca tự động kết toán = Tồn đầu ca + Hàng nhập thêm - Khấu hao sử dụng thực tế.
                          </div>
                        </div>

                        <div style={{ borderTop: '1.5px solid #e2e8f0', paddingTop: '16px', display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', alignItems: 'center' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#4b5563' }}>Nhân sự hỗ trợ ca</label>
                          <input 
                            type="number" 
                            className="input-field mono" 
                            value={baristaStaffCount} 
                            onChange={e => setBaristaStaffCount(e.target.value)} 
                            placeholder="0" 
                            style={{ textAlign: 'right', fontWeight: 500, borderRadius: '2px', border: '1px solid #cbd5e1', padding: '6px 10px', width: '100%' }} 
                          />
                        </div>

                        <div style={{ borderTop: '1.5px solid #e2e8f0', paddingTop: '16px' }}>
                          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                            NHẬT KÝ VẬN HÀNH CA LÀM VIỆC
                          </div>
                          <textarea 
                            className="input-field" 
                            value={baristaNote} 
                            onChange={e => setBaristaNote(e.target.value)} 
                            rows={3} 
                            placeholder="Mô tả các sự cố thiết bị máy pha cà phê, phản hồi khách hàng hoặc chênh lệch nguyên liệu..." 
                            style={{ resize: 'none', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '10px', width: '100%' }} 
                          />
                        </div>
                      </div>

                      {/* Right summary column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="card" style={{ borderRadius: '4px', border: '1px solid #e5e7eb', background: 'white', padding: '16px' }}>
                          <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                            HỒ SƠ CA LÀM VIỆC
                          </div>
                          <div style={{ background: '#f8fafc', borderRadius: '4px', padding: '12px 14px', border: '1.5px solid #e2e8f0', marginBottom: '14px' }}>
                            <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>PHIÊN TRỰC BÁO CÁO</div>
                            <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f0f0e' }}>
                              {baristaShift === 'morning' ? 'Ca Sáng (06:00 - 14:00)' : 'Ca Chiều (14:00 - 22:00)'}
                            </div>
                          </div>
                          
                          <div style={{ padding: '12px 14px', background: '#fffbeb', borderRadius: '4px', border: '1px dashed #f59e0b', color: '#b45309', fontSize: '11.5px', fontWeight: 600, lineHeight: 1.5, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <AlertOctagon size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>Hệ thống tự động thiết lập kiểm kê nguyên vật liệu cho ca Pha Chế. Vui lòng cập nhật lượng hao hụt thực phẩm.</span>
                          </div>
                        </div>
                        
                        <button 
                          className="btn btn-red" 
                          style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px', borderRadius: '2px', fontWeight: 800, background: '#be123c', border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 4px 10px rgba(190,18,60,0.2)' }} 
                          onClick={handleConfirmBaristaHandover}
                        >
                          GỬI BÁO CÁO CA TRỰC
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 3. HISTORY VIEW ── */}
                {handoverTab === 'history' && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc', padding: '24px', width: '100%' }}>
                    {/* History Type Selector Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexShrink: 0 }}>
                      <button
                        onClick={() => setHistoryType('cashier')}
                        style={{
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          borderRadius: '2px',
                          background: historyType === 'cashier' ? '#be123c' : 'white',
                          color: historyType === 'cashier' ? 'white' : '#475569',
                          border: historyType === 'cashier' ? '1.5px solid #be123c' : '1.5px solid #cbd5e1',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Lịch Sử Thu Ngân
                      </button>
                      <button
                        onClick={() => setHistoryType('barista')}
                        style={{
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          borderRadius: '2px',
                          background: historyType === 'barista' ? '#be123c' : 'white',
                          color: historyType === 'barista' ? 'white' : '#475569',
                          border: historyType === 'barista' ? '1.5px solid #be123c' : '1.5px solid #cbd5e1',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Lịch Sử Pha Chế
                      </button>
                    </div>

                    {/* History List Container */}
                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                      {historyType === 'barista' ? (
                        /* Barista History List */
                        baristaHistory.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontStyle: 'italic', fontSize: '12.5px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '4px' }}>
                            Chưa ghi nhận ca pha chế nào được nộp trực tiếp trên thiết bị này.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {baristaHistory.map((s, sIdx) => (
                              <div key={s.id || sIdx} style={{ background: 'white', padding: '16px 20px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                  <span style={{ background: s.shift === 'morning' ? '#e0f2fe' : '#fef3c7', color: s.shift === 'morning' ? '#0284c7' : '#d97706', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '2px', textTransform: 'uppercase' }}>
                                    {s.shift === 'morning' ? 'Ca Sáng' : 'Ca Chiều'}
                                  </span>
                                  <span className="mono" style={{ fontWeight: 800, fontSize: '13px', color: '#0f0f0e' }}>Ngày: {fmtDate(s.date)}</span>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '2px' }}>{s.staffName || '—'}</span>
                                  <span className="mono" style={{ fontSize: '11px', color: '#9ca3af', marginLeft: 'auto', fontWeight: 600 }}>Nộp lúc: {new Date(s.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                
                                <div style={{ background: '#f8fafc', borderRadius: '4px', padding: '12px 16px', border: '1px solid #e5e7eb' }}>
                                  <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>TỒN KHO BÀN GIAO CUỐI CA</div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px 20px' }}>
                                    {(s.ingredients || []).map((ing, iIdx) => (
                                      <div key={iIdx} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                                        <span style={{ color: '#475569', fontWeight: 600, width: '120px', display: 'inline-block', flexShrink: 0 }}>{ing.name}:</span>
                                        <strong className="mono" style={{ color: '#0f0f0e', fontWeight: 700, marginLeft: '8px' }}>
                                          {(Number(ing.start) || 0) + (Number(ing.in) || 0) - (Number(ing.out) || 0)} {ing.unit || 'g'}
                                        </strong>
                                      </div>
                                    ))}
                                  </div>
                                  {s.note && (
                                    <div style={{ marginTop: '12px', padding: '8px 12px', background: '#fff', borderRadius: '2px', fontSize: '11.5px', color: '#475569', borderLeft: '3px solid #cbd5e1', lineHeight: 1.5 }}>
                                      <b>Nhật ký vận hành:</b> {s.note}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        /* Cashier History List */
                        cashierHistory.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontStyle: 'italic', fontSize: '12.5px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '4px' }}>
                            Chưa ghi nhận ca thu ngân nào được nộp trực tiếp trên thiết bị này.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {cashierHistory.map((s, sIdx) => (
                              <div key={s.id || sIdx} style={{ background: 'white', padding: '16px 20px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                  <span style={{ background: s.shift === 'morning' ? '#e0f2fe' : '#fef3c7', color: s.shift === 'morning' ? '#0284c7' : '#d97706', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '2px', textTransform: 'uppercase' }}>
                                    {s.shift === 'morning' ? 'Ca Sáng' : 'Ca Chiều'}
                                  </span>
                                  <span className="mono" style={{ fontWeight: 800, fontSize: '13px', color: '#0f0f0e' }}>Ngày: {fmtDate(s.date)}</span>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '2px' }}>{s.staffName || '—'}</span>
                                  <span className="mono" style={{ fontSize: '11px', color: '#9ca3af', marginLeft: 'auto', fontWeight: 600 }}>Nộp lúc: {new Date(s.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                
                                <div style={{ background: '#f8fafc', borderRadius: '4px', padding: '12px 16px', border: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                                  <div>
                                    <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>DOANH THU HỆ THỐNG</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#475569' }}>Tiền mặt:</span><strong>{fmt(s.cashRevenue)}</strong>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#475569' }}>Chuyển khoản:</span><strong>{fmt(s.transferRevenue)}</strong>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#475569' }}>Thẻ ATM:</span><strong>{fmt(s.cardRevenue)}</strong>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#475569' }}>Grab Food:</span><strong>{fmt(s.grabRevenue)}</strong>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#475569' }}>Shopee Food:</span><strong>{fmt(s.shopeeRevenue)}</strong>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '4px', fontWeight: 800 }}>
                                        <span>Tổng doanh thu:</span><span style={{ color: '#1e40af' }}>{fmt(s.totalRevenue)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>ĐỐI CHIẾU TIỀN MẶT</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#475569' }}>Tiền mặt đếm thực:</span><strong>{fmt(s.actualCashRevenue || s.actualCashCounted)}</strong>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '4px', fontWeight: 800 }}>
                                        <span>Chênh lệch:</span>
                                        <span style={{ color: (s.cashDiscrepancy || 0) === 0 ? '#15803d' : (s.cashDiscrepancy || 0) > 0 ? '#b45309' : '#be123c' }}>
                                          {(s.cashDiscrepancy || 0) > 0 ? `+${fmt(s.cashDiscrepancy)}` : fmt(s.cashDiscrepancy || 0)}
                                        </span>
                                      </div>
                                    </div>
                                    {s.note && (
                                      <div style={{ marginTop: '8px', padding: '6px 10px', background: '#fff', borderRadius: '2px', fontSize: '11.5px', color: '#475569', borderLeft: '3px solid #cbd5e1', lineHeight: 1.4 }}>
                                        <b>Ghi chú:</b> {s.note}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
