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
  enrollMFA: (friendlyName?: string) => Promise<{ qr: string; secret: string; factorId?: string; error: any }>;
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
      console.log("Attempting to sign in with email and password...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      console.log("Sign in successful, checking for MFA...");

      // First check if MFA is required based on factor_verification
      const factorVerification = data?.session?.factor_verification;
      if (factorVerification) {
        console.log("MFA required based on factor_verification:", factorVerification);
        return { session: data.session, error: null, mfaRequired: true };
      }

      // Even if factor_verification is not present, we should check if the user has MFA enabled
      // by listing their factors
      try {
        console.log("Checking for MFA factors...");
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

        if (factorsError) {
          console.error("Error listing MFA factors:", factorsError);
        } else if (factorsData.totp && factorsData.totp.length > 0) {
          // Check if any of the factors are verified
          const verifiedFactors = factorsData.totp.filter(f => f.status === 'verified');

          if (verifiedFactors.length > 0) {
            console.log("User has verified MFA factors, requiring MFA verification:", verifiedFactors);
            return { session: data.session, error: null, mfaRequired: true };
          }
        }
      } catch (factorsError) {
        console.error("Error checking MFA factors:", factorsError);
      }

      console.log("No MFA required, proceeding with sign in");
      toast.success("Signed in successfully");
      router.push("/");
      router.refresh();
      return { session: data.session, error: null };
    } catch (error: any) {
      console.error("Sign in error:", error);
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
  const enrollMFA = async (friendlyName = "My Authenticator") => {
    try {
      console.log("Calling Supabase MFA enroll API...");

      // First, check if there are any existing factors and unenroll them
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.error("Error listing MFA factors:", factorsError);
        toast.error(`Failed to list MFA factors: ${factorsError.message}`);
        return { qr: "", secret: "", error: factorsError };
      }

      // If there are existing TOTP factors, unenroll them first
      if (factorsData.totp && factorsData.totp.length > 0) {
        console.log(`Found ${factorsData.totp.length} existing TOTP factors, unenrolling...`);

        for (const factor of factorsData.totp) {
          console.log(`Unenrolling factor: ${factor.id}`);
          const { error: unenrollError } = await supabase.auth.mfa.unenroll({
            factorId: factor.id,
          });

          if (unenrollError) {
            console.error(`Error unenrolling factor ${factor.id}:`, unenrollError);
            toast.error(`Failed to unenroll existing MFA factor: ${unenrollError.message}`);
            return { qr: "", secret: "", error: unenrollError };
          }
        }

        console.log("Successfully unenrolled all existing factors");
      }

      // Now enroll a new factor with the provided friendly name
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: friendlyName,
      });

      console.log("Supabase MFA enroll response:", {
        data: data ? 'exists' : 'null',
        error: error || 'null',
        totp: data?.totp ? 'exists' : 'null'
      });

      if (error) {
        console.error("Supabase MFA enroll error:", error);
        toast.error(error.message || "Failed to enroll MFA");
        return { qr: "", secret: "", error };
      }

      if (!data || !data.totp) {
        console.error("Supabase MFA enroll missing data:", data);
        const customError = new Error("Missing TOTP data from Supabase");
        toast.error("Failed to enroll MFA: Missing required data");
        return { qr: "", secret: "", error: customError };
      }

      console.log("Supabase MFA enroll successful");
      return {
        qr: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id,
        error: null
      };
    } catch (error: any) {
      console.error("Unexpected error in enrollMFA:", error);
      toast.error(error.message || "Failed to enroll MFA");
      return { qr: "", secret: "", error };
    }
  };

  // Verify MFA during enrollment
  const verifyMFA = async (code: string) => {
    try {
      console.log("This function is deprecated. Use direct Supabase calls instead.");
      return { success: false, error: new Error("This function is deprecated") };
    } catch (error: any) {
      console.error("Error in deprecated verifyMFA function:", error);
      return { success: false, error };
    }
  };

  // Unenroll MFA
  const unenrollMFA = async () => {
    try {
      console.log("Attempting to unenroll MFA...");

      // First, get the user's factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.error("Error listing MFA factors:", factorsError);
        toast.error(`Failed to list MFA factors: ${factorsError.message}`);
        return { success: false, error: factorsError };
      }

      // Find all verified TOTP factors
      const verifiedFactors = factorsData.totp.filter(f => f.status === 'verified');

      if (verifiedFactors.length === 0) {
        console.log("No verified factors found to unenroll");
        toast.info("No MFA factors to disable");
        return { success: true, error: null };
      }

      console.log(`Found ${verifiedFactors.length} verified factors to unenroll:`, verifiedFactors);

      // Unenroll each verified factor
      for (const factor of verifiedFactors) {
        console.log(`Unenrolling factor: ${factor.id}`);
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: factor.id,
        });

        if (error) {
          console.error(`Error unenrolling factor ${factor.id}:`, error);
          toast.error(`Failed to disable MFA: ${error.message}`);
          return { success: false, error };
        }
      }

      console.log("Successfully unenrolled all MFA factors");
      toast.success("MFA disabled successfully");
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Unexpected error in unenrollMFA:", error);
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
      console.log("Starting MFA challenge verification...");

      // First, get the user's factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.error("Error listing MFA factors:", factorsError);
        toast.error(`Failed to list MFA factors: ${factorsError.message}`);
        return { success: false, error: factorsError };
      }

      // Find the first verified TOTP factor
      const verifiedFactor = factorsData.totp.find(f => f.status === 'verified');

      if (!verifiedFactor) {
        console.error("No verified TOTP factor found");
        console.log("Available factors:", factorsData);
        toast.error("No verified authenticator found");
        return { success: false, error: new Error("No verified authenticator found") };
      }

      console.log("Found verified factor:", verifiedFactor);

      // Create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id,
      });

      if (challengeError) {
        console.error("Error creating MFA challenge:", challengeError);
        toast.error(`Failed to create MFA challenge: ${challengeError.message}`);
        return { success: false, error: challengeError };
      }

      console.log("Challenge created:", challengeData);

      // Verify the code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: verifiedFactor.id,
        challengeId: challengeData.id,
        code,
      });

      if (error) {
        console.error("Error verifying MFA code:", error);
        toast.error(error.message || "Failed to verify MFA code");
        return { success: false, error };
      }

      console.log("MFA verification successful:", data);

      // Refresh the session to update the AAL level
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();

      if (sessionError) {
        console.error("Error refreshing session:", sessionError);
        toast.error(`Failed to refresh session: ${sessionError.message}`);
        return { success: false, error: sessionError };
      }

      console.log("Session refreshed:", sessionData);
      toast.success("MFA verified successfully");
      router.push("/");
      router.refresh();
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Unexpected error in verifyMFAChallenge:", error);
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
