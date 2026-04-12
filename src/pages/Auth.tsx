import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, Building, Eye, EyeOff, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ParticleMesh from '@/components/landing/ParticleMesh';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            toast({
              title: "Email not confirmed",
              description: "Please check your inbox for the confirmation link.",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }
        navigate('/dashboard');
      } else {
        const { error } = await signUp(email, password, organizationName);
        if (error) throw error;
        toast({ title: 'Account created!', description: 'Please check your email to confirm your account.' });
        // Optional: Navigate to a "check email" page or stay on auth.
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };



  const benefits = [
    "AI-powered contract analysis in under 60 seconds",
    "50+ regulatory frameworks supported",
    "Automated liability calculations",
    "One-click compliant rewrites",
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleMesh />

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Benefits (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
          <div className="max-w-md">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-emerald-400 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">AuditEase</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight">
              {isLogin ? 'Welcome back!' : 'Start your compliance journey'}
            </h1>
            <p className="text-gray-400 mb-8 text-lg">
              {isLogin
                ? 'Sign in to continue analyzing contracts and managing compliance risks.'
                : 'Join 200+ enterprise teams protecting their organizations with AI-powered compliance.'}
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-gray-300"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  {benefit}
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-gradient-to-br from-emerald-600 to-teal-600" />
                ))}
              </div>
              <span>Trusted by 200+ legal teams worldwide</span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            {/* Mobile Back Link */}
            <Link
              to="/"
              className="lg:hidden mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-emerald-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">AuditEase</h1>
              <p className="text-gray-400 mt-1">AI-Powered Compliance Platform</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-8 backdrop-blur-xl shadow-2xl">
              {/* Trial Badge */}
              {!isLogin && (
                <div className="mb-6 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                    14-day free trial • No credit card
                  </span>
                </div>
              )}

              <div className="flex mb-6 bg-slate-800/50 rounded-xl p-1.5">
                <button
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${isLogin
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-300'
                    }`}
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </button>
                <button
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${!isLogin
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-300'
                    }`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="organization" className="text-gray-300 font-medium">Organization Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="organization"
                        type="text"
                        placeholder="Acme Corp"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        className="pl-11 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300 font-medium">Password</Label>
                    {isLogin && (
                      <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all rounded-xl text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Please wait...
                    </span>
                  ) : isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </form>


            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
