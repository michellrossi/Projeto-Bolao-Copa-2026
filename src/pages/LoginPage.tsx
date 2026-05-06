import { signInWithRedirect, GoogleAuthProvider, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Mail, Github, LogIn, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Process Google Redirect Result
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const u = result.user;
        await setDoc(doc(db, 'users', u.uid), {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
          lastLogin: new Date().toISOString()
        }, { merge: true });
        navigate('/palpites');
      }
    }).catch((err) => {
      console.error("Redirect error:", err);
      setError("Erro ao processar login com Google.");
    });
  }, [navigate]);

  if (authLoading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
      setError("Não foi possível iniciar o login com Google.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let u;
      if (isRegistering) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        u = result.user;
        await setDoc(doc(db, 'users', u.uid), {
          uid: u.uid,
          email: u.email,
          displayName: displayName || email.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`,
          lastLogin: new Date().toISOString(),
          approved: false
        }, { merge: true });
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        u = result.user;
      }
      navigate('/palpites');
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.code === 'auth/user-not-found' ? 'Usuário não encontrado.' : 
             err.code === 'auth/wrong-password' ? 'Senha incorreta.' : 
             err.code === 'auth/email-already-in-use' ? 'E-mail já cadastrado.' : 
             'Erro ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans bg-dark">
      <div 
        className="absolute inset-0 z-0 scale-105"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.2) saturate(0.5)'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent z-[1]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6 py-12"
      >
        <div className="glass-dark p-8 md:p-10 rounded-[3rem] shadow-2xl flex flex-col items-center border border-white/5">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center mb-8 text-center"
          >
            <img src="https://iili.io/BZG2miP.png" alt="Bolão 2026" className="h-24 w-auto object-contain mb-4" />
            <h1 className="text-xl font-black text-white uppercase tracking-tight">
              {isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}
            </h1>
            <p className="text-white/40 text-xs font-medium mt-1">
              {isRegistering ? 'Junte-se à maior arena de palpites' : 'Sua arena de palpites te espera'}
            </p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="w-full mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailAuth} className="w-full space-y-4 mb-8">
            <AnimatePresence mode="wait">
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text"
                      placeholder="Seu nome"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required={isRegistering}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-all text-white"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-all text-white"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-all text-white"
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              type="submit"
              className="w-full bg-primary text-dark font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  {isRegistering ? 'Cadastrar agora' : 'Entrar na arena'}
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <div className="w-full space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-white/5" />
              <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">ou use o Google</span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white text-dark font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary transition-all uppercase tracking-widest text-[10px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.38z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Login com Google
            </motion.button>
          </div>

          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="mt-8 text-white/40 hover:text-primary transition-colors text-xs font-bold"
          >
            {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se agora'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
