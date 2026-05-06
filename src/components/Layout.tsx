import { ReactNode } from 'react';
import { Header } from './Header';
import { NavBar } from './NavBar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-dark text-white min-h-screen font-sans selection:bg-primary/30 selection:text-primary">
      <Header />
      <main className="max-w-5xl mx-auto px-6 pb-40 pt-32">
        {children}
      </main>
      <NavBar />
    </div>
  );
}
