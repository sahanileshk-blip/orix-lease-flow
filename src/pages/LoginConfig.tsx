import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, 
  Image as ImageIcon, 
  Type, 
  Megaphone, 
  Save, 
  RotateCcw,
  Layout,
  Eye,
  Plus,
  Trash2,
  FileText,
  Clock,
  Receipt,
  Archive,
  Lightbulb,
  CreditCard,
  Monitor,
  Car,
  TrendingUp,
  BarChart3,
  Shield,
  Users,
  Grid
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export interface LoginFeature {
  id: string;
  title: string;
  iconName: string;
}

export interface LoginConfigData {
  primaryColor: string;
  backgroundImage: string;
  logoUrl: string;
  welcomeText: string;
  announcement: string;
  features: LoginFeature[];
}

export const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Clock,
  Receipt,
  Archive,
  Lightbulb,
  CreditCard,
  Monitor,
  Car,
  TrendingUp,
  BarChart3,
  Shield,
  Users,
};

const DEFAULT_FEATURES: LoginFeature[] = [
  { id: "1", title: "View & manage lease agreements and contract details", iconName: "FileText" },
  { id: "2", title: "Track rental schedules, dues & payment status", iconName: "Clock" },
  { id: "3", title: "Access invoices, receipts & account statements", iconName: "Receipt" },
  { id: "4", title: "Monitor leased assets & related documentation", iconName: "Archive" },
  { id: "5", title: "Raise service requests & communicate with support", iconName: "Lightbulb" },
  { id: "6", title: "Make payments & submit settlement requests", iconName: "CreditCard" },
];

const DEFAULT_CONFIG: LoginConfigData = {
  primaryColor: "#ce1439",
  backgroundImage: "",
  logoUrl: "",
  welcomeText: "Welcome to a secure and centralized platform designed to help you efficiently manage all your lease accounts in one place. Access lease information and interact seamlessly with the support team.",
  announcement: "For any assistance, you may connect with your designated Relationship Manager or raise a request directly through the portal.",
  features: DEFAULT_FEATURES,
};

