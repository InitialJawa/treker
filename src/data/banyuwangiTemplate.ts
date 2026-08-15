import { Trip, ItineraryDay, ItineraryItem, Place, Expense, TransportLeg } from '../types/travel';

export const banyuwangiTrip: Trip = {
  id: 'template-banyuwangi-explore-3d2n',
  name: 'Explore Banyuwangi 5H4M (Super Lengkap)',
  destination: 'Banyuwangi, Jawa Timur, Indonesia',
  startDate: '2026-09-03',
  endDate: '2026-09-07',
  travelersCount: 2,
  currency: 'IDR',
  budget: 7850000, 
  actualSpent: 2125000,
  description: 'Paket Wisata Banyuwangi Lengkap 5 Hari 4 Malam: Hutan De Djawatan, Green Island, Pulau Menjangan & Tabuhan Snorkeling, Safari Jeep Baluran, Midnight Trek Kawah Ijen Blue Fire, hingga Wisata Budaya Osing & Oleh-oleh.',
  coverImage: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1200&q=80',
  status: 'upcoming',
  isTemplate: true,
  isFavorite: true,
  createdAt: '2026-08-15',
};

export const banyuwangiDays: ItineraryDay[] = [
  { 
    id: 'bwg-day-1', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    date: '2026-09-03', 
    dayNumber: 1, 
    title: 'Kedatangan, Kuliner Khas & Check-in Hotel' 
  },
  { 
    id: 'bwg-day-2', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    date: '2026-09-04', 
    dayNumber: 2, 
    title: 'Hutan De-Djawatan, Green Island, Spot T, Pulau Bedil & Sunset Pulau Merah' 
  },
  { 
    id: 'bwg-day-3', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    date: '2026-09-05', 
    dayNumber: 3, 
    title: 'Pulau Tabuhan & Pulau Menjangan Snorkeling + Jeep Safari Savana Baluran' 
  },
  { 
    id: 'bwg-day-4', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    date: '2026-09-06', 
    dayNumber: 4, 
    title: 'Midnight Trek Blue Fire Kawah Ijen, Sunrise & Santai Sore Dialoog' 
  },
  { 
    id: 'bwg-day-5', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    date: '2026-09-07', 
    dayNumber: 5, 
    title: 'Desa Adat Osing Kemiren, Belanja Oleh-Oleh Khas & Kepulangan' 
  },
];

