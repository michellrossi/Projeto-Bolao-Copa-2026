import { Trophy, CalendarDays, LayoutGrid, BarChart3, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';

export function NavBar() {
  const { isAdmin } = useAuth();
  const links = [
    { name: 'Palpites', icon: CalendarDays, path: '/palpites' },
    { name: 'Tabela', icon: BarChart3, path: '/tabela' },
    { name: 'Grupos', icon: LayoutGrid, path: '/grupos' },
    { name: 'Ranking', icon: Trophy, path: '/ranking' },
  ];

  if (isAdmin) {
    links.push({ name: 'Usuários', icon: Users, path: '/usuarios' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur-2xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] h-20 pb-safe">
      <div className="max-w-5xl mx-auto h-full flex justify-around items-center px-2">
        {links.map((link) => (
          <NavLink 
            key={link.name} 
            to={link.path}
            className={({ isActive }) => 
              `relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${isActive ? 'text-primary' : 'text-white/30 hover:text-white/60'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
                  <link.icon size={20} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter mt-1.5 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {link.name}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="navActive"
                    className="absolute top-0 w-12 h-1 bg-primary rounded-b-full shadow-[0_0_15px_rgba(0,148,64,0.5)]"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
