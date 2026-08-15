import { Trip, ItineraryDay, ItineraryItem } from '../types/travel';

export const banyuwangiTrip: Trip = {
  id: 'template-banyuwangi-explore-3d2n',
  name: 'Explore Banyuwangi 3H2M (Template)',
  destination: 'Banyuwangi, Indonesia',
  startDate: '2026-09-01',
  endDate: '2026-09-03',
  travelersCount: 2,
  currency: 'IDR',
  budget: 6130000, 
  actualSpent: 0,
  description: 'Paket Wisata Banyuwangi 3 Hari 2 Malam: Hutan De Djawatan, TN Baluran, Pulau Menjangan, Pulau Tabuhan, Kawah Ijen.',
  coverImage: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1200&q=80',
  status: 'planning',
  isTemplate: true,
  isFavorite: false,
  createdAt: new Date().toISOString().split('T')[0],
};

export const banyuwangiDays: ItineraryDay[] = [
  { id: 'bwg-day-1', tripId: 'template-banyuwangi-explore-3d2n', date: '2026-09-01', dayNumber: 1, title: 'De Djawatan & TN Baluran' },
  { id: 'bwg-day-2', tripId: 'template-banyuwangi-explore-3d2n', date: '2026-09-02', dayNumber: 2, title: 'Pulau Menjangan & Tabuhan' },
  { id: 'bwg-day-3', tripId: 'template-banyuwangi-explore-3d2n', date: '2026-09-03', dayNumber: 3, title: 'Kawah Ijen Sunrise' },
];

