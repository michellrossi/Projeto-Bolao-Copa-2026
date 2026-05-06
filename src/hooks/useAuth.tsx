import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false, isApproved: false });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check Admin
        const adminDoc = await getDoc(doc(db, 'admins', user.email || ''));
        const isAdminUser = adminDoc.exists() || user.email === 'mionmic@gmail.com';
        setIsAdmin(isAdminUser);

        // Check Approval (Admins are always approved)
        if (isAdminUser) {
          setIsApproved(true);
        } else {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // Auto-create missing user document for those already logged in
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              lastLogin: new Date().toISOString(),
              approved: false
            });
            setIsApproved(false);
          } else {
            setIsApproved(userDoc.data()?.approved === true);
          }
        }
      } else {
        setIsAdmin(false);
        setIsApproved(false);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isApproved }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
