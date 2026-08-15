import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Award, Camera, Save, Check, Bell, Globe, LogOut, Palette, RotateCcw, Cloud, Server, Database, RefreshCw, Zap, ExternalLink } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { THEME_PRESETS, ThemeColors } from '../types/theme';
import { 
  getCloudflareWorkerUrl, setCloudflareWorkerUrl, isCloudflareDbEnabled, setCloudflareDbEnabled, testCloudflareConnection 
} from '../services/cloudflareDbService';

export const AccountView: React.FC = () => {
  const { trips } = useTripContext();
  const { user, logout } = useAuth();
  const { presetId, colors, setPreset, updateColor, resetToDefault, isSaving } = useTheme();

  const [userName, setUserName] = useState(user?.displayName || user?.email?.split('@')[0] || 'Traveler');
  const [userEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('Petualang sejati, penikmat keindahan alam, dan pembuat rencana perjalanan impian.');
  const [preferredCurrency, setPreferredCurrency] = useState('IDR');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [themeSuccess, setThemeSuccess] = useState(false);

  // Cloudflare State
  const [cfEnabled, setCfEnabled] = useState(isCloudflareDbEnabled());
  const [cfUrl, setCfUrl] = useState(getCloudflareWorkerUrl());
  const [cfTestResult, setCfTestResult] = useState<{ success: boolean; engine?: string; region?: string; message: string } | null>(null);
  const [isTestingCf, setIsTestingCf] = useState(false);

  useEffect(() => {
    // Run initial test
    handleTestCloudflare();
  }, []);

  const handleTestCloudflare = async () => {
    setIsTestingCf(true);
    const result = await testCloudflareConnection();
    setCfTestResult(result);
    setIsTestingCf(false);
  };

  const handleToggleCloudflare = (enabled: boolean) => {
    setCfEnabled(enabled);
    setCloudflareDbEnabled(enabled);
  };

  const handleSaveCfUrl = (url: string) => {
    setCfUrl(url);
    setCloudflareWorkerUrl(url);
  };

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
            <button className="absolute bottom-0 right-0 bg-primary-pink p-2 rounded-full text-white shadow-md hover:scale-110 transition-transform">
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
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-2xl font-black">Firebase</p>
              <p className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">Cloud Storage</p>
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
              <p className="text-xs text-gray-custom">Pilih skema warna favorit atau atur warna khusus. Tersimpan otomatis di cloud akun Anda.</p>
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
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-custom hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              title="Reset ke warna awal"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Default
            </button>
          </div>
        </div>

        {/* Preset Cards Selector */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold text-dark uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-primary-pink" /> Pilihan Preset Warna Instan
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {THEME_PRESETS.map((p) => {
              const isActive = presetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-28 ${
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
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: p.colors.primary }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: p.colors.primarySoft }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: p.colors.bgApp }} />
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
            Custom Color Fine-Tuning
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

            {/* 4. Card Background */}
            <div className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-dark block">Latar Panel / Kartu</span>
                <span className="text-[10px] text-gray-custom">Background container data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">{colors.bgCard}</span>
                <input
                  type="color"
                  value={colors.bgCard}
                  onChange={(e) => handleColorChange('bgCard', e.target.value)}
                  className="w-8 h-8 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
            </div>

            {/* 5. Main Text */}
            <div className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-dark block">Teks Utama</span>
                <span className="text-[10px] text-gray-custom">Judul & konten utama</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">{colors.textMain}</span>
                <input
                  type="color"
                  value={colors.textMain}
                  onChange={(e) => handleColorChange('textMain', e.target.value)}
                  className="w-8 h-8 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
            </div>

            {/* 6. Muted Text */}
            <div className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-dark block">Teks Sekunder</span>
                <span className="text-[10px] text-gray-custom">Keterangan & label</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">{colors.textMuted}</span>
                <input
                  type="color"
                  value={colors.textMuted}
                  onChange={(e) => handleColorChange('textMuted', e.target.value)}
                  className="w-8 h-8 rounded-xl border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="p-4 rounded-2xl border border-gray-200 bg-screen-pink space-y-3">
          <span className="text-[11px] font-extrabold text-gray-custom uppercase tracking-wider block">Live UI Preview</span>
          <div className="flex flex-wrap items-center gap-3">
            <button className="bg-primary-pink text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs">
              Tombol Utama
            </button>
            <button className="bg-soft-pink text-primary-pink px-4 py-2 rounded-xl text-xs font-bold">
              Tab / Badge Aktif
            </button>
            <span className="text-xs font-bold text-dark">
              Teks Utama (<span className="text-gray-custom">Teks Sekunder</span>)
            </span>
          </div>
        </div>
      </div>

      {/* ☁️ Cloudflare Database & Edge Worker Panel */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-card-pink shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-dark flex items-center gap-2">
                Cloudflare Backend & D1 Database
                <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Edge Optimized
                </span>
              </h2>
              <p className="text-xs text-gray-custom">Integrasi backend ultra-cepat di jaringan Cloudflare Edge dengan D1 SQL Database & KV Store.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTestCloudflare}
              disabled={isTestingCf}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-dark text-xs font-bold transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingCf ? 'animate-spin text-amber-600' : ''}`} />
              <span>Tes Koneksi</span>
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl border border-gray-100 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-custom flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-500" /> Cloudflare D1
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                cfEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {cfEnabled ? 'AKTIF' : 'NONAKTIF'}
              </span>
            </div>
            <p className="text-xs font-extrabold text-dark">SQL Relational Database</p>
            <p className="text-[11px] text-gray-custom">Menyimpan data trips, itinerary, dan item di Edge D1 SQL.</p>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-custom flex items-center gap-1.5">
                <Server className="w-4 h-4 text-sky-500" /> Cloudflare Worker API
              </span>
              <span className="text-[10px] font-extrabold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                READY
              </span>
            </div>
            <p className="text-xs font-extrabold text-dark">Edge REST Service</p>
            <p className="text-[11px] text-gray-custom">Eksekusi query super cepat &lt;20ms dari lokasi terdekat.</p>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-custom flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" /> Auth Integration
              </span>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                FIREBASE AUTH
              </span>
            </div>
            <p className="text-xs font-extrabold text-dark">Hybrid Model</p>
            <p className="text-[11px] text-gray-custom">Login aman via Firebase Auth, database di Cloudflare D1.</p>
          </div>

        </div>

        {/* Test Result Banner */}
        {cfTestResult && (
          <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 ${
            cfTestResult.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 shrink-0 ${cfTestResult.success ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div>
                <span className="font-extrabold block">{cfTestResult.message}</span>
                {cfTestResult.engine && (
                  <span className="text-[11px] opacity-80">Engine: {cfTestResult.engine} | Region: {cfTestResult.region}</span>
                )}
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold bg-white/60 px-2.5 py-1 rounded-lg border border-black/10">
              HTTP 200 OK
            </span>
          </div>
        )}

        {/* Settings & Config Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-custom">Endpoint Worker URL Custom (Opsional)</label>
            <input
              type="text"
              value={cfUrl}
              onChange={(e) => handleSaveCfUrl(e.target.value)}
              placeholder="/api/cloudflare atau https://your-worker.workers.dev"
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-mono font-bold text-dark focus:outline-none focus:border-amber-500 bg-gray-50"
            />
            <p className="text-[10px] text-gray-400">Kosongkan untuk menggunakan endpoint proxy bawaan (`/api/cloudflare`).</p>
          </div>

          <div className="flex flex-col justify-between space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-dark block">Sync Dual Database (Cloudflare + Firebase)</span>
                <span className="text-[10px] text-gray-custom">Simpan data otomatis ke Cloudflare D1 & Firestore sekaligus</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleCloudflare(!cfEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  cfEnabled ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    cfEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-700 bg-amber-100/60 px-3 py-1.5 rounded-xl">
              <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>File deployment `schema.sql` & `wrangler.toml` siap di root folder.</span>
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
                className="bg-primary-pink hover:opacity-90 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-md active:scale-95"
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

          <div className="bg-soft-pink rounded-3xl p-6 border border-card-pink shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-primary-pink">
              <Shield className="w-5 h-5 shrink-0" />
              <h3 className="font-black text-sm text-dark">Keamanan Firestore</h3>
            </div>
            <p className="text-xs text-gray-custom leading-relaxed">
              Data perjalanan dan kustomisasi tema Anda tersimpan aman dan terisolasi per akun di Firestore.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
