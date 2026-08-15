import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowRight, Sparkles, Key, Check } from 'lucide-react';
import { saveCustomSupabaseCredentials, isSupabaseConfigured } from '../services/supabase';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom Supabase credentials configuration
  const [showConfig, setShowConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(() => localStorage.getItem('custom_supabase_url') || '');
  const [customKey, setCustomKey] = useState(() => localStorage.getItem('custom_supabase_key') || '');
  const [configSaved, setConfigSaved] = useState(false);

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('Google Sign In:', err);
      // Fallback is handled inside signInWithGoogle
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGuestLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithEmail('imamnasrulloh02@gmail.com', 'password123');
    } catch (err) {
      console.warn('Quick login notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Mohon isi alamat email dan kata sandi.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        await registerWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      console.error('Supabase Auth Error:', err);
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('wrong password') || msg.includes('invalid grant')) {
        setErrorMsg('Email atau kata sandi tidak cocok.');
      } else if (msg.includes('user already registered') || msg.includes('already exists')) {
        setErrorMsg('Email sudah terdaftar. Silakan pilih masuk (Login).');
      } else if (msg.includes('password should be at least')) {
        setErrorMsg('Kata sandi minimal 6 karakter.');
      } else {
        setErrorMsg('Gagal memproses: ' + (err?.message || 'Terjadi kesalahan'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl && customKey) {
      saveCustomSupabaseCredentials(customUrl, customKey);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-soft-pink flex flex-col justify-center items-center p-4 md:p-6 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAEFF5] shadow-2xl p-6 md:p-8 relative z-10 space-y-5">
        
        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-1.5 bg-soft-pink rounded-2xl mb-1 shadow-sm">
            <img src="/logo.svg" alt="Treker Logo" className="w-16 h-16 rounded-xl object-contain drop-shadow-xs" />
          </div>
          <h1 className="text-2xl font-black text-dark tracking-tight">
            Selamat Datang di TREKER
          </h1>
          <p className="text-xs text-gray-custom font-medium max-w-xs mx-auto">
            Rencanakan liburan impian, kolaborasi dengan teman, dan kelola anggaran perjalanan.
          </p>
        </div>

        {/* Features Checklist Badge */}
        <div className="bg-soft-pink border border-pink-100 rounded-2xl p-3 space-y-1.5 text-xs font-semibold text-dark">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary-pink shrink-0" />
            <span>Simpan trip & itinerary otomatis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary-pink shrink-0" />
            <span>Kalkulasi anggaran & checklist packing cerdas</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary-pink shrink-0" />
            <span>Template trip Banyuwangi & ribuan destinasi siap pakai</span>
          </div>
        </div>

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs font-medium space-y-1 animate-fadeIn">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed font-semibold">{errorMsg}</div>
            </div>
          </div>
        )}

        {/* PRIMARY ACTION: Sign In With Google */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-gray-200 hover:border-primary-pink hover:bg-soft-pink/50 text-dark font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-3 active:scale-98 group cursor-pointer"
          >
            {/* Official SVG Google Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.25 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="truncate">
              {loading ? 'Memproses...' : 'Masuk dengan Akun Google'}
            </span>
          </button>

          {/* QUICK 1-CLICK DEMO LOGIN */}
          <button
            type="button"
            onClick={handleQuickGuestLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Masuk Cepat Instan (1-Klik)</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Atau dengan Email
            </span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* SECONDARY ACTION: Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-bold text-dark mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-soft-pink text-xs font-semibold text-dark focus:outline-none focus:border-primary-pink focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-dark mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-soft-pink text-xs font-semibold text-dark focus:outline-none focus:border-primary-pink focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-soft-pink text-xs font-semibold text-dark focus:outline-none focus:border-primary-pink focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-primary-pink hover:bg-[#DB2777] text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 mt-2 cursor-pointer"
            >
              <span>{loading ? 'Memproses...' : isRegisterMode ? 'Daftar Akun Baru' : 'Masuk dengan Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg(null);
              }}
              className="text-xs font-bold text-primary-pink hover:underline cursor-pointer"
            >
              {isRegisterMode
                ? 'Sudah punya akun? Masuk di sini'
                : 'Belum punya akun? Buat akun baru'}
            </button>
          </div>

          {/* Expandable Supabase Keys Settings */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="w-full text-[11px] text-gray-400 hover:text-dark font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Key className="w-3 h-3" />
              <span>{showConfig ? 'Tutup Pengaturan Supabase' : '⚙️ Masukkan Kunci Supabase Pribadi (Opsional)'}</span>
            </button>

            {showConfig && (
              <form onSubmit={handleSaveCredentials} className="mt-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5 text-xs animate-fadeIn">
                <div className="text-[11px] font-bold text-dark flex items-center justify-between">
                  <span>Konfigurasi Supabase Project</span>
                  {isSupabaseConfigured && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Terhubung</span>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Project URL</label>
                  <input
                    type="url"
                    placeholder="https://xxxx.supabase.co"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Anon Public Key</label>
                  <input
                    type="text"
                    placeholder="eyJhbGciOi..."
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-dark hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {configSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span>Kunci Disimpan & Diperbarui!</span>
                    </>
                  ) : (
                    <span>Simpan & Terapkan Kunci</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
