import React from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Column (Hero) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#003d73] text-white p-16 flex-col justify-between relative bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,61,115,0.85), rgba(0,30,60,0.95)), url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1000')` }}>
        <div>
          <div className="flex items-center space-x-2 text-xl font-bold">
            <span>⚖️</span> <span>Renny Fonda</span>
          </div>
          <p className="text-xs text-blue-200 tracking-wider font-semibold">NOTARIS & PPAT</p>
        </div>
        
        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">Keamanan Hukum untuk Masa Depan Anda.</h1>
          <p className="text-blue-100 text-sm leading-relaxed">Kami menyediakan layanan kenaktariatan yang transparan, aman, dan efisien. Masuk ke portal klien kami untuk melacak status dokumen Anda secara real-time.</p>
        </div>

        <div className="flex space-x-6 text-xs text-blue-200">
          <div>🛡️ Terjamin Aman</div>
          <div>⚡ Proses Cepat</div>
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full space-y-6">
          <div className="flex border-b border-gray-100 pb-2">
            <button className="flex-1 text-center font-bold text-[#004e92] border-b-2 border-[#004e92] pb-2 text-sm">Masuk</button>
            <button onClick={() => navigate('/register')} className="flex-1 text-center font-semibold text-gray-400 pb-2 text-sm hover:text-gray-600">Daftar Baru</button>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-800">Selamat Datang</h2>
            <p className="text-sm text-gray-400">Silakan masuk dengan akun yang sudah terdaftar.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="email" placeholder="nama@email.com" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#004e92]" required />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 uppercase">Kata Sandi</label>
                <a href="#" className="text-xs font-semibold text-[#004e92] hover:underline">Lupa Sandi?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#004e92]" required />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input type="checkbox" id="remember" className="rounded text-[#004e92]" />
              <label htmlFor="remember" className="text-xs font-medium text-gray-600 select-none">Ingat saya di perangkat ini</label>
            </div>

            <button type="submit" className="w-full bg-[#004e92] text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center space-x-2 hover:bg-[#003d73] transition-colors">
              <span>Masuk Ke Portal</span> <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-xs text-center text-gray-400">Kesulitan masuk? <a href="#" className="text-[#004e92] font-semibold hover:underline">Hubungi Admin</a></p>
        </div>
      </div>
    </div>
  );
}