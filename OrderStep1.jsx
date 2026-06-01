import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Minus, Trash2, CheckCircle2, 
  CreditCard, Wallet, Smartphone, Banknote, HelpCircle, 
  Sparkles, Check, ArrowRight, RefreshCw, ShoppingCart,
  Tag, UserCheck, LogOut, ArrowLeft, Printer,
  Maximize2, Minimize2
} from 'lucide-react';

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

  const handleBackToAdmin = () => {
    const defPage = { director: 'dashboard', accountant: 'dashboard', manager: 'report', staff: 'shift_cashier', cashier: 'shift_cashier', barista: 'shift_barista' };
    setPage(defPage[user.role] || 'dashboard');
  };

  const handleLogout = () => { localStorage.setItem('lc_user', null); window.location.reload(); };

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
      const rawShifts = localStorage.getItem('lc_shifts');
      let shifts = rawShifts ? JSON.parse(rawShifts) : [];
      let activeShift = shifts.find(s => s.date === today && s.staffName === user.name);
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
      localStorage.setItem('lc_shifts', JSON.stringify(shifts));

      // ── LINKAGE 2: Pha Chế ──
      const rawInv = localStorage.getItem('lc_inventory');
      const rawInvLogs = localStorage.getItem('lc_inventory_logs');
      let inventory = rawInv ? JSON.parse(rawInv) : [];
      let invLogs = rawInvLogs ? JSON.parse(rawInvLogs) : [];
      lastOrderDetails.items.forEach(cartItem => {
        const recipe = INGREDIENT_RECIPES[cartItem.id];
        if (!recipe) return;
        Object.entries(recipe).forEach(([ingredientName, usageAmt]) => {
          const totalUsed = usageAmt * cartItem.qty;
          const matchedItem = inventory.find(i => i.name.toLowerCase().includes(ingredientName.toLowerCase()));
          if (matchedItem) {
            matchedItem.current = Math.max(0, (matchedItem.current || 0) - totalUsed);
            invLogs.unshift({ id: 'L-' + Math.random().toString(36).slice(2, 9), itemId: matchedItem.id, itemName: matchedItem.name, category: 'export', qty: totalUsed, date: today, operator: user.name, note: `Tự động xuất tiêu hao cho đơn hàng ${lastOrderDetails.orderId}` });
          }
        });
      });
      localStorage.setItem('lc_inventory', JSON.stringify(inventory));
      localStorage.setItem('lc_inventory_logs', JSON.stringify(invLogs));

      // ── LINKAGE 3: Quản Lý ──
      const rawReports = localStorage.getItem('lc_reports');
      let reports = rawReports ? JSON.parse(rawReports) : [];
      let todayReport = reports.find(r => r.date === today);
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
      localStorage.setItem('lc_reports', JSON.stringify(reports));

      const existingOrders = JSON.parse(localStorage.getItem('lc_billing_orders') || '[]');
      existingOrders.unshift(lastOrderDetails);
      localStorage.setItem('lc_billing_orders', JSON.stringify(existingOrders));
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
          <div style={{ width: '34px', height: '34px', borderRadius: '2px', background: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', letterSpacing: '0.05em' }}>LC</div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '0.02em' }}>POCS LEE</h1>
            <p style={{ fontSize: '9px', color: '#94a3b8', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Quầy Bán Hàng Trực Tiếp</p>
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
            <button onClick={handleBackToAdmin} style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #475569', padding: '6px 14px', borderRadius: '2px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={13} /> Quay Lại
            </button>
            <button onClick={handleLogout} style={{ background: '#be123c', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '2px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
      </div>
    </div>
  );
};
