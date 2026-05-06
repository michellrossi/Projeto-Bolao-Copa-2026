import { Menu, User, Bell } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-dark/80 backdrop-blur-xl flex justify-between items-center w-full px-6 h-20 fixed top-0 z-50 border-b border-white/5 shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center glow-primary">
          <Menu className="text-dark stroke-[2.5px]" size={20} />
        </div>
        <h1 className="font-lexend text-xl font-black text-white tracking-tight uppercase">
          Bolão <span className="text-primary italic">2026</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors relative">
          <Bell size={18} className="text-white/60" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary rounded-full border-2 border-dark" />
        </button>
        <button className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors overflow-hidden">
          <User size={20} className="text-white/40" />
        </button>
      </div>
    </header>
  );
}
