import { useState } from 'react';
import { Bell, Check, Package, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

export function NotificationDropdown() {
  const { language } = useLanguage();
  const [hasUnread, setHasUnread] = useState(true);

  // Giả lập dữ liệu thông báo
  const staticNotifications = [
    {
      id: 1,
      title: language === 'vi' ? 'Chào mừng đến với DTA Studio!' : 'Welcome to DTA Studio!',
      desc: language === 'vi' ? 'Khám phá các công cụ tự động hóa đỉnh cao của chúng tôi.' : 'Discover our top-tier automation tools.',
      time: '1h',
      read: false,
      icon: Zap,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    {
      id: 2,
      title: language === 'vi' ? 'Phiên bản Web DTA v2.0' : 'Web DTA v2.0 Release',
      desc: language === 'vi' ? 'Giao diện mới, nhanh hơn và mạnh mẽ hơn.' : 'New UI, faster and more powerful.',
      time: '1d',
      read: !hasUnread,
      icon: Package,
      color: 'text-primary',
      bg: 'bg-primary/10'
    }
  ];

  const handleMarkAllRead = () => {
    setHasUnread(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-primary/10 hover:text-primary relative"
        >
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {hasUnread && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" 
              />
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 mt-2 p-0 rounded-2xl overflow-hidden glass-card">
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/30">
          <span className="font-bold">{language === 'vi' ? 'Thông báo' : 'Notifications'}</span>
          {hasUnread && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto p-1 text-xs text-primary hover:text-primary/80">
              <Check className="w-3 h-3 mr-1" />
              {language === 'vi' ? 'Đánh dấu đã đọc' : 'Mark all read'}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[300px] overflow-y-auto w-full">
          {staticNotifications.length > 0 ? (
            staticNotifications.map((noti) => (
              <DropdownMenuItem key={noti.id} className="p-4 cursor-pointer hover:bg-primary/5 focus:bg-primary/5 border-b border-white/5 last:border-0 rounded-none items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 ${noti.bg} ${noti.color}`}>
                  <noti.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium leading-none ${noti.read ? 'text-muted-foreground' : ''}`}>
                      {noti.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground">{noti.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {noti.desc}
                  </p>
                </div>
                {!noti.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {language === 'vi' ? 'Không có thông báo nào.' : 'No notifications.'}
            </div>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2 text-center">
          <Button variant="ghost" className="w-full text-xs hover:bg-primary/10 hover:text-primary">
             {language === 'vi' ? 'Xem tất cả' : 'View all'}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
