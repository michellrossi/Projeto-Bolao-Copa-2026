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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50 rounded-[2rem] bg-dark/80 backdrop-blur-2xl border border-white/5 shadow-2xl flex justify-around items-center h-20 px-4">
      {links.map((link) => (
        <NavLink 
          key={link.name} 
          to={link.path}
          className={({ isActive }) => 
            `relative flex flex-col items-center justify-center w-16 h-16 transition-colors ${isActive ? 'text-primary' : 'text-white/30 hover:text-white/60'}`
          }
        >
          {({ isActive }) => (
            <>
              <link.icon size={22} className="relative z-10" />
              <span className="text-[10px] font-black uppercase tracking-widest mt-1 relative z-10">{link.name}</span>
              {isActive && (
                <motion.div 
                  layoutId="navActive"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
