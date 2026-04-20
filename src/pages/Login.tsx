import { useAuth, LoginType } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail, KeyRound, ArrowRight, Eye, EyeOff, Loader2,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { LoginConfigData, ICON_MAP } from "./LoginConfig";

/* ── Demo login role config ─────────────────────────────────────────── */
const demoRoles: { label: string; type: LoginType; icon: React.ElementType; color: string }[] = [
  { label: "IT Admin (ORIX)", type: "superadmin", icon: Shield, color: "bg-[#ce1439] hover:bg-[#b0102e] text-white" },
  { label: "RM - Orix", type: "admin", icon: Shield, color: "bg-indigo-600 hover:bg-indigo-700 text-white" },
  { label: "HR Manager – Qualtech", type: "client", icon: Shield, color: "bg-amber-600 hover:bg-amber-700 text-white" },
  { label: "HR Manager – Reliance", type: "reliance", icon: Shield, color: "bg-orange-700 hover:bg-orange-800 text-white" },
  { label: "Individual User – Qualtech", type: "individual", icon: Shield, color: "bg-teal-600 hover:bg-teal-700 text-white" },
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
  const [config, setConfig] = useState<LoginConfigData>({
    primaryColor: "#ce1439",
    backgroundImage: "",
    logoUrl: "",
    welcomeText: "Welcome to a secure and centralized platform designed to help you efficiently manage all your lease accounts in one place. Access lease information and interact seamlessly with the support team.",
    announcement: "For any assistance, you may connect with your designated Relationship Manager or raise a request directly through the portal.",
    features: [
      { id: "1", title: "View & manage lease agreements and contract details", iconName: "FileText" },
      { id: "2", title: "Track rental schedules, dues & payment status", iconName: "Clock" },
      { id: "3", title: "Access invoices, receipts & account statements", iconName: "Receipt" },
      { id: "4", title: "Monitor leased assets & related documentation", iconName: "Archive" },
      { id: "5", title: "Raise service requests & communicate with support", iconName: "Lightbulb" },
      { id: "6", title: "Make payments & submit settlement requests", iconName: "CreditCard" },
    ]
  });

  useEffect(() => {
    const saved = localStorage.getItem("orix_login_config");
    if (saved) {
      try {
        setConfig(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to parse login config", e);
      }
    }
  }, []);

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
    <div className="h-screen flex flex-col lg:flex-row bg-[#0f1e35] relative overflow-hidden">
      {/* Flat geometric shapes across the entire background */}
      <div className="absolute inset-0 z-0 transition-opacity duration-1000">
        {config.backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{ backgroundImage: `url(${config.backgroundImage})` }}
          />
        ) : (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect x="-80" y="100" width="320" height="320" rx="40" fill="white" fillOpacity="0.03" transform="rotate(20 80 260)" />
            <rect x="340" y="-60" width="280" height="280" rx="24" fill="white" fillOpacity="0.04" transform="rotate(-15 480 80)" />
            <rect x="200" y="480" width="400" height="400" rx="60" fill={config.primaryColor} fillOpacity="0.07" transform="rotate(10 400 680)" />
            <rect x="-60" y="550" width="220" height="220" rx="20" fill="white" fillOpacity="0.03" transform="rotate(-30 -30 660)" />
            <circle cx="540" cy="650" r="160" fill="white" fillOpacity="0.025" />
            <circle cx="80" cy="80" r="80" fill={config.primaryColor} fillOpacity="0.08" />
          </svg>
        )}
      </div>

      {/* ── Left brand panel ────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-10 lg:p-12 relative z-10 border-r border-white/5 bg-[#111b2d]/50 backdrop-blur-sm overflow-hidden">

        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col h-full">
          {/* Branded Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden shrink-0">
              <img src={config.logoUrl || "/orix-logo-original.png"} alt="ORIX" className="w-full h-full object-contain p-1.5" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>ORIX India</h1>
            </div>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-1">
            {/* Welcome Message */}
            <div className="space-y-4">
              <p className="text-white/80 text-[14px] leading-relaxed">
                {config.welcomeText}
              </p>
            </div>

            {/* Grid Section */}
            <div className="space-y-4">
              <h3 className="text-sky-400/80 text-[10px] font-bold tracking-[0.1em] uppercase">What you can do</h3>
              <div className="grid grid-cols-2 gap-3">
                {config.features.map((f) => {
                  const Icon = ICON_MAP[f.iconName] || Shield;
                  return (
                    <div key={f.id} className="group bg-white/[0.03] border border-white/10 rounded-xl p-3 flex items-start gap-3 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20">
                      <div className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center bg-white/5 text-white/70 group-hover:text-white transition-colors" style={{ color: config.primaryColor }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-[10px] font-medium text-white/60 leading-tight group-hover:text-white transition-colors py-0.5">
                        {f.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Help Footer */}
            <div className="pt-6 border-t border-white/5">
              <p className="text-white/40 text-[10px] leading-relaxed">
                {config.announcement}
              </p>
            </div>
          </div>

          <div className="pt-6">
            <p className="relative z-10 text-white/20 text-[10px] font-medium text-center">© 2026 ORIX India. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-8 overflow-y-auto relative z-10 h-full">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="h-16 w-16 bg-white rounded-xl p-2 flex items-center justify-center border border-white/20 overflow-hidden">
                <img src={config.logoUrl || "/orix-logo-original.png"} alt="ORIX" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center gap-2">
                <img src="/orix-logo-original.png" alt="ORIX logo" className="h-3.5 object-contain brightness-0 invert opacity-70" />
                <p className="font-bold text-white text-base" style={{ fontFamily: "var(--font-heading)" }}>India</p>
              </div>
            </div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              {step === 1 ? "Sign in to your account" : "Enter verification code"}
            </h1>
            <p className="text-white/60 text-xs">
              {step === 1
                ? "Customer Service Portal — Operating Lease Management"
                : `We sent a 6-digit OTP to ${email}`}
            </p>
          </div>

          {/* Form */}
          <div className="bg-[#162a4a] border border-white/10 rounded-xl p-6 shadow-xl shadow-black/20 space-y-4">
            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-white">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 h-10 transition-all duration-200 bg-[#0f1e35]/50 border-white/10 text-white focus:border-white/30 placeholder:text-white/30"
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
                    className="h-10 transition-all duration-200 bg-[#0f1e35]/50 border-white/10 text-white focus:border-white/30 placeholder:text-white/30"
                    value={userCap}
                    onChange={e => setUserCap(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    className="border-white/30 data-[state=checked]:border-none"
                    style={{ backgroundColor: rememberMe ? config.primaryColor : 'transparent' }}
                    checked={rememberMe}
                    onCheckedChange={v => setRememberMe(!!v)}
                  />
                  <Label htmlFor="remember" className="text-xs font-normal text-white/60 cursor-pointer hover:text-white transition-colors">
                    Remember me for 30 days
                  </Label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: config.primaryColor }}
                  className="w-full h-10 rounded-lg hover:brightness-110 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-sm font-medium text-white">One-Time Password</Label>
                  <div className="relative group">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white transition-colors" />
                    <Input
                      id="otp"
                      type={showOtp ? "text" : "password"}
                      placeholder="• • • • • •"
                      className="pl-10 pr-10 h-10 text-base tracking-[0.4em] font-medium bg-[#0f1e35]/50 border-white/10 text-white focus:border-white/30 placeholder:text-white/30 transition-all"
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
                  <p className="text-[10px] text-white/60">
                    Didn't receive it?{" "}
                    <button type="button" className="text-sky-400 hover:underline font-medium" onClick={() => setStep(1)}>
                      Resend OTP
                    </button>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 h-10 rounded-lg border border-white/20 bg-transparent hover:bg-white/5 active:scale-[0.98] text-white text-xs font-medium transition-all duration-150"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isLoading}
                    style={{ backgroundColor: config.primaryColor }}
                    className="flex-1 h-10 rounded-lg hover:brightness-110 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60"
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
              <span className="text-[10px] text-white/50 font-medium whitespace-nowrap">Quick Demo Access</span>
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
                    className={`flex items-center gap-2 px-3 h-9 rounded-lg text-[10px] font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 ${r.color}`}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
