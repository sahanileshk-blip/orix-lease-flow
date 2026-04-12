import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Users } from "lucide-react";
import { useState } from "react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (type: "admin" | "client") => {
    login(type);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-heading font-bold text-lg">
            OX
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">ORIX India</h1>
          <p className="text-muted-foreground text-sm">Customer Service Portal – Operating Lease Management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="pt-2 space-y-3">
              <p className="text-xs text-muted-foreground text-center">Choose login type (demo)</p>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => handleLogin("superadmin")} className="gap-2 h-11 bg-[#ce1439] hover:bg-[#ce1439]/90 text-white">
                  <Shield className="h-4 w-4" />
                  Superadmin
                </Button>
                <Button onClick={() => handleLogin("admin")} variant="outline" className="gap-2 h-11">
                  <Shield className="h-4 w-4" />
                  ORIX Admin
                </Button>
                <Button onClick={() => handleLogin("client")} variant="outline" className="gap-2 h-11 col-span-2">
                  <Users className="h-4 w-4" />
                  Client User (Tata Motors)
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
