import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Save, Loader2, LogOut, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Navigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Profile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user?.user_metadata) {
      setProfileData({
        fullName: user.user_metadata.full_name || '',
        phone: user.user_metadata.phone || '',
      });
    }
  }, [user]);

  const t = {
    vi: {
      title: 'Hồ sơ cá nhân',
      subtitle: 'Quản lý thông tin và bảo mật tài khoản',
      info: 'Thông tin chung',
      security: 'Bảo mật',
      subscription: 'Gói dịch vụ',
      fullName: 'Họ và tên',
      email: 'Email liên hệ',
      phone: 'Số điện thoại',
      save: 'Lưu thay đổi',
      newPassword: 'Mật khẩu mới',
      confirmPassword: 'Xác nhận mật khẩu',
      changePassword: 'Đổi mật khẩu',
      logout: 'Đăng xuất',
      success: 'Cập nhật thành công',
      error: 'Có lỗi xảy ra',
      pwdMismatch: 'Mật khẩu không khớp!',
      pwdLength: 'Mật khẩu phải dài ít nhất 6 ký tự',
      back: 'Quay lại',
      accountType: 'Loại tài khoản',
    },
    en: {
      title: 'My Profile',
      subtitle: 'Manage your account and security',
      info: 'General Info',
      security: 'Security',
      subscription: 'Subscription',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      save: 'Save Changes',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      changePassword: 'Change Password',
      logout: 'Logout',
      success: 'Updated successfully',
      error: 'An error occurred',
      pwdMismatch: 'Passwords do not match!',
      pwdLength: 'Password must be at least 6 characters',
      back: 'Go Back',
      accountType: 'Account Type',
    },
  };

  const texts = t[language as keyof typeof t] || t.en;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          phone: profileData.phone,
        }
      });
      if (error) throw error;
      toast({ title: texts.success });
    } catch (error: any) {
      toast({ title: texts.error, description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: texts.error, description: texts.pwdMismatch, variant: 'destructive' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: texts.error, description: texts.pwdLength, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      if (error) throw error;
      toast({ title: texts.success });
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({ title: texts.error, description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Header />

      <main className="pt-32 pb-24 px-4 min-h-[calc(100vh-100px)]">
        <div className="max-w-4xl mx-auto">
          {/* Main Title Area */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{texts.title}</h1>
              <p className="text-muted-foreground">{texts.subtitle}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left Sidebar (Avatar & Quick Info) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-1 space-y-6"
            >
              <div className="glass-card rounded-2xl p-6 text-center shadow-lg">
                <div className="w-24 h-24 mx-auto rounded-full gradient-neon flex items-center justify-center mb-4 shadow-xl">
                  <User className="w-12 h-12 text-background" />
                </div>
                <h3 className="font-bold text-lg leading-tight mb-1">
                  {user.user_metadata?.full_name || 'User'}
                </h3>
                <p className="text-xs text-muted-foreground break-all">{user.email}</p>

                <div className="mt-6 pt-6 border-t border-primary/10">
                  <div className="flex items-center gap-2 justify-center text-sm font-medium">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>{user.user_metadata?.account_type || 'Free Account'}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-primary/10 rounded-xl"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {texts.logout}
              </Button>
            </motion.div>

            {/* Right Content Area (Tabs) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-3 glass-card rounded-3xl p-2 sm:p-4 shadow-lg min-h-[500px]"
            >
              <Tabs defaultValue="info" className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 glass-card bg-background/40 p-1 rounded-xl mb-6 sticky top-0 z-10">
                  <TabsTrigger value="info" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs sm:text-sm">
                    <User className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{texts.info}</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs sm:text-sm">
                    <Lock className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{texts.security}</span>
                  </TabsTrigger>
                  <TabsTrigger value="subscription" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs sm:text-sm">
                    <Shield className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{texts.subscription}</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 p-2 sm:p-4 h-full relative">
                  <AnimatePresence mode="wait">
                    <TabsContent value="info" className="mt-0 h-full">
                      <motion.form
                        key="info-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleUpdateProfile}
                        className="space-y-6 max-w-lg"
                      >
                        <div className="space-y-2 relative">
                          <Label htmlFor="email">{texts.email}</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              value={user.email}
                              disabled
                              className="pl-10 rounded-xl bg-muted/50"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">{texts.fullName}</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                    id="fullName"
                                    value={profileData.fullName}
                                    onChange={(e) => setProfileData(p => ({ ...p, fullName: e.target.value }))}
                                    className="pl-10 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">{texts.phone}</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                    id="phone"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))}
                                    className="pl-10 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="btn-neon rounded-xl text-background font-bold mt-4" disabled={loading}>
                          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          {texts.save}
                        </Button>
                      </motion.form>
                    </TabsContent>

                    <TabsContent value="security" className="mt-0 h-full">
                      <motion.form
                        key="sec-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleChangePassword}
                        className="space-y-6 max-w-md"
                      >
                        <div className="space-y-4">
                            <div className="space-y-2">
                            <Label htmlFor="newPassword">{texts.newPassword}</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                                className="pl-10 rounded-xl"
                                minLength={6}
                                required
                                />
                            </div>
                            </div>

                            <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{texts.confirmPassword}</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                                className="pl-10 rounded-xl"
                                minLength={6}
                                required
                                />
                            </div>
                            </div>
                        </div>

                        <Button type="submit" className="btn-neon rounded-xl text-background font-bold" disabled={loading}>
                          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          {texts.changePassword}
                        </Button>
                      </motion.form>
                    </TabsContent>

                    <TabsContent value="subscription" className="mt-0 h-full">
                      <motion.div
                        key="sub-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-bold mb-2">{language === 'vi' ? 'Gói hiện tại:' : 'Current Plan:'} <span className="text-primary">{user.user_metadata?.subscription_level || 'Free'}</span></h3>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'vi' ? 'Nâng cấp để truy cập toàn bộ hệ sinh thái DTA Studio.' : 'Upgrade to access the full DTA Studio ecosystem.'}
                                </p>
                            </div>
                            <Link to="/pricing">
                                <Button className="btn-neon rounded-xl font-bold text-background whitespace-nowrap">
                                    {language === 'vi' ? 'Nâng cấp ngay' : 'Upgrade Now'}
                                </Button>
                            </Link>
                        </div>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </div>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
