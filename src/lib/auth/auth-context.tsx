"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ session: any; error: any; mfaRequired?: boolean }>;
  signOut: () => Promise<void>;
  // MFA related functions
  enrollMFA: () => Promise<{ qr: string; secret: string; error: any }>;
  verifyMFA: (code: string) => Promise<{ success: boolean; error: any }>;
  unenrollMFA: () => Promise<{ success: boolean; error: any }>;
  isMFAEnabled: () => Promise<boolean>;
  verifyMFAChallenge: (code: string) => Promise<{ success: boolean; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error getting session:", error);
        toast.error("Failed to get user session");
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        router.refresh();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Sign up successful! Please check your email for verification.");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check if MFA is required
      const factorVerification = data?.session?.factor_verification;
      if (factorVerification) {
        // MFA is required
        return { session: data.session, error: null, mfaRequired: true };
      }

      toast.success("Signed in successfully");
      router.push("/");
      router.refresh();
      return { session: data.session, error: null };
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      return { session: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
      throw error;
    }
  };

  // MFA enrollment function
  const enrollMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) {
        toast.error(error.message || "Failed to enroll MFA");
        return { qr: "", secret: "", error };
      }

      return {
        qr: data.totp.qr_code,
        secret: data.totp.secret,
        error: null
      };
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll MFA");
      return { qr: "", secret: "", error };
    }
  };

  // Verify MFA during enrollment
  const verifyMFA = async (code: string) => {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: 'totp',
      });

      if (error) {
        toast.error(error.message || "Failed to challenge MFA");
        return { success: false, error };
      }

      const challengeId = data.id;

      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: 'totp',
        challengeId,
        code,
      });

      if (verifyError) {
        toast.error(verifyError.message || "Failed to verify MFA code");
        return { success: false, error: verifyError };
      }

      toast.success("MFA enabled successfully");
      return { success: true, error: null };
    } catch (error: any) {
      toast.error(error.message || "Failed to verify MFA");
      return { success: false, error };
    }
  };

  // Unenroll MFA
  const unenrollMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.unenroll({
        factorId: 'totp',
      });

      if (error) {
        toast.error(error.message || "Failed to disable MFA");
        return { success: false, error };
      }

      toast.success("MFA disabled successfully");
      return { success: true, error: null };
    } catch (error: any) {
      toast.error(error.message || "Failed to disable MFA");
      return { success: false, error };
    }
  };

  // Check if MFA is enabled
  const isMFAEnabled = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (error) {
        console.error("Error checking MFA status:", error);
        return false;
      }

      return data.currentLevel === 'aal2';
    } catch (error) {
      console.error("Error checking MFA status:", error);
      return false;
    }
  };

  // Verify MFA challenge during sign-in
  const verifyMFAChallenge = async (code: string) => {
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: 'totp',
        code,
      });

      if (error) {
        toast.error(error.message || "Failed to verify MFA code");
        return { success: false, error };
      }

      toast.success("MFA verified successfully");
      router.push("/");
      router.refresh();
      return { success: true, error: null };
    } catch (error: any) {
      toast.error(error.message || "Failed to verify MFA code");
      return { success: false, error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    enrollMFA,
    verifyMFA,
    unenrollMFA,
    isMFAEnabled,
    verifyMFAChallenge,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