export default function LoginConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<LoginConfigData>(DEFAULT_CONFIG);

  useEffect(() => {
    const saved = localStorage.getItem("orix_login_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ 
          ...DEFAULT_CONFIG, 
          ...parsed,
          features: parsed.features || DEFAULT_FEATURES 
        });
      } catch (e) {
        console.error("Failed to parse login config", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("orix_login_config", JSON.stringify(config));
    toast({
      title: "Configuration Saved",
      description: "Login page branding and content have been updated successfully.",
    });
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem("orix_login_config");
    toast({
      title: "Configuration Reset",
      description: "Restored factory defaults for the login page.",
    });
  };

  const addFeature = () => {
    const newFeature: LoginFeature = {
      id: Math.random().toString(36).substr(2, 9),
      title: "New feature headline",
      iconName: "Shield",
    };
    setConfig({ ...config, features: [...config.features, newFeature] });
  };

  const removeFeature = (id: string) => {
    setConfig({ ...config, features: config.features.filter(f => f.id !== id) });
  };

  const updateFeature = (id: string, updates: Partial<LoginFeature>) => {
    setConfig({
      ...config,
      features: config.features.map(f => f.id === id ? { ...f, ...updates } : f)
    });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Login Configuration</h1>
            <p className="text-muted-foreground mt-1">Manage the branding and content of the user login experience.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
              <Button onClick={handleSave} className="gap-2 px-8">
                <Save className="h-4 w-4" /> Save Configuration
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Branding Card */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Branding & Aesthetics</CardTitle>
                    <CardDescription>Custom colors and visual background elements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Action Color</Label>
                    <div className="flex gap-3">
                      <Input 
                        id="primary-color" 
                        type="color" 
                        className="w-12 h-10 p-1 cursor-pointer" 
                        value={config.primaryColor}
                        onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                      />
                      <Input 
                        type="text" 
                        className="font-mono text-sm uppercase" 
                        value={config.primaryColor}
                        onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bg-image">Global Background Image (URL)</Label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="bg-image" 
                        placeholder="https://images.unsplash.com/..." 
                        className="pl-10"
                        value={config.backgroundImage}
                        onChange={(e) => setConfig({...config, backgroundImage: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo-url">Brand Logo URL</Label>
                    <div className="relative">
                      <Layout className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="logo-url" 
                        placeholder="/logo.png or https://..." 
                        className="pl-10"
                        value={config.logoUrl}
                        onChange={(e) => setConfig({...config, logoUrl: e.target.value})}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Leave empty to use the default geometric ORIX logo.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messaging Card */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Main Messaging</CardTitle>
                    <CardDescription>Customize the welcome text and footer notices</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="welcome-text">Main Welcome Text</Label>
                  <Textarea 
                    id="welcome-text" 
                    placeholder="Enter welcome message..." 
                    className="min-h-[80px] resize-none"
                    value={config.welcomeText}
                    onChange={(e) => setConfig({...config, welcomeText: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement">Important Notice / Footer Text</Label>
                  <Textarea 
                    id="announcement" 
                    placeholder="Enter support or announcement text..." 
                    className="min-h-[60px] resize-none"
                    value={config.announcement}
                    onChange={(e) => setConfig({...config, announcement: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features Management Card */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <Grid className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Feature Highlights</CardTitle>
                    <CardDescription>Manage the grid of searchable capability cards</CardDescription>
                  </div>
                </div>
                <Button onClick={addFeature} size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add New
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {config.features.map((feature, index) => (
                  <div key={feature.id} className="flex gap-4 p-4 bg-muted/20 border border-border/50 rounded-lg group">
                    <div className="shrink-0 space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Icon</Label>
                      <Select 
                        value={feature.iconName} 
                        onValueChange={(val) => updateFeature(feature.id, { iconName: val })}
                      >
                        <SelectTrigger className="w-14 h-11 p-0 flex items-center justify-center">
                          <SelectValue placeholder="Icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(ICON_MAP).map(iconName => {
                             const Icon = ICON_MAP[iconName];
                             return (
                              <SelectItem key={iconName} value={iconName}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" /> 
                                  <span className="text-xs">{iconName}</span>
                                </div>
                              </SelectItem>
                             )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground">Title / Description</Label>
                       <Input 
                        value={feature.title} 
                        onChange={(e) => updateFeature(feature.id, { title: e.target.value })}
                        className="h-11"
                       />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-11 w-11 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFeature(feature.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="border-border/50 shadow-sm sticky top-6 overflow-hidden">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Live Preview</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 bg-muted/5 min-h-[400px] flex flex-col justify-center">
                 <div className="rounded-lg shadow-2xl overflow-hidden bg-slate-900 aspect-[9/16] relative border border-white/10 mx-auto w-full max-w-[280px]">
                    <div className="absolute inset-0 bg-[#0f1e35] opacity-50 z-0"></div>
                    {config.backgroundImage ? (
                      <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${config.backgroundImage})` }}></div>
                    ) : (
                      <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center pointer-events-none opacity-20">
                         <div className="w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                      </div>
                    )}
                    
                    <div className="relative z-10 p-5 h-full flex flex-col pt-10">
                      <div className="h-8 w-8 bg-white rounded-md flex items-center justify-center mb-3">
                        {config.logoUrl ? (
                          <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                          <Layout className="h-4 w-4 text-primary" style={{ color: config.primaryColor }} />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="h-1.5 w-24 bg-white/40 rounded-full"></div>
                        <div className="text-[7px] text-white/70 line-clamp-3 leading-relaxed mt-2 italic">
                          "{config.welcomeText.substring(0, 100)}..."
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-1.5">
                         {config.features.slice(0, 4).map(f => {
                           const Icon = ICON_MAP[f.iconName] || Shield;
                           return (
                            <div key={f.id} className="bg-white/5 border border-white/10 rounded p-1.5 flex flex-col gap-1">
                               <Icon className="h-2 w-2 text-primary" style={{ color: config.primaryColor }} />
                               <div className="h-0.5 w-full bg-white/20"></div>
                               <div className="h-0.5 w-2/3 bg-white/20"></div>
                            </div>
                           )
                         })}
                      </div>
                      
                      <div className="mt-auto space-y-3 pb-2">
                        <div className="space-y-1.5">
                          <div className="h-5 w-full bg-white/5 border border-white/10 rounded"></div>
                          <div className="h-5 w-full bg-white/5 border border-white/10 rounded"></div>
                        </div>
                        <div 
                          className="h-7 w-full rounded font-bold text-[9px] text-white flex items-center justify-center"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          SIGN IN
                        </div>
                        <div className="text-[6px] text-white/30 text-center uppercase tracking-widest">
                           {config.announcement.substring(0, 40)}...
                        </div>
                      </div>
                    </div>
                 </div>
              </CardContent>
              <CardDescription className="p-4 text-center text-xs">
                Preview reflects first 4 features in mobile view.
              </CardDescription>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
