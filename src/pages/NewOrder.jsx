import React from 'react';
import Sidebar from '../components/Sidebar';
import { ChevronRight } from 'lucide-react';

export default function NewOrder() {
  return (
    <div className="flex bg-[#f1f3f7] min-h-screen">
      <Sidebar activeMenu="new-order" />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8">
          <h2 className="text-md font-bold text-[#0a3966]">Renny Fonda Notariat</h2>
        </header>

        <main className="p-8 max-w-4xl w-full mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Input Order Baru</h1>
          <p className="text-sm text-gray-500 -mt-4">Lengkapi formulir di bawah ini untuk memulai proses pembuatan akta atau dokumen hukum lainnya.</p>

          {/* Stepper */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm px-12">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#004e92] text-white flex items-center justify-center font-bold text-sm">1</div>
              <span className="text-xs font-semibold text-[#004e92] mt-2">Jenis Akta</span>
            </div>
            <div className="h-[2px] bg-gray-200 flex-1 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#004e92] flex items-center justify-center font-bold text-sm">2</div>
              <span className="text-xs font-semibold text-gray-400 mt-2">Data Pemohon</span>
            </div>
            <div className="h-[2px] bg-gray-200 flex-1 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#004e92] flex items-center justify-center font-bold text-sm">3</div>
              <span className="text-xs font-semibold text-gray-400 mt-2">Upload Dokumen</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-700 flex items-center space-x-2">
              <span>🏛️</span> <span>Informasi Dasar Layanan</span>
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Kategori Layanan</label>
                <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm outline-none focus:border-[#004e92]">
                  <option>Pilih Kategori</option>
                  <option>Akta Perorangan</option>
                  <option>Badan Hukum</option>
                  <option>Akta Perbankan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Jenis Akta / Dokumen</label>
                <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-sm outline-none focus:border-[#004e92]">
                  <option>Pilih Jenis Akta</option>
                  <option>Pendirian PT</option>
                  <option>Jual Beli Tanah (AJB)</option>
                  <option>Waris & Hibah</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 flex justify-end space-x-4">
              <button className="px-5 py-2 text-sm font-semibold text-[#004e92] hover:bg-gray-50 rounded-lg">Simpan Draft</button>
              <button className="bg-[#004e92] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1 hover:bg-[#003d73]">
                <span>Lanjut</span> <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}