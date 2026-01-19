import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedBackground from '@/components/AnimatedBackground';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle } = useAuth();
  const { language } = useLanguage();

  const t = {
    en: {
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      phone: 'Phone Number',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      loginSuccess: 'Login successful!',
      signupSuccess: 'Account created successfully!',
      error: 'Authentication error',
    },
    vi: {
      login: 'Đăng Nhập',
      signup: 'Đăng Ký',
      email: 'Email',
      password: 'Mật khẩu',
      fullName: 'Họ và tên',
      phone: 'Số điện thoại',
      noAccount: 'Chưa có tài khoản?',
      hasAccount: 'Đã có tài khoản?',
      loginSuccess: 'Đăng nhập thành công!',
      signupSuccess: 'Tạo tài khoản thành công!',
      error: 'Lỗi xác thực',
    },
  };

  const texts = t[language];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: texts.loginSuccess,
        });
      } else {
        const { error } = await signUp(email, password, fullName, phone);
        if (error) throw error;
        toast({
          title: texts.signupSuccess,
        });
      }
    } catch (error: any) {
      toast({
        title: texts.error,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card neon-border p-8 rounded-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="DTA Studio" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold">
              {isLogin ? texts.login : texts.signup}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Họ tên - Chỉ hiển thị khi đăng ký */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">{texts.fullName}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 rounded-xl"
                    placeholder={language === 'vi' ? 'Nhập họ và tên' : 'Enter your full name'}
                    required
                  />
                </div>
              </div>
            )}

            {/* SĐT - Chỉ hiển thị khi đăng ký */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phone">{texts.phone}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 rounded-xl"
                    placeholder={language === 'vi' ? 'Nhập số điện thoại' : 'Enter your phone number'}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{texts.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{texts.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 rounded-xl"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-neon rounded-xl py-6 text-background font-bold uppercase tracking-wider"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                texts.login
              ) : (
                texts.signup
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground bg-opacity-50 backdrop-blur-sm">
                  {language === 'vi' ? 'Hoặc tiếp tục với' : 'Or continue with'}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="relative z-10 w-full rounded-xl py-6 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
              onClick={async () => {
                setLoading(true);
                try {
                  const { error } = await signInWithGoogle();
                  if (error) throw error;
                } catch (error: any) {
                  toast({
                    title: texts.error,
                    description: error.message,
                    variant: 'destructive',
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="relative z-10 mt-6 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? texts.noAccount : texts.hasAccount}{' '}
              <span className="font-semibold text-primary">
                {isLogin ? texts.signup : texts.login}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
