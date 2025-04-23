"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function MFASetup() {
  const { enrollMFA, verifyMFA, unenrollMFA, isMFAEnabled } = useAuth();
  const supabase = createClient();
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  // Check if MFA is already enabled
  useEffect(() => {
    const checkMfaStatus = async () => {
      try {
        setCheckingStatus(true);
        const enabled = await isMFAEnabled();
        setMfaEnabled(enabled);
      } catch (error) {
        console.error("Error checking MFA status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkMfaStatus();
  }, [isMFAEnabled]);

  const handleEnrollMFA = async () => {
    try {
      setEnrolling(true);
      console.log("Starting MFA enrollment...");
      const { qr, secret, error } = await enrollMFA();

      console.log("MFA enrollment response:", { qr: !!qr, secret: !!secret, error });

      if (error) {
        console.error("MFA enrollment error details:", error);
        toast.error(`Failed to set up MFA: ${error.message || 'Unknown error'}`);
        return;
      }

      if (!qr || !secret) {
        console.error("Missing QR code or secret");
        toast.error("Failed to set up MFA: Missing required data");
        return;
      }

      setQrCode(qr);
      setSecret(secret);
      console.log("MFA enrollment successful, QR code and secret set");
    } catch (error) {
      console.error("Error enrolling MFA:", error);
      toast.error(`Failed to set up MFA: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setEnrolling(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);
      console.log("Verifying MFA code:", verificationCode, "for factorId:", factorId);

      // First, create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        console.error("Challenge error:", challengeError);
        toast.error(`Failed to create challenge: ${challengeError.message}`);
        return;
      }

      console.log("Challenge created:", challengeData);
      const challengeId = challengeData.id;

      // Then verify the code
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verificationCode,
      });

      if (verifyError) {
        console.error("Verification error:", verifyError);
        toast.error(`Failed to verify code: ${verifyError.message}`);
        return;
      }

      console.log("Verification successful:", verifyData);
      setMfaEnabled(true);
      setQrCode("");
      setSecret("");
      setVerificationCode("");
      toast.success("MFA enabled successfully");
    } catch (error) {
      console.error("Error verifying MFA:", error);
      toast.error(`Failed to verify MFA code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    try {
      setLoading(true);
      const { success, error } = await unenrollMFA();

      if (error || !success) {
        toast.error("Failed to disable MFA");
        return;
      }

      setMfaEnabled(false);
      toast.success("MFA disabled successfully");
    } catch (error) {
      console.error("Error disabling MFA:", error);
      toast.error("Failed to disable MFA");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Checking MFA status...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (mfaEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Your account is protected with two-factor authentication</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Two-factor authentication adds an extra layer of security to your account.
            In addition to your password, you'll need to enter a code from your authenticator app when signing in.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={handleDisableMFA}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disabling...
              </>
            ) : (
              "Disable Two-Factor Authentication"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Protect your account with two-factor authentication</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrCode ? (
          <>
            <p className="text-sm text-muted-foreground">
              Two-factor authentication adds an extra layer of security to your account.
              In addition to your password, you'll need to enter a code from your authenticator app when signing in.
            </p>
            <Button
              onClick={handleEnrollMFA}
              disabled={enrolling}
              className="w-full"
            >
              {enrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Set Up Two-Factor Authentication"
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Step 1: Scan QR Code</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex justify-center bg-white p-4 rounded-md">
                  <Image
                    src={qrCode}
                    alt="QR Code for MFA"
                    width={200}
                    height={200}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">Step 2: Manual Setup (if QR code doesn't work)</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-2">
                  Enter this code manually in your authenticator app:
                </p>
                <div className="bg-muted p-2 rounded-md font-mono text-sm break-all">
                  {secret}
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium">Step 3: Verify Setup</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Enter the 6-digit code from your authenticator app to verify setup
                </p>
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      {qrCode && (
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setQrCode("");
              setSecret("");
              setVerificationCode("");
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerifyMFA}
            disabled={loading || verificationCode.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify and Enable"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
