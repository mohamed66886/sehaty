// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUser } from '@/lib/firebase/firestore';
import type { User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user data from Firestore
        let userData = await getUser(firebaseUser.uid);
        
        // Force super_admin role for specific email
        if (firebaseUser.email === 'mohamedabdouooo28@gmail.com' && userData) {
          userData = { ...userData, role: 'super_admin' as UserRole };
        }
        
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      let userData = await getUser(userCredential.user.uid);

      // إذا لم يوجد مستند للمستخدم الأدمن، أنشئه تلقائياً
      if (
        !userData &&
        userCredential.user.email === 'mohamedabdouooo28@gmail.com'
      ) {
        const adminUser: User = {
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          name: 'مدير النظام',
          role: 'super_admin',
          createdAt: serverTimestamp() as any, // حسب نوع createdAt في User
          phone: '', // حقل الهاتف مطلوب حسب نوع User
        };
        await setDoc(doc(db, 'users', adminUser.uid), adminUser);
        userData = adminUser;
      }

      if (!userData) {
        throw new Error('User data not found');
      }

      // Force super_admin role for specific email
      if (userCredential.user.email === 'mohamedabdouooo28@gmail.com') {
        userData = { ...userData, role: 'super_admin' as UserRole };
      }

      // Redirect based on role
      redirectByRole(userData.role);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const userCredential = await signInWithPopup(auth, provider);
      await handleSocialSignIn(userCredential.user);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await handleSocialSignIn(userCredential.user);
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await handleSocialSignIn(userCredential.user);
    } catch (error) {
      console.error('Github sign in error:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const userCredential = await signInWithPopup(auth, provider);
      await handleSocialSignIn(userCredential.user);
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw error;
    }
  };

  const handleSocialSignIn = async (firebaseUser: FirebaseUser) => {
    try {
      let userData = await getUser(firebaseUser.uid);
      
      // If user doesn't exist in Firestore, create a basic profile
      if (!userData) {
        // For now, redirect to a setup page or set a default role
        // You might want to create a new user document here
        console.log('New user from social login, needs profile setup');
        router.push('/setup-profile');
        return;
      }

      // Force super_admin role for specific email
      if (firebaseUser.email === 'mohamedabdouooo28@gmail.com') {
        userData = { ...userData, role: 'super_admin' as UserRole };
      }

      // Redirect based on role
      redirectByRole(userData.role);
    } catch (error) {
      console.error('Handle social sign in error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const redirectByRole = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        router.push('/dashboard/super-admin');
        break;
      case 'teacher':
        router.push('/dashboard/teacher');
        break;
      case 'student':
        router.push('/dashboard/student');
        break;
      case 'parent':
        router.push('/dashboard/parent');
        break;
      default:
        router.push('/');
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGithub,
    signInWithApple,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
