import React, { useState } from 'react';
import { User, Mail, Shield, Award, Camera, Save, Check, Bell, Globe, LogOut } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';

export const AccountView: React.FC = () => {
  const { trips } = useTripContext();
  const { user, logout } = useAuth();

  const [userName, setUserName] = useState(user?.displayName || user?.email?.split('@')[0] || 'Traveler');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('Petualang sejati, penikmat keindahan alam, dan pembuat rencana perjalanan impian.');
  const [preferredCurrency, setPreferredCurrency] = useState('IDR');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#DB2777] p-8 md:p-10 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="relative group shrink-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={userName}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-pink-400 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-soft-pink border-4 border-pink-400 flex items-center justify-center text-primary-pink font-black text-3xl shadow-xl">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-primary-pink p-2 rounded-full text-white shadow-md hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-black">{userName}</h1>
              <span className="bg-primary-pink text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <Award className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            </div>
            <p className="text-xs md:text-sm text-soft-pink font-medium">{userEmail || 'Email terdaftar'}</p>
            <p className="text-xs text-slate-300 max-w-xl">{bio}</p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-card-pink/10 text-center">
            <div>
              <p className="text-2xl font-black">{trips.length}</p>
              <p className="text-[10px] text-pink-200 font-bold uppercase">Trip Tersimpan</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-2xl font-black">Firebase</p>
              <p className="text-[10px] text-pink-200 font-bold uppercase">Backend Cloud</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Form & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Settings Card */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-[#EAEFF5] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-black text-dark">Informasi Profil & Akun</h2>
            {savedSuccess && (
              <span className="text-xs font-bold text-primary-pink flex items-center gap-1 bg-soft-pink px-3 py-1 rounded-full animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Perubahan berhasil disimpan!
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-custom mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-dark focus:outline-none focus:border-primary-pink bg-soft-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-custom mb-1.5">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-custom bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-custom mb-1.5">Bio Pengguna</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs font-semibold text-dark focus:outline-none focus:border-primary-pink bg-soft-pink"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-custom mb-1.5">Mata Uang Utama</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={preferredCurrency}
                    onChange={(e) => setPreferredCurrency(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-dark focus:outline-none focus:border-primary-pink bg-soft-pink"
                  >
                    <option value="IDR">IDR (Rp)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="SGD">SGD (S$)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-custom mb-1.5">User Firebase ID (UID)</label>
                <input
                  type="text"
                  disabled
                  value={user?.uid || 'guest'}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-100 text-[11px] font-mono font-bold text-gray-500 bg-gray-100 truncate cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={logout}
                className="px-5 py-2.5 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun (Logout)</span>
              </button>

              <button
                type="submit"
                className="bg-primary-pink hover:bg-[#DB2777] text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-pink-500/20 active:scale-95"
              >
                <Save className="w-4 h-4" />
                Simpan Profil
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Badges & Preferences */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#EAEFF5] shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-dark flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-pink" /> Notifikasi Email
            </h3>
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-soft-pink">
              <div>
                <p className="text-xs font-bold text-dark">Update & Pengingat Trip</p>
                <p className="text-[10px] text-gray-400">Terima reminder jadwal itinerary</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  emailNotifications ? 'bg-primary-pink' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    emailNotifications ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-soft-pink/60 rounded-3xl p-6 border border-pink-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-primary-pink">
              <Shield className="w-5 h-5 shrink-0" />
              <h3 className="font-black text-sm text-dark">Keamanan Firestore</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Data perjalanan Anda dienkripsi dan terisolasi secara aman per akun pengguna. Anda juga bisa menambahkan kolaborator email untuk mengelola trip bersama.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
