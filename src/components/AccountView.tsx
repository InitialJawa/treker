import React, { useState } from 'react';
import { User, Mail, Shield, Award, Camera, Save, Check, Bell, Globe, LogOut, Palette, RotateCcw } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { THEME_PRESETS, ThemeColors, ThemeMode } from '../types/theme';

export const AccountView: React.FC = () => {
  const { trips } = useTripContext();
  const { user, logout } = useAuth();
  const { presetId, mode, colors, setPreset, setMode, updateColor, resetToDefault } = useTheme();

  const [userName, setUserName] = useState(user?.displayName || user?.email?.split('@')[0] || 'Traveler');
  const [userEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('Petualang sejati, penikmat keindahan alam, dan pembuat rencana perjalanan impian.');
  const [preferredCurrency, setPreferredCurrency] = useState('IDR');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [themeSuccess, setThemeSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePresetSelect = async (id: string) => {
    await setPreset(id);
    setThemeSuccess(true);
    setTimeout(() => setThemeSuccess(false), 3000);
  };

  const handleColorChange = async (key: keyof ThemeColors, value: string) => {
    await updateColor(key, value);
    setThemeSuccess(true);
    setTimeout(() => setThemeSuccess(false), 3000);
  };

const handleResetTheme = async () => {
    await resetToDefault();
    setThemeSuccess(true);
    setTimeout(() => setThemeSuccess(false), 3000);
};

const handleModeSelect = (m: ThemeMode) => {
  setMode(m);
};

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-[#1E293B] to-primary-pink p-8 md:p-10 rounded-3xl text-white shadow-xl relative overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="relative group shrink-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={userName}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white/20 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <button aria-label="Ubah foto profil" className="absolute bottom-0 right-0 bg-primary-pink p-2 rounded-full text-white shadow-md hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-black">{userName}</h1>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs border border-white/20">
                <Award className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-200 font-medium">{userEmail || 'Email terdaftar'}</p>
            <p className="text-xs text-slate-300 max-w-xl">{bio}</p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
            <div>
              <p className="text-2xl font-black">{trips.length}</p>
              <p className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">Project Trip</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🎨 Theme & Custom Color Customizer */}
      <div className="bg-bgCard bg-white rounded-3xl p-6 md:p-8 border border-card-pink shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-soft-pink text-primary-pink">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-dark flex items-center gap-2">
                Tema & Warna Aplikasi
                <span className="text-[10px] font-black bg-soft-pink text-primary-pink px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Kustom Per-User
                </span>
              </h2>
              <p className="text-xs text-gray-custom">Pilih skema warna favorit atau atur warna khusus. Tersimpan otomatis di akun Anda.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {themeSuccess && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Warna tersimpan!
              </span>
            )}
            <button
              onClick={handleResetTheme}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-custom hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset ke warna awal"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Atur Ulang Warna
            </button>
          </div>
        </div>

        {/* Preset Cards Selector */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-extrabold text-dark uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-primary-pink" /> Pilihan Preset Warna Instan
            </label>
          </div>

          <div className="flex rounded-full border border-card-pink bg-screen-pink p-1 gap-1 w-fit">
            <button
              onClick={() => handleModeSelect('light')}
              aria-pressed={mode === 'light'}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all active:scale-95 ${
                mode === 'light' ? 'bg-primary-pink text-white shadow-sm' : 'text-gray-custom hover:text-dark'}
              }`}
            >
              ☀️ Terang
            </button>
            <button
              onClick={() => handleModeSelect('dark')}
              aria-pressed={mode === 'dark'}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all active:scale-95 ${
                mode === 'dark' ? 'bg-primary-pink text-white shadow-sm' : 'text-gray-custom hover:text-dark'}
              }`}
            >
              🌙 Gelap
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {THEME_PRESETS.map((p) => {
              const isActive = presetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-28 cursor-pointer ${
                    isActive
                      ? 'border-primary-pink bg-soft-pink shadow-sm ring-2 ring-primary-pink/20'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{p.icon}</span>
                    {isActive && (
                      <span className="w-5 h-5 rounded-full bg-primary-pink text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-extrabold text-dark block truncate">{p.name.split(' ')[0]}</span>
                    <div className="flex items-center gap-1 mt-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: mode === 'dark' ? p.darkColors.primary : p.colors.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: mode === 'dark' ? p.darkColors.primarySoft : p.colors.primarySoft }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: mode === 'dark' ? p.darkColors.bgApp : p.colors.bgApp }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Fine-Tuning Color Pickers */}
        <div className="pt-2 border-t border-gray-100 space-y-4">
          <label className="text-xs font-extrabold text-dark uppercase tracking-wider block">
            Penyesuaian Warna Kustom
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Primary Accent */}
            <div className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-dark block">Warna Utama (Primary)</span>
                <span className="text-[10px] text-gray-custom">Tombol, ikon & badge aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">{colors.primary}</span>
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-8 h-8 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
            </div>

            {/* 2. Soft Background */}
            <div className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-dark block">Warna Soft / Hover</span>
                <span className="text-[10px] text-gray-custom">Latar belakang tab & badge</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">{colors.primarySoft}</span>
                <input
                  type="color"
                  value={colors.primarySoft}
                  onChange={(e) => handleColorChange('primarySoft', e.target.value)}
                  className="w-8 h-8 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
            </div>

            {/* 3. Screen App Background */}
            <div className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-dark block">Latar Halaman (App BG)</span>
                <span className="text-[10px] text-gray-custom">Background utama website</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">{colors.bgApp}</span>
                <input
                  type="color"
                  value={colors.bgApp}
                  onChange={(e) => handleColorChange('bgApp', e.target.value)}
                  className="w-8 h-8 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
            </div>

            {/* 4. Border */}
            <div className="p-3.5 rounded-2xl border border-card-pink bg-gray-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-dark block">Warna Border</span>
                <span className="text-[10px] text-gray-custom">Garis kartu & input</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">{colors.border}</span>
                <input
                  type="color"
                  value={colors.border}
                  onChange={(e) => handleColorChange('border', e.target.value)}
                  className="w-8 h-8 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Account Settings Form & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Settings Card */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-card-pink shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-black text-dark">Informasi Profil & Akun</h2>
            {savedSuccess && (
              <span className="text-xs font-bold text-primary-pink flex items-center gap-1 bg-soft-pink px-3 py-1 rounded-full animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Profil berhasil disimpan!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
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
                <label className="block text-xs font-bold text-gray-custom mb-1.5">User ID (UID)</label>
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
                className="px-5 py-2.5 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun (Logout)</span>
              </button>

              <button
                type="submit"
                className="bg-primary-pink hover:opacity-90 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Simpan Profil
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Badges & Preferences */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-card-pink shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-dark flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-pink" /> Notifikasi Email
            </h3>
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-soft-pink">
              <div>
                <p className="text-xs font-bold text-dark">Update & Pengingat Trip</p>
                <p className="text-[10px] text-gray-custom">Terima reminder jadwal itinerary</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
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

          <div className="bg-soft-pink rounded-3xl p-6 border border-card-pink shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-primary-pink">
              <Shield className="w-5 h-5 shrink-0" />
              <h3 className="font-black text-sm text-dark">Keamanan Akun</h3>
            </div>
            <p className="text-xs text-gray-custom leading-relaxed">
              Data perjalanan dan preferensi Anda tersimpan secara privat dan aman pada akun Anda.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