export const banyuwangiItems: ItineraryItem[] = [
  // ==========================================
  // DAY 1: KEDATANGAN & BRIEFING
  // ==========================================
  { 
    id: 'bwg-item-1', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-1', 
    time: '07:00', 
    title: 'Penjemputan Stasiun/Bandara/Hotel', 
    location: 'Bandara Blimbingsari / Stasiun Banyuwangi Kota', 
    description: 'Penjemputan kedatangan fleksibel menyesuaikan jadwal flight atau kereta.', 
    category: 'Transport', 
    estimatedCost: 0, 
    sortOrder: 0, 
    duration: '30m' 
  },
  { 
    id: 'bwg-item-2', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-1', 
    time: '07:30', 
    title: 'Sarapan Pagi Nasi Tempong Mbok Wah', 
    location: 'Nasi Tempong Mbok Wah, Banyuwangi', 
    description: 'Menikmati sarapan kuliner legendaris Banyuwangi dengan sambal khas tempong yang pedas mantap.', 
    category: 'Food', 
    estimatedCost: 50000, 
    sortOrder: 1, 
    duration: '1h' 
  },
  { 
    id: 'bwg-item-3', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-1', 
    time: '09:00', 
    title: 'Taman Gandrung Terakota', 
    location: 'Desa Krajan, Jiwa Jawa Ijen', 
    description: 'Mengunjungi amphiteater terbuka berisi ratusan patung penari Gandrung di hamparan sawah hijau lereng Ijen.', 
    category: 'Activity', 
    estimatedCost: 75000, 
    sortOrder: 2, 
    duration: '2h' 
  },
  { 
    id: 'bwg-item-4', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-1', 
    time: '12:00', 
    title: 'Makan Siang Sego Cawuk Mak Mantih', 
    location: 'Rogojampi, Banyuwangi', 
    description: 'Kuliner tradisional sego cawuk khas suku Osing dengan kuah pindang dan sambal kelapa bakar.', 
    category: 'Food', 
    estimatedCost: 40000, 
    sortOrder: 3, 
    duration: '1h' 
  },
  { 
    id: 'bwg-item-5', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-1', 
    time: '14:00', 
    title: 'Check-in Hotel & Unpacking', 
    location: 'Hotel Santika / Ketapang Indah Hotel', 
    description: 'Istirahat dan persiapan energi untuk tour maraton hari kedua.', 
    category: 'Hotel', 
    estimatedCost: 650000, 
    sortOrder: 4, 
    duration: '2h' 
  },
  { 
    id: 'bwg-item-6', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-1', 
    time: '18:30', 
    title: 'Makan Malam Rujak Soto & Briefing Tour', 
    location: 'Pondok Rujak Soto Losari', 
    description: 'Mencoba perpaduan unik rujak uleg petis dan soto babat hangat khas Banyuwangi + briefing persiapan tour.', 
    category: 'Food', 
    estimatedCost: 45000, 
    sortOrder: 5, 
    duration: '1h 30m' 
  },
  { 
    id: 'bwg-item-7', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-1', 
    time: '20:30', 
    title: 'Kembali ke Hotel & Istirahat Malam', 
    location: 'Hotel Banyuwangi', 
    description: 'Tidur cukup sebelum penjemputan pagi hari ke De-Djawatan.', 
    category: 'Hotel', 
    estimatedCost: 0, 
    sortOrder: 6, 
    duration: '8h' 
  },
  
  // ==========================================
  // DAY 2: DE DJAWATAN, GREEN ISLAND, PULAU MERAH
  // ==========================================
  {
    id: 'bwg-item-d2-1',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '04:25',
    title: 'Bangun Pagi & Persiapan Tour',
    location: 'Penginapan / Hotel',
    description: 'Persiapan perlengkapan outdoor, sunscreen, baju ganti untuk pantai.',
    category: 'Other',
    estimatedCost: 0,
    sortOrder: 0,
    duration: '3h 35m'
  },
  {
    id: 'bwg-item-d2-2',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '08:00',
    title: 'Penjemputan Peserta Tour',
    location: 'Stasiun, Terminal, Bandara, Hotel',
    description: 'Penjemputan peserta tour oleh tim pemandu profesional.',
    category: 'Transport',
    estimatedCost: 0,
    sortOrder: 1,
    duration: '15m'
  },
  {
    id: 'bwg-item-d2-3',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '08:15',
    title: 'Berangkat ke Hutan De-Djawatan',
    location: 'Hutan De-Djawatan',
    description: 'Perjalanan 45 menit menuju Hutan De-Djawatan Benculuk.',
    category: 'Transport',
    estimatedCost: 0,
    sortOrder: 2,
    duration: '45m'
  },
  {
    id: 'bwg-item-d2-4',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '09:00',
    title: 'Sampai & Explore Hutan De-Djawatan',
    location: 'Hutan De-Djawatan, Benculuk',
    description: 'Explore hutan dengan pohon Trembesi raksasa berusia ratusan tahun mirip latar Fangorn Forest film Lord of The Rings.',
    category: 'Activity',
    estimatedCost: 20000,
    sortOrder: 3,
    duration: '1h'
  },
  {
    id: 'bwg-item-d2-5',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '10:00',
    title: 'Menuju Pantai Mustika & Green Island',
    location: 'Pantai Mustika',
    description: 'Meninggalkan De-Djawatan menuju dermaga Pantai Mustika untuk menyebrang ke Green Island.',
    category: 'Transport',
    estimatedCost: 0,
    sortOrder: 4,
    duration: '30m'
  },
  {
    id: 'bwg-item-d2-6',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '10:30',
    title: 'Sampai Green Island & Trekking Puncak',
    location: 'Green Island Banyuwangi',
    description: 'Trekking menuju spot puncak untuk melihat panorama miniatur Raja Ampat khas Banyuwangi.',
    category: 'Activity',
    estimatedCost: 0,
    sortOrder: 5,
    duration: '1h'
  },
  {
    id: 'bwg-item-d2-7',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '11:30',
    title: 'Bergeser ke Spot T Naik Perahu',
    location: 'Spot T',
    description: 'Turun dari puncak Green Island dan naik perahu nelayan menuju Spot T.',
    category: 'Transport',
    estimatedCost: 0,
    sortOrder: 6,
    duration: '30m'
  },
  {
    id: 'bwg-item-d2-8',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '12:00',
    title: 'Sampai Spot T (View Gugusan Pulau)',
    location: 'Spot T',
    description: 'Menikmati pemandangan gugusan pulau eksotis dari atas perahu serta foto estetik.',
    category: 'Activity',
    estimatedCost: 0,
    sortOrder: 7,
    duration: '30m'
  },
  {
    id: 'bwg-item-d2-9',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '12:30',
    title: 'Eksplorasi Pulau Bedil Banyuwangi',
    location: 'Pulau Bedil Banyuwangi',
    description: 'Eksplorasi laguna alami di dalam gua karang Pulau Bedil dengan perahu.',
    category: 'Activity',
    estimatedCost: 0,
    sortOrder: 8,
    duration: '30m'
  },
  {
    id: 'bwg-item-d2-10',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '13:00',
    title: 'Kembali Menuju Pantai Mustika',
    location: 'Pantai Mustika',
    description: 'Menyebrang kembali ke daratan Pantai Mustika.',
    category: 'Transport',
    estimatedCost: 0,
    sortOrder: 9,
    duration: '30m'
  },
  {
    id: 'bwg-item-d2-11',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '13:30',
    title: 'Makan Siang Ikan Bakar Pantai Mustika',
    location: 'Warung Ikan Bakar Mustika',
    description: 'Makan siang ikan kakap bakar segar langsung dari tangkapan nelayan lokal.',
    category: 'Food',
    estimatedCost: 65000,
    sortOrder: 10,
    duration: '30m'
  },
  {
    id: 'bwg-item-d2-12',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '14:00',
    title: 'Menuju Pantai Pulau Merah',
    location: 'Pantai Pulau Merah',
    description: 'Perjalanan singkat menuju kawasan Pantai Pulau Merah.',
    category: 'Transport',
    estimatedCost: 0,
    sortOrder: 11,
    duration: '1h'
  },
  {
    id: 'bwg-item-d2-13',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '15:00',
    title: 'Explore & Sunset Spektakuler Pulau Merah',
    location: 'Pantai Pulau Merah',
    description: 'Menikmati sunset golden hour paling ikonik di Banyuwangi dengan siluet bukit merah di tengah laut.',
    category: 'Activity',
    estimatedCost: 25000,
    sortOrder: 12,
    duration: '2h 30m'
  },
  {
    id: 'bwg-item-d2-14',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '17:30',
    title: 'Meninggalkan Pulau Merah',
    location: 'Pantai Pulau Merah',
    description: 'Perjalanan kembali menuju arah kota Banyuwangi.',
    category: 'Transport',
    estimatedCost: 0,
    sortOrder: 13,
    duration: '1h'
  },
  {
    id: 'bwg-item-d2-15',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '18:30',
    title: 'Makan Malam Kuliner Lokal',
    location: 'Resto Osing Deles / Pecel Rawon',
    description: 'Menikmati hidangan lezat Pecel Rawon khas Jawa Timur.',
    category: 'Food',
    estimatedCost: 55000,
    sortOrder: 14,
    duration: '1h 30m'
  },
  {
    id: 'bwg-item-d2-16',
    tripId: 'template-banyuwangi-explore-3d2n',
    dayId: 'bwg-day-2',
    time: '20:00',
    title: 'Drop off Hotel & Istirahat',
    location: 'Hotel Banyuwangi',
    description: 'Istirahat malam untuk persiapan snorkeling Menjangan & Baluran besok pagi.',
    category: 'Transport',
    estimatedCost: 0,
    sortOrder: 15,
    duration: '30m'
  },

  // ==========================================
  // DAY 3: PULAU TABUHAN, MENJANGAN & BALURAN JEEP
  // ==========================================
  { id: 'bwg-item-d3-1', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '06:30', title: 'Penjemputan & Persiapan di Hotel/Stasiun', location: 'Hotel/Stasiun Banyuwangi Kota', description: 'Penjemputan pagi open trip menuju Pantai Grand Watu Dodol.', category: 'Transport', estimatedCost: 0, sortOrder: 0, duration: '30m' },
  { id: 'bwg-item-d3-2', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '07:00', title: 'Menuju Pantai Grand Watu Dodol', location: 'Pantai Grand Watu Dodol', description: 'Menuju meeting point kapal penyebrangan Selat Bali.', category: 'Transport', estimatedCost: 0, sortOrder: 1, duration: '1h' },
  { id: 'bwg-item-d3-3', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '08:00', title: 'Menyebrang Speed Boat ke Pulau Menjangan', location: 'Selat Bali', description: 'Penyebrangan laut seru dengan panorama perairan Selat Bali.', category: 'Transport', estimatedCost: 0, sortOrder: 2, duration: '30m' },
  { id: 'bwg-item-d3-4', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '08:30', title: 'Sampai Pulau Menjangan & Registrasi TN Bali Barat', location: 'Pulau Menjangan Bali Barat', description: 'Registrasi simaksi masuk Taman Nasional Bali Barat.', category: 'Activity', estimatedCost: 35000, sortOrder: 3, duration: '15m' },
  { id: 'bwg-item-d3-5', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '08:45', title: 'Foto Dermaga & Rusa Liar Menjangan', location: 'Dermaga Menjangan', description: 'Foto bersama kawanan rusa liar pulau Menjangan yang jinak di tepi pantai.', category: 'Activity', estimatedCost: 0, sortOrder: 4, duration: '15m' },
  { id: 'bwg-item-d3-6', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '09:00', title: 'Snorkeling Spot 1 (Coral Garden)', location: 'Taman Nasional Bali Barat', description: 'Snorkeling di spot terumbu karang warna-warni dan anemon nemo kelas dunia.', category: 'Activity', estimatedCost: 0, sortOrder: 5, duration: '1h' },
  { id: 'bwg-item-d3-7', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '10:00', title: 'Snorkeling Spot 2 (Wall Diving Point)', location: 'Pulau Menjangan', description: 'Menikmati keindahan palung laut dan biota terumbu karang eksotis.', category: 'Activity', estimatedCost: 0, sortOrder: 6, duration: '30m' },
  { id: 'bwg-item-d3-8', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '10:30', title: 'Menuju Pulau Tabuhan Banyuwangi', location: 'Pulau Tabuhan Banyuwangi', description: 'Melanjutkan perjalanan laut menuju Pulau Tabuhan.', category: 'Transport', estimatedCost: 0, sortOrder: 7, duration: '30m' },
  { id: 'bwg-item-d3-9', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '11:00', title: 'Tiba di Pulau Tabuhan & Foto Pasir Putih', location: 'Pulau Tabuhan Banyuwangi', description: 'Pulau tak berpenghuni dengan air kristal toska dan hamparan pasir putih bersih.', category: 'Activity', estimatedCost: 0, sortOrder: 8, duration: '30m' },
  { id: 'bwg-item-d3-10', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '11:30', title: 'Makan Siang Picnic Lunch Box', location: 'Pulau Tabuhan', description: 'Makan siang santai di bawah pohon tepi pantai pasir putih.', category: 'Food', estimatedCost: 0, sortOrder: 9, duration: '30m' },
  { id: 'bwg-item-d3-11', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '12:00', title: 'Keliling Pulau Tabuhan & Foto Estetik', location: 'Pulau Tabuhan', description: 'Jalan santai mengitari seluruh pulau dan berfoto di reruntuhan mercusuar ikonik.', category: 'Activity', estimatedCost: 0, sortOrder: 10, duration: '30m' },
  { id: 'bwg-item-d3-12', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '12:30', title: 'Kembali Menuju Grand Watu Dodol', location: 'Pantai Grand Watu Dodol', description: 'Perjalanan kembali dengan perahu menuju daratan Jawa.', category: 'Transport', estimatedCost: 0, sortOrder: 11, duration: '30m' },
  { id: 'bwg-item-d3-13', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '13:00', title: 'Bilas Air Tawar & Bersih-bersih', location: 'Pantai Grand Watu Dodol', description: 'Bilas, mandi dan berganti pakaian safari jeep.', category: 'Other', estimatedCost: 15000, sortOrder: 12, duration: '30m' },
  { id: 'bwg-item-d3-14', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '13:30', title: 'Perjalanan Menuju TN Baluran (Jeep 4x4)', location: 'Taman Nasional Baluran', description: 'Sensasi naik Jeep terbuka menuju gerbang Taman Nasional Baluran.', category: 'Transport', estimatedCost: 0, sortOrder: 13, duration: '1h 30m' },
  { id: 'bwg-item-d3-15', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '15:00', title: 'Safari Savana Bekol & Sunset Pantai Bama', location: 'Savana Bekol & Pantai Bama', description: 'Eksplorasi Africa Van Java! Melihat kawanan banteng Jawa liar, merak, dan rusa di Savana Bekol + sunset hutan bakau Pantai Bama.', category: 'Activity', estimatedCost: 35000, sortOrder: 14, duration: '1h 30m' },
  { id: 'bwg-item-d3-16', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '16:30', title: 'Kembali ke Kota Banyuwangi', location: 'Banyuwangi Kota', description: 'Konvoi jeep 4x4 kembali menuju pusat kota.', category: 'Transport', estimatedCost: 0, sortOrder: 15, duration: '1h 30m' },
  { id: 'bwg-item-d3-17', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '18:00', title: 'Tiba Hotel & Istirahat Awal', location: 'Hotel Banyuwangi', description: 'Makan malam cepat dan istirahat tidur lebih awal sebelum mendaki Ijen tengah malam jam 00:30.', category: 'Hotel', estimatedCost: 0, sortOrder: 16, duration: '6h' },

  // ==========================================
  // DAY 4: KAWAH IJEN MIDNIGHT & DIALOOG
  // ==========================================
  { id: 'bwg-item-d4-1', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-4', time: '00:30', title: 'Penjemputan Midnight Tour Ijen', location: 'Hotel Banyuwangi Kota', description: 'Penjemputan peserta tengah malam menggunakan mobil ber-AC/Trooper.', category: 'Transport', estimatedCost: 0, sortOrder: 0, duration: '30m' },
  { id: 'bwg-item-d4-2', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-4', time: '01:00', title: 'Perjalanan Menuju Pos Paltuding', location: 'Gunung Ijen Paltuding', description: 'Perjalanan darat menanjak menuju kaki Gunung Ijen (Pos Paltuding).', category: 'Transport', estimatedCost: 0, sortOrder: 1, duration: '1h' },
  { id: 'bwg-item-d4-3', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-4', time: '02:00', title: 'Briefing, Sewa Gas Mask & Start Trekking', location: 'Pos Paltuding Kawah Ijen', description: 'Pemasangan masker gas respirator dan memulai pendakian 3 km dipandu guide lokal berlisensi.', category: 'Activity', estimatedCost: 50000, sortOrder: 2, duration: '2h' },
  { id: 'bwg-item-d4-4', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-4', time: '04:00', title: 'Puncak Kawah Ijen (Blue Fire & Sunrise Danau Toska)', location: 'Puncak & Bibir Kawah Ijen', description: 'Menyaksikan fenomena Blue Fire terlangka di dunia dan sunrise megah di danau asam toska terbesar di bumi.', category: 'Activity', estimatedCost: 0, sortOrder: 3, duration: '2h 30m' },
  { id: 'bwg-item-d4-5', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-4', time: '06:30', title: 'Trekking Turun ke Pos Paltuding', location: 'Pos Paltuding', description: 'Turun santai sambil menikmati pemandangan hutan cantigi dan bukit hijau.', category: 'Activity', estimatedCost: 0, sortOrder: 4, duration: '1h' },
  { id: 'bwg-item-d4-6', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-4', time: '07:30', title: 'Kembali Menuju Kota Banyuwangi', location: 'Banyuwangi Kota', description: 'Perjalanan pulang turun dari pegunungan Ijen.', category: 'Transport', estimatedCost: 0, sortOrder: 5, duration: '1h 30m' },
  { id: 'bwg-item-d4-7', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-4', time: '09:00', title: 'Sarapan Hotel & Mandi Segar', location: 'Hotel Banyuwangi', description: 'Sarapan prasmanan hotel dan mandi relaksasi setelah pendakian.', category: 'Hotel', estimatedCost: 0, sortOrder: 6, duration: '30m' },
  { id: 'bwg-item-d4-8', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-4', time: '09:30', title: 'Istirahat & Tidur Siang Pemulihan', location: 'Hotel Banyuwangi', description: 'Tidur siang memulihkan stamina sehabis begadang dan trekking Ijen.', category: 'Hotel', estimatedCost: 0, sortOrder: 7, duration: '5h 30m' },
  { id: 'bwg-item-d4-9', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-4', time: '15:00', title: 'Santai Sore & Sunset di Dialoog Beachfront Club', location: 'Dialoog Hotel Banyuwangi', description: 'Nongkrong premium di tepi infinity pool menghadap Selat Bali dengan kelapa muda dan hidangan lezat.', category: 'Food', estimatedCost: 175000, sortOrder: 8, duration: '2h' },
  { id: 'bwg-item-d4-10', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-4', time: '18:00', title: 'Makan Malam Seafood Ikan Bakar Blimbingsari', location: 'Pantai Blimbingsari', description: 'Pesta seafood tepi pantai banyuwangi dengan kepiting saus tiram dan cumi bakar.', category: 'Food', estimatedCost: 120000, sortOrder: 9, duration: '1h 30m' },

  // ==========================================
  // DAY 5: DESA KEMIREN, OLEH-OLEH & KEPULANGAN
  // ==========================================
  { 
    id: 'bwg-item-d5-1', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-5', 
    time: '07:30', 
    title: 'Sarapan & Persiapan Packing Check-out', 
    location: 'Hotel Banyuwangi', 
    description: 'Sarapan santai di hotel dan membereskan koper untuk check out.', 
    category: 'Hotel', 
    estimatedCost: 0, 
    sortOrder: 0, 
    duration: '1h' 
  },
  { 
    id: 'bwg-item-d5-2', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-5', 
    time: '08:30', 
    title: 'Wisata Budaya Desa Adat Osing Kemiren', 
    location: 'Desa Adat Kemiren, Glagah', 
    description: 'Eksplorasi rumah adat kuno Osing, sanggar tari Gandrung, dan mencicipi seduhan Kopi Jaran Goyang yang terkenal harum.', 
    category: 'Activity', 
    estimatedCost: 30000, 
    sortOrder: 1, 
    duration: '2h' 
  },
  { 
    id: 'bwg-item-d5-3', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-5', 
    time: '10:30', 
    title: 'Belanja Oleh-Oleh Khas Osing Deles & Sun East Mall', 
    location: 'Pusat Oleh-Oleh Osing Deles, Banyuwangi Kota', 
    description: 'Membeli batik gajah oling khas Banyuwangi, kopi sangrai Osing, rengginang cumi, kripik bagiak, dan cinderamata unik.', 
    category: 'Activity', 
    estimatedCost: 350000, 
    sortOrder: 2, 
    duration: '1h 30m' 
  },
  { 
    id: 'bwg-item-d5-4', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-5', 
    time: '12:00', 
    title: 'Makan Siang Nasi Tempong Mbok Nah', 
    location: 'Nasi Tempong Mbok Nah Kertosari', 
    description: 'Makan siang perpisahan dengan lauk belut goreng renyah dan cumi asin tempong khas.', 
    category: 'Food', 
    estimatedCost: 50000, 
    sortOrder: 3, 
    duration: '1h' 
  },
  { 
    id: 'bwg-item-d5-5', 
    tripId: 'template-banyuwangi-explore-3d2n', 
    dayId: 'bwg-day-5', 
    time: '13:30', 
    title: 'Pengantaran ke Stasiun Ketapang / Bandara Blimbingsari', 
    location: 'Stasiun Ketapang / Bandara Banyuwangi', 
    description: 'Pengantaran tepat waktu menuju stasiun atau bandara untuk perjalanan pulang. Tour 5H4M selesai dengan kenangan tak terlupakan!', 
    category: 'Transport', 
    estimatedCost: 0, 
    sortOrder: 4, 
    duration: '1h' 
  }
];

export const banyuwangiPlaces: Place[] = [
  {
    id: 'pl-bwg-1',
    tripId: 'template-banyuwangi-explore-3d2n',
    name: 'Kawah Ijen & Blue Fire',
    category: 'Sightseeing',
    address: 'Tamansari, Licin, Kabupaten Banyuwangi',
    lat: -8.0583,
    lng: 114.2425,
    rating: 4.9,
    status: 'visited',
    isFavorite: true,
    notes: 'Fenomena api biru alami dan kawah asam hijau toska terbesar di dunia.',
    priceEstimate: 100000
  },
  {
    id: 'pl-bwg-2',
    tripId: 'template-banyuwangi-explore-3d2n',
    name: 'Taman Nasional Baluran (Savana Bekol)',
    category: 'Nature',
    address: 'Banyuputih, Kabupaten Situbondo - Banyuwangi',
    lat: -7.8398,
    lng: 114.3941,
    rating: 4.8,
    status: 'visited',
    isFavorite: true,
    notes: 'Africa Van Java! Padang savana luas habitat banteng, rusa, dan burung merak liar.',
    priceEstimate: 50000
  },
  {
    id: 'pl-bwg-3',
    tripId: 'template-banyuwangi-explore-3d2n',
    name: 'Hutan De Djawatan Benculuk',
    category: 'Sightseeing',
    address: 'Purwosari, Benculuk, Cluring, Banyuwangi',
    lat: -8.4116,
    lng: 114.2258,
    rating: 4.7,
    status: 'visited',
    isFavorite: true,
    notes: 'Hutan pohon trembesi purba rimbun yang mirip film The Lord of The Rings.',
    priceEstimate: 20000
  },
  {
    id: 'pl-bwg-4',
    tripId: 'template-banyuwangi-explore-3d2n',
    name: 'Pantai Pulau Merah',
    category: 'Beach',
    address: 'Sumberagung, Pesanggaran, Banyuwangi',
    lat: -8.5986,
    lng: 114.0253,
    rating: 4.8,
    status: 'visited',
    isFavorite: true,
    notes: 'Spot sunset terindah di Jawa Timur dengan bukit kemerahan di tepi laut.',
    priceEstimate: 25000
  },
  {
    id: 'pl-bwg-5',
    tripId: 'template-banyuwangi-explore-3d2n',
    name: 'Pulau Menjangan & Pulau Tabuhan',
    category: 'Activity',
    address: 'Taman Nasional Bali Barat / Selat Bali',
    lat: -8.1066,
    lng: 114.5147,
    rating: 4.9,
    status: 'visited',
    isFavorite: true,
    notes: 'Surga snorkeling terumbu karang hidup, ikan nemo warna-warni, dan pasir putih kristal.',
    priceEstimate: 350000
  },
  {
    id: 'pl-bwg-6',
    tripId: 'template-banyuwangi-explore-3d2n',
    name: 'Green Island & Pulau Bedil',
    category: 'Beach',
    address: 'Pantai Mustika, Pesanggaran, Banyuwangi',
    lat: -8.6142,
    lng: 114.0412,
    rating: 4.7,
    status: 'visited',
    isFavorite: true,
    notes: 'Miniatur Raja Ampat di Banyuwangi Selatan dengan laguna biru di dalam gua karang.',
    priceEstimate: 150000
  },
  {
    id: 'pl-bwg-7',
    tripId: 'template-banyuwangi-explore-3d2n',
    name: 'Desa Adat Osing Kemiren',
    category: 'Sightseeing',
    address: 'Kemiren, Glagah, Banyuwangi',
    lat: -8.2081,
    lng: 114.3325,
    rating: 4.8,
    status: 'want_to_visit',
    isFavorite: true,
    notes: 'Pusat kebudayaan suku asli Osing Banyuwangi, tari Gandrung, dan kopi Jaran Goyang.',
    priceEstimate: 30000
  },
  {
    id: 'pl-bwg-8',
    tripId: 'template-banyuwangi-explore-3d2n',
    name: 'Dialoog Hotel & Beach Club',
    category: 'Food',
    address: 'Jl. Yos Sudarso No.400, Klatak, Kalipuro, Banyuwangi',
    lat: -8.1633,
    lng: 114.3989,
    rating: 4.9,
    status: 'visited',
    isFavorite: true,
    notes: 'Resor tepi laut bintang 4 dengan kolam renang infinity menghadap Selat Bali.',
    priceEstimate: 175000
  }
];

