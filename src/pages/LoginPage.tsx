import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Mail, Github, LogIn } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/palpites');
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 scale-105 animate-pulse-slow"
        style={{
          backgroundImage: 'url("/images/bg-login.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4) saturate(1.2)'
        }}
      />
      
      {/* Decorative Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/40 z-[1]" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full z-[1]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full z-[1]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass-dark p-8 md:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center border-white/10">
          {/* Logo Area */}
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-8 glow-primary"
          >
            <Trophy className="w-10 h-10 text-dark stroke-[2.5px]" />
          </motion.div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-3 font-lexend tracking-tight uppercase">
              Bolão <span className="text-primary italic">2026</span>
            </h1>
            <p className="text-white/60 font-medium">
              A maior arena de palpites do mundo espera por você.
            </p>
          </div>

          <div className="w-full space-y-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              className="group relative bg-white text-dark font-bold py-4 px-6 rounded-2xl w-full flex items-center justify-center gap-3 transition-all duration-300 hover:bg-primary hover:text-dark overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.38z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
            </motion.button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="text-white/30 text-sm font-bold uppercase tracking-widest">ou</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-white/80 font-semibold hover:bg-white/10 transition-colors"
              >
                <Github className="w-5 h-5" />
                GitHub
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-white/80 font-semibold hover:bg-white/10 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email
              </motion.button>
            </div>
          </div>

          <p className="mt-10 text-white/40 text-sm text-center">
            Ao entrar, você concorda com nossos <br />
            <a href="#" className="text-white/60 hover:text-primary transition-colors underline underline-offset-4">Termos de Serviço</a> e <a href="#" className="text-white/60 hover:text-primary transition-colors underline underline-offset-4">Privacidade</a>.
          </p>
        </div>

        {/* Floating Stats or Badges */}
        <div className="mt-8 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">48M</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Palpites</p>
          </div>
          <div className="w-[1px] h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">R$ 50k</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Prêmios</p>
          </div>
          <div className="w-[1px] h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">120k</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Jogadores</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
