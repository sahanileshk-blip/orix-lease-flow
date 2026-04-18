import { useAuth, LoginType } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail, KeyRound, ArrowRight, Eye, EyeOff, Loader2,
  Shield, Users, Car, Monitor, TrendingUp, BarChart3,
  FileText, Clock, Receipt, Archive, Lightbulb, CreditCard,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

/* ── Demo login role config ─────────────────────────────────────────── */
const demoRoles: { label: string; type: LoginType; icon: React.ElementType; color: string }[] = [
  { label: "Superadmin", type: "superadmin", icon: Shield, color: "bg-[#ce1439] hover:bg-[#b0102e] text-white" },
  { label: "ORIX Admin", type: "admin", icon: Shield, color: "bg-slate-800 hover:bg-slate-700 text-white" },
  { label: "Qualtech (Client)", type: "client", icon: Users, color: "bg-amber-600 hover:bg-amber-700 text-white" },
  { label: "Reliance (Client)", type: "reliance", icon: Users, color: "bg-orange-700 hover:bg-orange-800 text-white" },
];

const loginFeatures = [
  {
    title: "View & manage lease agreements and contract details",
    icon: FileText,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Track rental schedules, dues & payment status",
    icon: Clock,
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Access invoices, receipts & account statements",
    icon: Receipt,
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Monitor leased assets & related documentation",
    icon: Archive,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Raise service requests & communicate with support",
    icon: Lightbulb,
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Make payments & submit settlement requests",
    icon: CreditCard,
    iconColor: "text-sky-400",
    bgColor: "bg-sky-500/10",
  },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Captcha State
  const [captcha, setCaptcha] = useState({ q: "", a: 0 });
  const [userCap, setUserCap] = useState("");

  useState(() => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ q: `${n1} + ${n2}`, a: n1 + n2 });
  });

  const refreshCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ q: `${n1} + ${n2}`, a: n1 + n2 });
    setUserCap("");
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email to receive an OTP.", variant: "destructive" });
      return;
    }
    if (parseInt(userCap) !== captcha.a) {
      toast({ title: "Invalid Captcha", description: "Please solve the math puzzle correctly.", variant: "destructive" });
      refreshCaptcha();
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      toast({ title: "OTP Sent", description: `A 6-digit OTP has been sent to ${email}` });
    }, 1200);
  };

  const handleVerify = () => {
    if (otp.length < 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const type: LoginType = email.includes("orix") ? "admin" : email.includes("reliance") ? "reliance" : "client";
      login(type);
      navigate("/");
    }, 1000);
  };

  const handleDemoLogin = (type: LoginType) => {
    setIsLoading(true);
    setTimeout(() => {
      login(type);
      navigate("/");
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0f1e35] relative overflow-hidden">
      {/* Flat geometric shapes across the entire background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect x="-80" y="100" width="320" height="320" rx="40" fill="white" fillOpacity="0.03" transform="rotate(20 80 260)" />
        <rect x="340" y="-60" width="280" height="280" rx="24" fill="white" fillOpacity="0.04" transform="rotate(-15 480 80)" />
        <rect x="200" y="480" width="400" height="400" rx="60" fill="#ce1439" fillOpacity="0.07" transform="rotate(10 400 680)" />
        <rect x="-60" y="550" width="220" height="220" rx="20" fill="white" fillOpacity="0.03" transform="rotate(-30 -30 660)" />
        <circle cx="540" cy="650" r="160" fill="white" fillOpacity="0.025" />
        <circle cx="80" cy="80" r="80" fill="#ce1439" fillOpacity="0.08" />
      </svg>

      {/* ── Left brand panel ────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative z-10 border-r border-white/5 bg-[#111b2d]/50 backdrop-blur-sm">

        <div className="relative z-10 w-full max-w-lg mx-auto">
          {/* Branded Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
              <div className="flex flex-col gap-1.5">
                <div className="h-1.5 w-7 bg-[#ce1439] rounded-full"></div>
                <div className="h-1.5 w-7 bg-[#ce1439] rounded-full"></div>
                <div className="h-1.5 w-7 bg-[#ce1439] rounded-full"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>ORIX India</h2>
          </div>

          <div className="space-y-10">
            {/* Welcome Message */}
            <div className="space-y-4">
              <p className="text-white/80 text-[15px] leading-relaxed">
                Welcome to a <span className="text-white font-bold">secure and centralized platform</span> designed to help you efficiently manage all your lease accounts in one place. Access lease information and interact seamlessly with the support team.
              </p>
            </div>

            {/* Grid Section */}
            <div className="space-y-6">
              <h3 className="text-sky-400/80 text-xs font-bold tracking-[0.1em] uppercase">What you can do</h3>
              <div className="grid grid-cols-2 gap-4">
                {loginFeatures.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="group bg-white/[0.03] border border-white/10 rounded-xl p-4 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20">
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${f.bgColor} ${f.iconColor}`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <p className="text-[11px] font-medium text-white/70 leading-normal group-hover:text-white transition-colors">
                          {f.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Help Footer */}
            <p className="text-white/40 text-[11px] leading-relaxed pt-8 border-t border-white/5">
              For any assistance, you may connect with your designated Relationship Manager or raise a request directly through the portal.
            </p>
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-[11px] font-medium text-center">© 2026 ORIX India. All rights reserved.</p>
      </div>

      {/* ── Right form panel ────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-8 overflow-y-auto relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="h-20 w-20 bg-white rounded-xl p-2.5 flex items-center justify-center border border-white/20">
                <img src="/orix-logo-original.png" alt="ORIX" className="w-full h-full object-contain" />
              </div>
              <p className="font-bold text-white text-base" style={{ fontFamily: "var(--font-heading)" }}>ORIX India</p>
            </div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              {step === 1 ? "Sign in to your account" : "Enter verification code"}
            </h1>
            <p className="text-white/60 text-sm">
              {step === 1
                ? "Customer Service Portal — Operating Lease Management"
                : `We sent a 6-digit OTP to ${email}`}
            </p>
          </div>

          {/* Form */}
          <div className="bg-[#162a4a] border border-white/10 rounded-xl p-7 shadow-xl shadow-black/20 space-y-5">
            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-white">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 h-11 transition-all duration-200 bg-[#0f1e35]/50 border-white/10 text-white focus:border-white/30 placeholder:text-white/30"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <Label htmlFor="captcha" className="text-sm font-medium text-white">Verification Captcha</Label>
                    <span className="text-[10px] text-white/40 mb-0.5">Solve: <span className="text-white font-bold">{captcha.q}</span></span>
                  </div>
                  <Input
                    id="captcha"
                    placeholder="Result..."
                    className="h-11 transition-all duration-200 bg-[#0f1e35]/50 border-white/10 text-white focus:border-white/30 placeholder:text-white/30"
                    value={userCap}
                    onChange={e => setUserCap(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    className="border-white/30 data-[state=checked]:bg-[#ce1439] data-[state=checked]:border-[#ce1439]"
                    checked={rememberMe}
                    onCheckedChange={v => setRememberMe(!!v)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal text-white/60 cursor-pointer hover:text-white transition-colors">
                    Remember me for 30 days
                  </Label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-lg bg-[#ce1439] hover:bg-[#b0102e] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-sm font-medium text-white">One-Time Password</Label>
                  <div className="relative group">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
                    <Input
                      id="otp"
                      type={showOtp ? "text" : "password"}
                      placeholder="• • • • • •"
                      className="pl-10 pr-10 h-11 text-lg tracking-[0.4em] font-medium bg-[#0f1e35]/50 border-white/10 text-white focus:border-white/30 placeholder:text-white/30 transition-all"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowOtp(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showOtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-white/60">
                    Didn't receive it?{" "}
                    <button type="button" className="text-[#ce1439] hover:underline font-medium" onClick={() => setStep(1)}>
                      Resend OTP
                    </button>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 h-11 rounded-lg border border-white/20 bg-transparent hover:bg-white/5 active:scale-[0.98] text-white text-sm font-medium transition-all duration-150"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isLoading}
                    className="flex-1 h-11 rounded-lg bg-[#ce1439] hover:bg-[#b0102e] active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Sign In"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Demo quick-login panel */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/50 font-medium">Demo Access</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoRoles.map(r => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.type}
                    onClick={() => handleDemoLogin(r.type)}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-3 h-10 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 ${r.color}`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-[11px] text-white/40">
              Demo buttons bypass OTP — for development only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
