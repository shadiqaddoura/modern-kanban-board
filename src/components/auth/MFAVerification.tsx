"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MFAVerificationProps {
  onCancel: () => void;
}

export function MFAVerification({ onCancel }: MFAVerificationProps) {
  const { verifyMFAChallenge } = useAuth();
  const supabase = createClient();
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);
      console.log("Verifying MFA code:", verificationCode);

      // Get the user's factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        console.error("Error listing factors:", factorsError);
        toast.error(`Failed to list factors: ${factorsError.message}`);
        return;
      }

      // Find the first verified TOTP factor
      const totpFactor = factorsData.totp.find(f => f.status === 'verified');

      if (!totpFactor) {
        console.error("No verified TOTP factor found");
        toast.error("No verified authenticator found");
        return;
      }

      console.log("Using factor:", totpFactor);

      // Create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) {
        console.error("Challenge error:", challengeError);
        toast.error(`Failed to create challenge: ${challengeError.message}`);
        return;
      }

      console.log("Challenge created:", challengeData);

      // Verify the code
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: verificationCode,
      });

      if (verifyError) {
        console.error("Verification error:", verifyError);
        toast.error(`Failed to verify code: ${verifyError.message}`);
        return;
      }

      console.log("Verification successful:", verifyData);
      toast.success("MFA verified successfully");

      // Refresh the session to update the AAL level
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();

      if (sessionError) {
        console.error("Session refresh error:", sessionError);
        toast.error(`Failed to refresh session: ${sessionError.message}`);
        return;
      }

      console.log("Session refreshed:", sessionData);

      // Redirect to the dashboard
      window.location.href = "/";
    } catch (error) {
      console.error("Error verifying MFA:", error);
      toast.error(`Failed to verify MFA code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Enter the verification code from your authenticator app</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your account is protected with two-factor authentication.
          Please enter the 6-digit code from your authenticator app to continue.
        </p>
        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            autoFocus
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleVerify}
          disabled={loading || verificationCode.length !== 6}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
