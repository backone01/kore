import { X } from 'lucide-react';

export function CategoryModal({ open, onClose, categoriesList, selectedCategory, setSelectedCategory, setCurrentIndex }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-[#E9E9E7] rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#EFEFED]">
          <h3 className="font-extrabold text-[#191919] text-sm">Pilih Kategori Soal</h3>
          <button onClick={onClose} className="p-1 rounded-xl text-[#787774] hover:bg-[#FBFBFA]"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {categoriesList.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setCurrentIndex(0); onClose(); }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${isSelected ? 'bg-blue-50 text-blue-900 border border-blue-200' : 'bg-[#FBFBFA] border border-[#E9E9E7] hover:bg-white text-[#37352F]'}`}
              >
                <span>{cat.label}</span>
                <span className="font-mono text-[#787774] text-[11px]">{cat.count} Soal</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
