import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Users, Mail, KeyRound, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email to receive an OTP.", variant: "destructive" });
      return;
    }
    setStep(2);
    toast({ title: "OTP Sent", description: `A 6-digit OTP has been sent to ${email}` });
  };
  const handleLogin = (type: "superadmin" | "admin" | "client" | string) => {
    login(type as any);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#ce1439] text-white font-heading font-bold text-lg">
            OX
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">ORIX India</h1>
          <p className="text-muted-foreground text-sm">Customer Service Portal – Operating Lease Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{step === 1 ? 'Sign In' : 'Verification'}</CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Enter your email to receive a secure one-time password' 
                : `We sent a code to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="your@email.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2">
                  Send OTP <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>One-Time Password (OTP)</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder="• • • • • •" className="pl-9 text-lg tracking-[0.5em] font-medium" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} autoFocus />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full" onClick={() => setStep(1)}>Back</Button>
                  <Button className="w-full" onClick={() => handleLogin(email.includes('orix') ? 'admin' : email.includes('reliance') ? 'reliance' : 'client')}>
                    Verify & Login
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <p className="text-xs text-muted-foreground text-center">Choose login type (demo)</p>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => handleLogin("superadmin")} className="gap-2 h-11 bg-[#ce1439] hover:bg-[#ce1439]/90 text-white">
                  <Shield className="h-4 w-4" />
                  Superadmin
                </Button>
                <Button onClick={() => handleLogin("admin")} variant="outline" className="gap-2 h-11">
                  <Shield className="h-4 w-4" />
                  ORIX User
                </Button>
                <Button onClick={() => handleLogin("client")} variant="outline" className="gap-2 h-11">
                  <Users className="h-4 w-4" />
                  Qualtech Edge
                </Button>
                <Button onClick={() => handleLogin("reliance")} variant="outline" className="gap-2 h-11">
                  <Users className="h-4 w-4" />
                  Reliance Ind.
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 ORIX India. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