export const banyuwangiItems: ItineraryItem[] = [
  { id: 'bwg-item-1', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-1', time: '07:00', title: 'Penjemputan Stasiun/Hotel', location: 'Banyuwangi', description: 'Jika anda menggunakan flight maka trip ini masih bisa menyesuaikan dengan jadwal kedatangan.', category: 'Transport', estimatedCost: 0, sortOrder: 0, duration: '30m' },
  { id: 'bwg-item-2', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-1', time: '07:30', title: 'Sarapan Pagi', location: 'Resto Lokal', description: 'Persiapan untuk melanjutkan tour', category: 'Food', estimatedCost: 50000, sortOrder: 1, duration: '1h' },
  { id: 'bwg-item-3', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-1', time: '10:00', title: 'Hutan De Djawatan', location: 'Benculuk', description: 'Mengunjungi Hutan Trembesi raksasa yang mirip di film Lord of the Rings', category: 'Activity', estimatedCost: 20000, sortOrder: 2, duration: '1h 30m' },
  { id: 'bwg-item-4', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-1', time: '11:30', title: 'Menuju TN Baluran', location: 'Perjalanan', description: 'Bisa additional charge jeep safari', category: 'Transport', estimatedCost: 0, sortOrder: 3, duration: '1h 30m' },
  { id: 'bwg-item-5', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-1', time: '13:00', title: 'Makan Siang', location: 'Resto Lokal', description: 'Searah perjalanan kawasan Baluran', category: 'Food', estimatedCost: 50000, sortOrder: 4, duration: '1h' },
  { id: 'bwg-item-6', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-1', time: '14:00', title: 'Savana Bekol (TN Baluran)', location: 'TN Baluran', description: 'Menikmati keindahan lansekap savana Bekol lewat menara pandang', category: 'Activity', estimatedCost: 50000, sortOrder: 5, duration: '30m' },
  { id: 'bwg-item-7', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-1', time: '14:30', title: 'Pantai Bama & Mangrove Trail', location: 'TN Baluran', description: 'Jelajah pantai dan hutan mangrove', category: 'Activity', estimatedCost: 0, sortOrder: 6, duration: '1h' },
  { id: 'bwg-item-8', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-1', time: '15:30', title: 'Sunset di Savana Bekol', location: 'TN Baluran', description: 'Melihat panorama sunset dan satwa endemik seperti rusa, merak, kerbau', category: 'Activity', estimatedCost: 0, sortOrder: 7, duration: '1h' },
  { id: 'bwg-item-9', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-1', time: '18:30', title: 'Makan Malam', location: 'Banyuwangi', description: '', category: 'Food', estimatedCost: 50000, sortOrder: 8, duration: '1h' },
  
  { id: 'bwg-item-10', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-2', time: '07:00', title: 'Makan Pagi', location: 'Hotel', description: '', category: 'Food', estimatedCost: 0, sortOrder: 0, duration: '1h' },
  { id: 'bwg-item-11', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-2', time: '08:00', title: 'Menuju Grand Watudodol', location: 'Perjalanan', description: 'Persiapan menyeberang', category: 'Transport', estimatedCost: 0, sortOrder: 1, duration: '1h' },
  { id: 'bwg-item-12', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-2', time: '09:00', title: 'Menyeberang ke P. Menjangan', location: 'Kapal Wisata', description: 'Estimasi 1 jam perjalanan laut', category: 'Transport', estimatedCost: 250000, sortOrder: 2, duration: '1h' },
  { id: 'bwg-item-13', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-2', time: '10:00', title: 'Eksplorasi P. Menjangan', location: 'Pulau Menjangan', description: 'Registrasi, photo session di dermaga dan Takat Pasir', category: 'Activity', estimatedCost: 0, sortOrder: 3, duration: '1h' },
  { id: 'bwg-item-14', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-2', time: '11:00', title: 'Snorkeling Spot 1', location: 'Pulau Menjangan', description: 'Menikmati terumbu karang', category: 'Activity', estimatedCost: 0, sortOrder: 4, duration: '1h' },
  { id: 'bwg-item-15', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-2', time: '12:00', title: 'Makan Siang (Lunch Box)', location: 'Pulau Menjangan', description: '', category: 'Food', estimatedCost: 35000, sortOrder: 5, duration: '1h' },
  { id: 'bwg-item-16', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-2', time: '13:00', title: 'Snorkeling Spot 2', location: 'Pulau Menjangan', description: '', category: 'Activity', estimatedCost: 0, sortOrder: 6, duration: '1h' },
  { id: 'bwg-item-17', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-2', time: '14:00', title: 'Pulau Tabuhan', location: 'Pulau Tabuhan', description: 'Snorkeling di area dangkal atau berkeliling pulau', category: 'Activity', estimatedCost: 0, sortOrder: 7, duration: '2h' },
  { id: 'bwg-item-18', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-2', time: '16:00', title: 'Kembali ke Hotel', location: 'Banyuwangi', description: 'Bilas-bilas dan istirahat', category: 'Transport', estimatedCost: 0, sortOrder: 8, duration: '3h' },
  { id: 'bwg-item-19', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-2', time: '19:00', title: 'Makan Malam Kuliner Daerah', location: 'Kota Banyuwangi', description: 'Menikmati suasana malam', category: 'Food', estimatedCost: 60000, sortOrder: 9, duration: '1h 30m' },

  { id: 'bwg-item-20', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '00:10', title: 'Penjemputan ke Ijen', location: 'Hotel', description: 'Persiapan dini hari', category: 'Transport', estimatedCost: 0, sortOrder: 0, duration: '1h 20m' },
  { id: 'bwg-item-21', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '01:30', title: 'Tiba di Paltuding', location: 'Paltuding', description: 'Konfirmasi tiket online', category: 'Activity', estimatedCost: 150000, sortOrder: 1, duration: '30m' },
  { id: 'bwg-item-22', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '02:00', title: 'Mulai Pendakian', location: 'Gunung Ijen', description: 'Pendakian ke puncak', category: 'Activity', estimatedCost: 0, sortOrder: 2, duration: '2h' },
  { id: 'bwg-item-23', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '04:00', title: 'Puncak Kawah Ijen', location: 'Kawah Ijen', description: 'Melihat panorama kawah dan Blue Fire / Sunrise', category: 'Activity', estimatedCost: 0, sortOrder: 3, duration: '2h' },
  { id: 'bwg-item-24', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '06:00', title: 'Kembali ke Paltuding', location: 'Paltuding', description: 'Turun dari puncak', category: 'Activity', estimatedCost: 0, sortOrder: 4, duration: '2h' },
  { id: 'bwg-item-25', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '08:00', title: 'Kembali ke Banyuwangi', location: 'Kota Banyuwangi', description: 'Peserta akan diantar ke meeting point', category: 'Transport', estimatedCost: 0, sortOrder: 5, duration: '1h' },
  { id: 'bwg-item-26', tripId: 'template-banyuwangi-explore-3d2n', dayId: 'bwg-day-3', time: '09:00', title: 'Trip Selesai', location: 'Bandara / Stasiun', description: 'Diantar kembali ke tujuan akhir', category: 'Transport', estimatedCost: 0, sortOrder: 6, duration: '-' },
];
